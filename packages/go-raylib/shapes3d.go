package raylib

import (
	"math"
)

type transform3D struct {
	viewMatrix   [16]float64
	projMatrix   [16]float64
	screenCenterX float64
	screenCenterY float64
}

var currentTrans transform3D

// BeginMode3D starts 3D drawing mode with specified camera
func BeginMode3D(camera Camera3D) {
	isDrawing3D = true
	activeCam = camera

	sw := float64(windowWidth)
	sh := float64(windowHeight)
	currentTrans.screenCenterX = sw * 0.5
	currentTrans.screenCenterY = sh * 0.5

	// Build View Matrix (LookAt)
	eye := camera.Position
	target := camera.Target
	up := camera.Up.Normalize()

	forward := target.Sub(eye).Normalize()
	right := forward.Cross(up).Normalize()
	upVector := right.Cross(forward)

	// Set view transform relative to eye
	currentTrans.viewMatrix = [16]float64{
		float64(right.X), float64(upVector.X), float64(-forward.X), 0,
		float64(right.Y), float64(upVector.Y), float64(-forward.Y), 0,
		float64(right.Z), float64(upVector.Z), float64(-forward.Z), 0,
		-float64(right.Dot(eye)), -float64(upVector.Dot(eye)), float64(forward.Dot(eye)), 1,
	}
}

// EndMode3D ends 3D drawing mode
func EndMode3D() {
	isDrawing3D = false
}

// Project3DTo2D projects world Vector3 to screen Vector2 coordinates
func Project3DTo2D(pos Vector3) (Vector2, bool) {
	// Transform to camera view space
	vm := currentTrans.viewMatrix
	vx := float64(pos.X)*vm[0] + float64(pos.Y)*vm[4] + float64(pos.Z)*vm[8] + vm[12]
	vy := float64(pos.X)*vm[1] + float64(pos.Y)*vm[5] + float64(pos.Z)*vm[9] + vm[13]
	vz := float64(pos.X)*vm[2] + float64(pos.Y)*vm[6] + float64(pos.Z)*vm[10] + vm[14]

	// Near clip plane check
	if vz <= 0.1 {
		return Vector2{}, false
	}

	fovRad := float64(activeCam.Fov) * math.Pi / 180.0
	focalLength := (float64(windowHeight) * 0.5) / math.Tan(fovRad*0.5)

	screenX := currentTrans.screenCenterX + (vx/vz)*focalLength
	screenY := currentTrans.screenCenterY - (vy/vz)*focalLength

	return Vector2{X: float32(screenX), Y: float32(screenY)}, true
}

// DrawGrid draws a 3D ground plane grid
func DrawGrid(slices int, spacing float32) {
	halfSize := float32(slices) * spacing * 0.5
	gridColor := GRAY

	for i := 0; i <= slices; i++ {
		offset := -halfSize + float32(i)*spacing
		
		// Lines parallel to X
		p1, ok1 := Project3DTo2D(NewVector3(-halfSize, 0, offset))
		p2, ok2 := Project3DTo2D(NewVector3(halfSize, 0, offset))
		if ok1 && ok2 {
			col := gridColor
			if i == slices/2 {
				col = RED // Center X axis
			}
			DrawLineV(p1, p2, col)
		}

		// Lines parallel to Z
		p3, ok3 := Project3DTo2D(NewVector3(offset, 0, -halfSize))
		p4, ok4 := Project3DTo2D(NewVector3(offset, 0, halfSize))
		if ok3 && ok4 {
			col := gridColor
			if i == slices/2 {
				col = BLUE // Center Z axis
			}
			DrawLineV(p3, p4, col)
		}
	}
}

// DrawCubeWires draws a 3D wireframe cube
func DrawCubeWires(position Vector3, width, height, length float32, color Color) {
	hw := width * 0.5
	hh := height * 0.5
	hl := length * 0.5

	vertices := [8]Vector3{
		NewVector3(position.X-hw, position.Y-hh, position.Z-hl), // 0
		NewVector3(position.X+hw, position.Y-hh, position.Z-hl), // 1
		NewVector3(position.X+hw, position.Y+hh, position.Z-hl), // 2
		NewVector3(position.X-hw, position.Y+hh, position.Z-hl), // 3
		NewVector3(position.X-hw, position.Y-hh, position.Z+hl), // 4
		NewVector3(position.X+hw, position.Y-hh, position.Z+hl), // 5
		NewVector3(position.X+hw, position.Y+hh, position.Z+hl), // 6
		NewVector3(position.X-hw, position.Y+hh, position.Z+hl), // 7
	}

	edges := [12][2]int{
		{0, 1}, {1, 2}, {2, 3}, {3, 0},
		{4, 5}, {5, 6}, {6, 7}, {7, 4},
		{0, 4}, {1, 5}, {2, 6}, {3, 7},
	}

	for _, edge := range edges {
		p1, ok1 := Project3DTo2D(vertices[edge[0]])
		p2, ok2 := Project3DTo2D(vertices[edge[1]])
		if ok1 && ok2 {
			DrawLineV(p1, p2, color)
		}
	}
}

// DrawCube draws a shaded 3D cube
func DrawCube(position Vector3, width, height, length float32, color Color) {
	// Draw wireframe first for crisp edges
	DrawCubeWires(position, width, height, length, color)

	// Draw filled faces with basic directional shading
	hw := width * 0.5
	hh := height * 0.5
	hl := length * 0.5

	corners := [8]Vector3{
		NewVector3(position.X-hw, position.Y-hh, position.Z-hl),
		NewVector3(position.X+hw, position.Y-hh, position.Z-hl),
		NewVector3(position.X+hw, position.Y+hh, position.Z-hl),
		NewVector3(position.X-hw, position.Y+hh, position.Z-hl),
		NewVector3(position.X-hw, position.Y-hh, position.Z+hl),
		NewVector3(position.X+hw, position.Y-hh, position.Z+hl),
		NewVector3(position.X+hw, position.Y+hh, position.Z+hl),
		NewVector3(position.X-hw, position.Y+hh, position.Z+hl),
	}

	faces := [6][4]int{
		{0, 1, 2, 3}, // Back
		{5, 4, 7, 6}, // Front
		{4, 0, 3, 7}, // Left
		{1, 5, 6, 2}, // Right
		{4, 5, 1, 0}, // Bottom
		{3, 2, 6, 7}, // Top
	}

	for _, face := range faces {
		p0, ok0 := Project3DTo2D(corners[face[0]])
		p1, ok1 := Project3DTo2D(corners[face[1]])
		p2, ok2 := Project3DTo2D(corners[face[2]])
		p3, ok3 := Project3DTo2D(corners[face[3]])

		if ok0 && ok1 && ok2 && ok3 {
			DrawTriangle(p0, p1, p2, Fade(color, 0.7))
			DrawTriangle(p0, p2, p3, Fade(color, 0.7))
		}
	}
}

// DrawSphereWires draws a wireframe 3D sphere
func DrawSphereWires(centerPos Vector3, radius float32, rings, slices int, color Color) {
	for i := 0; i <= rings; i++ {
		lat0 := math.Pi * (-0.5 + float64(i-1)/float64(rings))
		z0 := float64(centerPos.Z) + math.Sin(lat0)*float64(radius)
		r0 := math.Cos(lat0) * float64(radius)

		for j := 0; j <= slices; j++ {
			lng := 2 * math.Pi * float64(j) / float64(slices)
			x := float64(centerPos.X) + math.Cos(lng)*r0
			y := float64(centerPos.Y) + math.Sin(lng)*r0

			lngNext := 2 * math.Pi * float64(j+1) / float64(slices)
			xNext := float64(centerPos.X) + math.Cos(lngNext)*r0
			yNext := float64(centerPos.Y) + math.Sin(lngNext)*r0

			p1, ok1 := Project3DTo2D(NewVector3(float32(x), float32(y), float32(z0)))
			p2, ok2 := Project3DTo2D(NewVector3(float32(xNext), float32(yNext), float32(z0)))

			if ok1 && ok2 {
				DrawLineV(p1, p2, color)
			}
		}
	}
}

// DrawSphere draws a 3D sphere
func DrawSphere(centerPos Vector3, radius float32, color Color) {
	DrawSphereWires(centerPos, radius, 12, 16, color)
}

// DrawRay draws a 3D Ray vector line
func DrawRay(ray Ray, color Color) {
	endPos := ray.Position.Add(ray.Direction.Scale(1000.0))
	p1, ok1 := Project3DTo2D(ray.Position)
	p2, ok2 := Project3DTo2D(endPos)
	if ok1 && ok2 {
		DrawLineV(p1, p2, color)
	}
}

// DrawBoundingBox draws a 3D AABB bounding box
func DrawBoundingBox(box BoundingBox, color Color) {
	center := box.Min.Add(box.Max).Scale(0.5)
	size := box.Max.Sub(box.Min)
	DrawCubeWires(center, size.X, size.Y, size.Z, color)
}
