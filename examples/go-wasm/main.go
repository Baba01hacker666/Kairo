package main

import (
	"math"
	"math/rand"
	"sort"
	"syscall/js"
)

// ==========================================
// KAIRO GO-WASM 3D ENGINE
// ==========================================

// --- Math ---
type Vector3 struct {
	x, y, z float64
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{v.x + other.x, v.y + other.y, v.z + other.z}
}

func (v Vector3) Rotate(ax, ay, az float64) Vector3 {
	// X-axis
	y1 := v.y*math.Cos(ax) - v.z*math.Sin(ax)
	z1 := v.y*math.Sin(ax) + v.z*math.Cos(ax)
	// Y-axis
	x2 := v.x*math.Cos(ay) + z1*math.Sin(ay)
	z2 := -v.x*math.Sin(ay) + z1*math.Cos(ay)
	// Z-axis
	x3 := x2*math.Cos(az) - y1*math.Sin(az)
	y3 := x2*math.Sin(az) + y1*math.Cos(az)
	return Vector3{x3, y3, z2}
}

// --- Engine Core ---
type Face struct {
	indices [4]int
	color   string
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

// --- Generators ---
func CreateBoxMesh(w, h, d float64, color string) *Mesh {
	hx, hy, hz := w/2.0, h/2.0, d/2.0
	return &Mesh{
		vertices: []Vector3{
			{-hx, -hy, -hz}, {hx, -hy, -hz}, {hx, hy, -hz}, {-hx, hy, -hz}, // Back
			{-hx, -hy, hz}, {hx, -hy, hz}, {hx, hy, hz}, {-hx, hy, hz},    // Front
		},
		faces: []Face{
			{[4]int{0, 1, 2, 3}, color},
			{[4]int{4, 5, 6, 7}, color},
			{[4]int{0, 3, 7, 4}, color},
			{[4]int{1, 5, 6, 2}, color},
			{[4]int{3, 2, 6, 7}, color},
			{[4]int{0, 1, 5, 4}, color},
		},
	}
}

func CreateQuadMesh(s float64, color string) *Mesh {
	hs := s / 2.0
	return &Mesh{
		vertices: []Vector3{
			{-hs, 0, -hs}, {hs, 0, -hs}, {hs, 0, hs}, {-hs, 0, hs},
		},
		faces: []Face{
			{[4]int{0, 1, 2, 3}, color},
		},
	}
}

// --- Global State ---
var (
	ctx    js.Value
	width  float64
	height float64
	scene  *Scene
	
	camAngle float64 = 0.0

	// Game logic state
	petals []*PetalState
)

type PetalState struct {
	entity     *Entity
	seed       float64
	startY     float64
	landedTime float64
}

type ProjectedFace struct {
	points [4]Vector3
	color  string
}

func project(p Vector3, cam Camera) Vector3 {
	rel := Vector3{p.x - cam.position.x, p.y - cam.position.y, p.z - cam.position.z}
	
	zDepth := -rel.z // Camera looks down -Z
	if zDepth < 0.1 {
		zDepth = 0.1
	}

	factor := cam.fov / zDepth
	x := rel.x*factor + width/2
	y := -rel.y*factor + height/2
	
	return Vector3{x: x, y: y, z: rel.z} // store original relative Z for depth sorting
}

func renderFrame(this js.Value, args []js.Value) interface{} {
	// Calculate delta time
	timeMs := js.Global().Get("performance").Call("now").Float()
	time := timeMs * 0.001
	dt := 0.016 // Assume ~60fps for simple logic

	// Animate Camera
	camAngle += 0.2 * dt
	scene.camera.position.x = math.Sin(camAngle) * 16
	scene.camera.position.z = math.Cos(camAngle) * 16
	scene.camera.position.y = 8 + math.Sin(camAngle*0.5)*2

	// Animate Petals
	for _, p := range petals {
		ent := p.entity
		pos := &ent.transform.position
		rot := &ent.transform.rotation

		if pos.y > 0.05 {
			// Falling
			pos.y -= 1.8 * dt
			pos.x += math.Sin(time*2.0+p.seed) * 1.5 * dt
			pos.z += math.Cos(time*1.5+p.seed) * 1.5 * dt
			rot.x += 1.5 * dt
			rot.y += 2.0 * dt
			rot.z += 1.0 * dt
		} else {
			// Landed
			pos.y = 0.01 + (p.seed * 0.0001) // avoid z-fighting
			rot.x = 0                          // lay flat
			rot.y = 0
			
			if p.landedTime == 0 {
				p.landedTime = time
			}

			// Respawn
			if time-p.landedTime > 6.0 {
				pos.y = p.startY
				pos.x = (rand.Float64() - 0.5) * 8
				pos.z = (rand.Float64() - 0.5) * 8
				p.landedTime = 0
			}
		}
	}

	// Clear Screen
	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)

	var pFaces []ProjectedFace

	// 1. Transform & Project
	for _, ent := range scene.entities {
		transformed := make([]Vector3, len(ent.mesh.vertices))
		for j, v := range ent.mesh.vertices {
			v.x *= ent.transform.scale.x
			v.y *= ent.transform.scale.y
			v.z *= ent.transform.scale.z
			v = v.Rotate(ent.transform.rotation.x, ent.transform.rotation.y, ent.transform.rotation.z)
			v = v.Add(ent.transform.position)
			transformed[j] = v
		}

		for _, f := range ent.mesh.faces {
			var pts [4]Vector3
			pts[0] = project(transformed[f.indices[0]], scene.camera)
			pts[1] = project(transformed[f.indices[1]], scene.camera)
			pts[2] = project(transformed[f.indices[2]], scene.camera)
			pts[3] = project(transformed[f.indices[3]], scene.camera)

			// Simple backface culling for solid boxes (Trunk, Canopy)
			// (Don't cull petals since they are double sided quads)
			if len(ent.mesh.faces) > 1 {
				// 2D Cross product of the first 3 projected vertices to find normal direction
				v1x, v1y := pts[1].x-pts[0].x, pts[1].y-pts[0].y
				v2x, v2y := pts[2].x-pts[1].x, pts[2].y-pts[1].y
				cross := (v1x * v2y) - (v1y * v2x)
				if cross < 0 {
					continue // face is pointing away from camera
				}
			}

			pFaces = append(pFaces, ProjectedFace{
				points: pts,
				color:  f.color,
			})
		}
	}

	// 2. Painter's Algorithm Sorting
	// Smaller Z (more negative) means further away
	sort.Slice(pFaces, func(i, j int) bool {
		avgZi := (pFaces[i].points[0].z + pFaces[i].points[1].z + pFaces[i].points[2].z + pFaces[i].points[3].z) / 4.0
		avgZj := (pFaces[j].points[0].z + pFaces[j].points[1].z + pFaces[j].points[2].z + pFaces[j].points[3].z) / 4.0
		return avgZi < avgZj
	})

	// 3. Draw Faces
	ctx.Set("lineWidth", 1.5)
	ctx.Set("lineJoin", "round")

	for _, pf := range pFaces {
		ctx.Set("fillStyle", pf.color)
		ctx.Set("strokeStyle", pf.color) // Match stroke to fill for seamless edges

		ctx.Call("beginPath")
		ctx.Call("moveTo", pf.points[0].x, pf.points[0].y)
		ctx.Call("lineTo", pf.points[1].x, pf.points[1].y)
		ctx.Call("lineTo", pf.points[2].x, pf.points[2].y)
		ctx.Call("lineTo", pf.points[3].x, pf.points[3].y)
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

	// --- Build Scene ---
	scene = &Scene{
		camera: Camera{position: Vector3{0, 6, 16}, fov: 600},
	}

	// 1. Ground
	ground := CreateBoxMesh(40, 0.5, 40, "rgba(74, 93, 35, 1.0)")
	scene.entities = append(scene.entities, &Entity{
		mesh:      ground,
		transform: Transform{position: Vector3{0, -0.25, 0}, scale: Vector3{1, 1, 1}},
	})

	// 2. Trunk
	trunk := CreateBoxMesh(1, 7, 1, "rgba(92, 64, 51, 1.0)")
	scene.entities = append(scene.entities, &Entity{
		mesh:      trunk,
		transform: Transform{position: Vector3{0, 3.5, 0}, scale: Vector3{1, 1, 1}},
	})

	// 3. Canopy
	canopy := CreateBoxMesh(6, 4, 6, "rgba(255, 105, 180, 0.9)")
	scene.entities = append(scene.entities, &Entity{
		mesh:      canopy,
		transform: Transform{position: Vector3{0, 7.5, 0}, scale: Vector3{1, 1, 1}},
	})

	// 4. Petals
	petalMesh := CreateQuadMesh(0.5, "rgba(255, 183, 197, 0.95)")
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

	// Start Engine Loop
	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	<-c
}
