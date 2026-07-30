package main

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
	"syscall/js"
)

// ==========================================
// KAIRO GO-WASM 3D ENGINE
// ==========================================

type Vector3 struct {
	x, y, z float64
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{v.x + other.x, v.y + other.y, v.z + other.z}
}

func (v Vector3) Rotate(ax, ay, az float64) Vector3 {
	y1 := v.y*math.Cos(ax) - v.z*math.Sin(ax)
	z1 := v.y*math.Sin(ax) + v.z*math.Cos(ax)
	x2 := v.x*math.Cos(ay) + z1*math.Sin(ay)
	z2 := -v.x*math.Sin(ay) + z1*math.Cos(ay)
	x3 := x2*math.Cos(az) - y1*math.Sin(az)
	y3 := x2*math.Sin(az) + y1*math.Cos(az)
	return Vector3{x3, y3, z2}
}

type Face struct {
	indices []int
	r, g, b float64
	alpha   float64
}

type Mesh struct {
	vertices []Vector3
	faces    []Face
}

type Transform struct {
	position Vector3
	rotation Vector3
	scale    Vector3
}

type Entity struct {
	mesh      *Mesh
	transform Transform
}

type Camera struct {
	position Vector3
	fov      float64
}

type Scene struct {
	entities []*Entity
	camera   Camera
}

// --- Procedural Geometry Generators ---

func CreateQuadMesh(s float64, r, g, b, a float64) *Mesh {
	hs := s / 2.0
	return &Mesh{
		vertices: []Vector3{{-hs, 0, -hs}, {hs, 0, -hs}, {hs, 0, hs}, {-hs, 0, hs}},
		faces:    []Face{{indices: []int{0, 1, 2, 3}, r: r, g: g, b: b, alpha: a}},
	}
}

func CreateCylinderMesh(radius, h float64, sides int, r, g, b, a float64) *Mesh {
	var verts []Vector3
	var faces []Face

	for i := 0; i < sides; i++ {
		angle := 2.0 * math.Pi * float64(i) / float64(sides)
		verts = append(verts, Vector3{math.Cos(angle) * radius, -h / 2.0, math.Sin(angle) * radius})
	}
	for i := 0; i < sides; i++ {
		angle := 2.0 * math.Pi * float64(i) / float64(sides)
		verts = append(verts, Vector3{math.Cos(angle) * (radius * 0.7), h / 2.0, math.Sin(angle) * (radius * 0.7)})
	}

	for i := 0; i < sides; i++ {
		next_i := (i + 1) % sides
		// CCW winding
		faces = append(faces, Face{
			indices: []int{i, next_i, next_i + sides, i + sides},
			r: r, g: g, b: b, alpha: a,
		})
	}
	
	var topIndices []int
	for i := sides - 1; i >= 0; i-- { // Reverse winding for top
		topIndices = append(topIndices, i+sides)
	}
	faces = append(faces, Face{indices: topIndices, r: r, g: g, b: b, alpha: a})

	return &Mesh{vertices: verts, faces: faces}
}

func CreateIcosahedronMesh(radius float64, r, g, b, a float64) *Mesh {
	t := (1.0 + math.Sqrt(5.0)) / 2.0
	verts := []Vector3{
		{-1, t, 0}, {1, t, 0}, {-1, -t, 0}, {1, -t, 0},
		{0, -1, t}, {0, 1, t}, {0, -1, -t}, {0, 1, -t},
		{t, 0, -1}, {t, 0, 1}, {-t, 0, -1}, {-t, 0, 1},
	}
	
	for i, v := range verts {
		l := math.Sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
		verts[i] = Vector3{(v.x / l) * radius, (v.y / l) * radius, (v.z / l) * radius}
	}

	indices := [][]int{
		{0, 11, 5}, {0, 5, 1}, {0, 1, 7}, {0, 7, 10}, {0, 10, 11},
		{1, 5, 9}, {5, 11, 4}, {11, 10, 2}, {10, 7, 6}, {7, 1, 8},
		{3, 9, 4}, {3, 4, 2}, {3, 2, 6}, {3, 6, 8}, {3, 8, 9},
		{4, 9, 5}, {2, 4, 11}, {6, 2, 10}, {8, 6, 7}, {9, 8, 1},
	}

	var faces []Face
	for _, idx := range indices {
		faces = append(faces, Face{indices: idx, r: r, g: g, b: b, alpha: a})
	}
	return &Mesh{vertices: verts, faces: faces}
}

// --- Global State ---
var (
	ctx    js.Value
	width  float64
	height float64
	scene  *Scene
	
	worldAngle float64 = 0.0
	petals []*PetalState
)

type PetalState struct {
	entity     *Entity
	seed       float64
	startY     float64
	landedTime float64
}

type ProjectedFace struct {
	points []Vector3
	color  string
	z      float64
}

func project(p Vector3, cam Camera) Vector3 {
	rel := Vector3{p.x - cam.position.x, p.y - cam.position.y, p.z - cam.position.z}
	zDepth := -rel.z
	if zDepth < 0.1 {
		zDepth = 0.1
	}
	factor := cam.fov / zDepth
	return Vector3{
		x: rel.x*factor + width/2, 
		y: -rel.y*factor + height/2, 
		z: rel.z,
	}
}

func renderFrame(this js.Value, args []js.Value) interface{} {
	timeMs := js.Global().Get("performance").Call("now").Float()
	time := timeMs * 0.001
	dt := 0.016

	worldAngle += 0.3 * dt
	scene.camera.position = Vector3{0, 6, 20}

	// Light Setup
	lightDir := Vector3{-0.5, 1.0, -0.5} // Light from top-left-front
	lightLen := math.Sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z)
	lightDir.x /= lightLen; lightDir.y /= lightLen; lightDir.z /= lightLen
	ambientLight := 0.3

	for _, p := range petals {
		ent := p.entity
		pos := &ent.transform.position
		rot := &ent.transform.rotation

		if p.landedTime == 0 {
			pos.y -= 1.8 * dt
			pos.x += math.Sin(time*2.0+p.seed) * 1.5 * dt
			pos.z += math.Cos(time*1.5+p.seed) * 1.5 * dt
			rot.x += 1.5 * dt
			rot.y += 2.0 * dt
			rot.z += 1.0 * dt

			landHeight := -0.15 + (p.seed * 0.0001)
			if pos.y <= landHeight {
				pos.y = landHeight
				rot.x = 0
				rot.y = p.seed
				rot.z = 0
				p.landedTime = time
			}
		} else {
			if time-p.landedTime > 6.0 {
				pos.y = p.startY
				pos.x = (rand.Float64() - 0.5) * 8
				pos.z = (rand.Float64() - 0.5) * 8
				p.landedTime = 0
			}
		}
	}

	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)

	var pFaces []ProjectedFace

	for _, ent := range scene.entities {
		transformed := make([]Vector3, len(ent.mesh.vertices))
		for j, v := range ent.mesh.vertices {
			v.x *= ent.transform.scale.x
			v.y *= ent.transform.scale.y
			v.z *= ent.transform.scale.z
			v = v.Rotate(ent.transform.rotation.x, ent.transform.rotation.y, ent.transform.rotation.z)
			v = v.Add(ent.transform.position)
			v = v.Rotate(0, worldAngle, 0)
			transformed[j] = v
		}

		isDoubleSided := len(ent.mesh.faces) == 1

		for _, f := range ent.mesh.faces {
			if len(f.indices) < 3 { continue }
			
			// 1. Calculate Face Normal in 3D Space
			p0 := transformed[f.indices[0]]
			p1 := transformed[f.indices[1]]
			p2 := transformed[f.indices[2]]
			
			v1 := Vector3{p1.x - p0.x, p1.y - p0.y, p1.z - p0.z}
			v2 := Vector3{p2.x - p0.x, p2.y - p0.y, p2.z - p0.z}
			
			nx := v1.y*v2.z - v1.z*v2.y
			ny := v1.z*v2.x - v1.x*v2.z
			nz := v1.x*v2.y - v1.y*v2.x
			
			nl := math.Sqrt(nx*nx + ny*ny + nz*nz)
			if nl > 0 { nx /= nl; ny /= nl; nz /= nl }

			// 2. Backface Culling using 3D normal
			if !isDoubleSided {
				// Vector from camera to face
				viewDirX := scene.camera.position.x - p0.x
				viewDirY := scene.camera.position.y - p0.y
				viewDirZ := scene.camera.position.z - p0.z
				if (nx*viewDirX + ny*viewDirY + nz*viewDirZ) < 0 {
					continue // Face is pointing away from camera
				}
			}

			// 3. Flat Shading (Dot product with light)
			diffuse := nx*lightDir.x + ny*lightDir.y + nz*lightDir.z
			if isDoubleSided {
				diffuse = math.Abs(diffuse) // Petals are lit from both sides
			}
			if diffuse < 0 { diffuse = 0 }
			
			intensity := ambientLight + (diffuse * 0.7)
			if intensity > 1.0 { intensity = 1.0 }

			finalR := int(f.r * intensity)
			finalG := int(f.g * intensity)
			finalB := int(f.b * intensity)
			colorStr := fmt.Sprintf("rgba(%d, %d, %d, %.2f)", finalR, finalG, finalB, f.alpha)

			// 4. Project
			var pts []Vector3
			avgZ := 0.0
			for _, idx := range f.indices {
				p := project(transformed[idx], scene.camera)
				pts = append(pts, p)
				avgZ += p.z
			}
			avgZ /= float64(len(pts))

			pFaces = append(pFaces, ProjectedFace{points: pts, color: colorStr, z: avgZ})
		}
	}

	sort.Slice(pFaces, func(i, j int) bool {
		return pFaces[i].z < pFaces[j].z
	})

	ctx.Set("lineWidth", 1.2)
	ctx.Set("lineJoin", "round")

	for _, pf := range pFaces {
		ctx.Set("fillStyle", pf.color)
		ctx.Set("strokeStyle", pf.color)

		ctx.Call("beginPath")
		ctx.Call("moveTo", pf.points[0].x, pf.points[0].y)
		for i := 1; i < len(pf.points); i++ {
			ctx.Call("lineTo", pf.points[i].x, pf.points[i].y)
		}
		ctx.Call("closePath")
		
		ctx.Call("fill")
		ctx.Call("stroke")
	}

	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	document := js.Global().Get("document")
	canvas := document.Call("getElementById", "canvas")
	
	updateCanvasSize := func() {
		width = js.Global().Get("window").Get("innerWidth").Float()
		height = js.Global().Get("window").Get("innerHeight").Float()
		canvas.Set("width", width)
		canvas.Set("height", height)
	}
	
	js.Global().Get("window").Call("addEventListener", "resize", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		updateCanvasSize()
		return nil
	}))
	updateCanvasSize()
	ctx = canvas.Call("getContext", "2d")

	scene = &Scene{
		camera: Camera{position: Vector3{0, 6, 20}, fov: 700},
	}

	// 1. Procedural Models with Base RGB Colors
	grass := CreateCylinderMesh(15.0, 0.4, 20, 74, 93, 35, 1.0)
	scene.entities = append(scene.entities, &Entity{
		mesh:      grass,
		transform: Transform{position: Vector3{0, -0.2, 0}, scale: Vector3{1, 1, 1}},
	})

	trunk := CreateCylinderMesh(0.8, 6.0, 6, 92, 64, 51, 1.0)
	scene.entities = append(scene.entities, &Entity{
		mesh:      trunk,
		transform: Transform{position: Vector3{0, 3.0, 0}, scale: Vector3{1, 1, 1}},
	})

	canopy := CreateIcosahedronMesh(4.5, 255, 105, 180, 0.95)
	scene.entities = append(scene.entities, &Entity{
		mesh:      canopy,
		transform: Transform{position: Vector3{0, 7.5, 0}, scale: Vector3{1, 0.8, 1}},
	})

	// 2. Petals
	petalMesh := CreateQuadMesh(0.4, 255, 183, 197, 0.95)
	for i := 0; i < 300; i++ {
		startY := 6.0 + rand.Float64()*4.0
		ent := &Entity{
			mesh: petalMesh,
			transform: Transform{
				position: Vector3{(rand.Float64() - 0.5) * 8, startY, (rand.Float64() - 0.5) * 8},
				rotation: Vector3{rand.Float64() * math.Pi, rand.Float64() * math.Pi, rand.Float64() * math.Pi},
				scale:    Vector3{1, 1, 1},
			},
		}
		scene.entities = append(scene.entities, ent)
		petals = append(petals, &PetalState{
			entity: ent,
			seed:   rand.Float64() * 100,
			startY: startY,
		})
	}

	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	<-c
}
