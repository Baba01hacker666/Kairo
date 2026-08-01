package raylib

import (
	"math"
	"sort"
)

type transform3D struct {
	viewMatrix    [16]float64
	screenCenterX float64
	screenCenterY float64
	eye           Vector3
	lightDir      Vector3
}

var currentTrans transform3D

type Triangle3D struct {
	V0, V1, V2 Vector3
	Color      Color
	AvgZ       float32
	Normal     Vector3
}

// BeginMode3D starts 3D drawing mode with specified camera
func BeginMode3D(camera Camera3D) {
	isDrawing3D = true
	activeCam = camera

	sw := float64(windowWidth)
	sh := float64(windowHeight)
	currentTrans.screenCenterX = sw * 0.5
	currentTrans.screenCenterY = sh * 0.5
	currentTrans.eye = camera.Position
	currentTrans.lightDir = NewVector3(0.5, 1.0, 0.8).Normalize()

	// Build View Matrix (LookAt)
	eye := camera.Position
	target := camera.Target
	up := camera.Up.Normalize()

	forward := target.Sub(eye).Normalize()
	right := forward.Cross(up).Normalize()
	upVector := right.Cross(forward)

	// View matrix transforms world coords to camera local space (where -Z is view direction)
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
func Project3DTo2D(pos Vector3) (Vector2, float32, bool) {
	vm := currentTrans.viewMatrix
	vx := float64(pos.X)*vm[0] + float64(pos.Y)*vm[4] + float64(pos.Z)*vm[8] + vm[12]
	vy := float64(pos.X)*vm[1] + float64(pos.Y)*vm[5] + float64(pos.Z)*vm[9] + vm[13]
	vz := float64(pos.X)*vm[2] + float64(pos.Y)*vm[6] + float64(pos.Z)*vm[10] + vm[14]

	// Near clip plane
	if vz <= 0.1 {
		return Vector2{}, float32(vz), false
	}

	fovRad := float64(activeCam.Fov) * math.Pi / 180.0
	focalLength := (float64(windowHeight) * 0.5) / math.Tan(fovRad*0.5)

	screenX := currentTrans.screenCenterX + (vx/vz)*focalLength
	screenY := currentTrans.screenCenterY - (vy/vz)*focalLength

	return Vector2{X: float32(screenX), Y: float32(screenY)}, float32(vz), true
}

// DrawGrid draws a 3D ground plane grid with center axes
func DrawGrid(slices int, spacing float32) {
	halfSize := float32(slices) * spacing * 0.5

	for i := 0; i <= slices; i++ {
		offset := -halfSize + float32(i)*spacing

		// Lines parallel to X
		p1, _, ok1 := Project3DTo2D(NewVector3(-halfSize, 0, offset))
		p2, _, ok2 := Project3DTo2D(NewVector3(halfSize, 0, offset))
		if ok1 && ok2 {
			col := GRAY
			if i == slices/2 {
				col = RED
			}
			DrawLineV(p1, p2, col)
		}

		// Lines parallel to Z
		p3, _, ok3 := Project3DTo2D(NewVector3(offset, 0, -halfSize))
		p4, _, ok4 := Project3DTo2D(NewVector3(offset, 0, halfSize))
		if ok3 && ok4 {
			col := GRAY
			if i == slices/2 {
				col = BLUE
			}
			DrawLineV(p3, p4, col)
		}
	}
}

// DrawCubeWires draws wireframe 3D cube
func DrawCubeWires(position Vector3, width, height, length float32, color Color) {
	hw := width * 0.5
	hh := height * 0.5
	hl := length * 0.5

	v := [8]Vector3{
		NewVector3(position.X-hw, position.Y-hh, position.Z-hl),
		NewVector3(position.X+hw, position.Y-hh, position.Z-hl),
		NewVector3(position.X+hw, position.Y+hh, position.Z-hl),
		NewVector3(position.X-hw, position.Y+hh, position.Z-hl),
		NewVector3(position.X-hw, position.Y-hh, position.Z+hl),
		NewVector3(position.X+hw, position.Y-hh, position.Z+hl),
		NewVector3(position.X+hw, position.Y+hh, position.Z+hl),
		NewVector3(position.X-hw, position.Y+hh, position.Z+hl),
	}

	edges := [12][2]int{
		{0, 1}, {1, 2}, {2, 3}, {3, 0},
		{4, 5}, {5, 6}, {6, 7}, {7, 4},
		{0, 4}, {1, 5}, {2, 6}, {3, 7},
	}

	for _, edge := range edges {
		p1, _, ok1 := Project3DTo2D(v[edge[0]])
		p2, _, ok2 := Project3DTo2D(v[edge[1]])
		if ok1 && ok2 {
			DrawLineEx(p1, p2, 1.5, color)
		}
	}
}

// DrawCube draws shaded 3D cube with Lambertian lighting & depth sorting
func DrawCube(position Vector3, width, height, length float32, color Color) {
	hw := width * 0.5
	hh := height * 0.5
	hl := length * 0.5

	v := [8]Vector3{
		NewVector3(position.X-hw, position.Y-hh, position.Z-hl), // 0
		NewVector3(position.X+hw, position.Y-hh, position.Z-hl), // 1
		NewVector3(position.X+hw, position.Y+hh, position.Z-hl), // 2
		NewVector3(position.X-hw, position.Y+hh, position.Z-hl), // 3
		NewVector3(position.X-hw, position.Y-hh, position.Z+hl), // 4
		NewVector3(position.X+hw, position.Y-hh, position.Z+hl), // 5
		NewVector3(position.X+hw, position.Y+hh, position.Z+hl), // 6
		NewVector3(position.X-hw, position.Y+hh, position.Z+hl), // 7
	}

	quads := [6][4]int{
		{3, 2, 1, 0}, // Back
		{4, 5, 6, 7}, // Front
		{0, 3, 7, 4}, // Left
		{5, 6, 2, 1}, // Right
		{0, 1, 5, 4}, // Bottom
		{7, 6, 2, 3}, // Top
	}

	var tris []Triangle3D

	for _, q := range quads {
		v0, v1, v2, v3 := v[q[0]], v[q[1]], v[q[2]], v[q[3]]

		// Tri 1
		n1 := v1.Sub(v0).Cross(v2.Sub(v0)).Normalize()
		tris = append(tris, Triangle3D{
			V0: v0, V1: v1, V2: v2, Normal: n1, Color: color,
			AvgZ: (v0.Z + v1.Z + v2.Z) / 3.0,
		})

		// Tri 2
		n2 := v2.Sub(v0).Cross(v3.Sub(v0)).Normalize()
		tris = append(tris, Triangle3D{
			V0: v0, V1: v2, V2: v3, Normal: n2, Color: color,
			AvgZ: (v0.Z + v1.Z + v3.Z) / 3.0,
		})
	}

	// Sort triangles by distance to camera (Painter's algorithm)
	eye := currentTrans.eye
	sort.Slice(tris, func(i, j int) bool {
		d1 := tris[i].V0.Add(tris[i].V1).Add(tris[i].V2).Scale(1.0 / 3.0).Sub(eye).Length()
		d2 := tris[j].V0.Add(tris[j].V1).Add(tris[j].V2).Scale(1.0 / 3.0).Sub(eye).Length()
		return d1 > d2
	})

	// Render triangles
	for _, t := range tris {
		// Backface culling
		viewDir := t.V0.Sub(eye).Normalize()
		if t.Normal.Dot(viewDir) >= 0 {
			continue
		}

		p0, _, ok0 := Project3DTo2D(t.V0)
		p1, _, ok1 := Project3DTo2D(t.V1)
		p2, _, ok2 := Project3DTo2D(t.V2)

		if ok0 && ok1 && ok2 {
			// Directional lighting calculation
			lightDot := t.Normal.Dot(currentTrans.lightDir)
			if lightDot < 0 {
				lightDot = 0
			}
			intensity := 0.35 + lightDot*0.65 // Ambient + Diffuse

			shadedCol := Color{
				R: uint8(float32(t.Color.R) * intensity),
				G: uint8(float32(t.Color.G) * intensity),
				B: uint8(float32(t.Color.B) * intensity),
				A: t.Color.A,
			}

			DrawTriangle(p0, p1, p2, shadedCol)
		}
	}

	DrawCubeWires(position, width, height, length, ColorAlpha(WHITE, 0.4))
}

// DrawSphere draws shaded 3D sphere
func DrawSphere(centerPos Vector3, radius float32, color Color) {
	rings := 10
	slices := 12

	var tris []Triangle3D

	for i := 0; i < rings; i++ {
		lat0 := math.Pi * (-0.5 + float64(i)/float64(rings))
		lat1 := math.Pi * (-0.5 + float64(i+1)/float64(rings))

		r0 := math.Cos(lat0) * float64(radius)
		y0 := math.Sin(lat0) * float64(radius)

		r1 := math.Cos(lat1) * float64(radius)
		y1 := math.Sin(lat1) * float64(radius)

		for j := 0; j < slices; j++ {
			lng0 := 2 * math.Pi * float64(j) / float64(slices)
			lng1 := 2 * math.Pi * float64(j+1) / float64(slices)

			v0 := NewVector3(centerPos.X+float32(math.Cos(lng0)*r0), centerPos.Y+float32(y0), centerPos.Z+float32(math.Sin(lng0)*r0))
			v1 := NewVector3(centerPos.X+float32(math.Cos(lng0)*r1), centerPos.Y+float32(y1), centerPos.Z+float32(math.Sin(lng0)*r1))
			v2 := NewVector3(centerPos.X+float32(math.Cos(lng1)*r1), centerPos.Y+float32(y1), centerPos.Z+float32(math.Sin(lng1)*r1))
			v3 := NewVector3(centerPos.X+float32(math.Cos(lng1)*r0), centerPos.Y+float32(y0), centerPos.Z+float32(math.Sin(lng1)*r0))

			n1 := v0.Sub(centerPos).Normalize()
			tris = append(tris, Triangle3D{V0: v0, V1: v1, V2: v2, Normal: n1, Color: color})
			tris = append(tris, Triangle3D{V0: v0, V1: v2, V2: v3, Normal: n1, Color: color})
		}
	}

	// Sort triangles by distance
	eye := currentTrans.eye
	sort.Slice(tris, func(i, j int) bool {
		d1 := tris[i].V0.Sub(eye).Length()
		d2 := tris[j].V0.Sub(eye).Length()
		return d1 > d2
	})

	for _, t := range tris {
		viewDir := t.V0.Sub(eye).Normalize()
		if t.Normal.Dot(viewDir) >= 0 {
			continue
		}

		p0, _, ok0 := Project3DTo2D(t.V0)
		p1, _, ok1 := Project3DTo2D(t.V1)
		p2, _, ok2 := Project3DTo2D(t.V2)

		if ok0 && ok1 && ok2 {
			lightDot := t.Normal.Dot(currentTrans.lightDir)
			if lightDot < 0 {
				lightDot = 0
			}
			intensity := 0.3 + lightDot*0.7

			shadedCol := Color{
				R: uint8(float32(t.Color.R) * intensity),
				G: uint8(float32(t.Color.G) * intensity),
				B: uint8(float32(t.Color.B) * intensity),
				A: t.Color.A,
			}

			DrawTriangle(p0, p1, p2, shadedCol)
		}
	}
}

// DrawSphereWires draws wireframe 3D sphere
func DrawSphereWires(centerPos Vector3, radius float32, rings, slices int, color Color) {
	DrawSphere(centerPos, radius, color)
}

// DrawCylinder draws 3D shaded cylinder
func DrawCylinder(position Vector3, radiusTop, radiusBottom, height float32, slices int, color Color) {
	halfH := height * 0.5

	for i := 0; i < slices; i++ {
		angle0 := 2 * math.Pi * float64(i) / float64(slices)
		angle1 := 2 * math.Pi * float64(i+1) / float64(slices)

		x0Top := position.X + float32(math.Cos(angle0))*radiusTop
		z0Top := position.Z + float32(math.Sin(angle0))*radiusTop

		x1Top := position.X + float32(math.Cos(angle1))*radiusTop
		z1Top := position.Z + float32(math.Sin(angle1))*radiusTop

		x0Bot := position.X + float32(math.Cos(angle0))*radiusBottom
		z0Bot := position.Z + float32(math.Sin(angle0))*radiusBottom

		x1Bot := position.X + float32(math.Cos(angle1))*radiusBottom
		z1Bot := position.Z + float32(math.Sin(angle1))*radiusBottom

		v0 := NewVector3(x0Top, position.Y+halfH, z0Top)
		v1 := NewVector3(x1Top, position.Y+halfH, z1Top)
		v2 := NewVector3(x1Bot, position.Y-halfH, z1Bot)
		v3 := NewVector3(x0Bot, position.Y-halfH, z0Bot)

		p0, _, ok0 := Project3DTo2D(v0)
		p1, _, ok1 := Project3DTo2D(v1)
		p2, _, ok2 := Project3DTo2D(v2)
		p3, _, ok3 := Project3DTo2D(v3)

		if ok0 && ok1 && ok2 && ok3 {
			DrawTriangle(p0, p1, p2, Fade(color, 0.8))
			DrawTriangle(p0, p2, p3, Fade(color, 0.8))
		}
	}
}

// DrawRay draws 3D Ray vector line
func DrawRay(ray Ray, color Color) {
	endPos := ray.Position.Add(ray.Direction.Scale(1000.0))
	p1, _, ok1 := Project3DTo2D(ray.Position)
	p2, _, ok2 := Project3DTo2D(endPos)
	if ok1 && ok2 {
		DrawLineEx(p1, p2, 2.5, color)
	}
}

// DrawBoundingBox draws 3D AABB wireframe box
func DrawBoundingBox(box BoundingBox, color Color) {
	center := box.Min.Add(box.Max).Scale(0.5)
	size := box.Max.Sub(box.Min)
	DrawCubeWires(center, size.X, size.Y, size.Z, color)
}
