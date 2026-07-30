package main

import (
	"math"
	"sort"
	"syscall/js"
)

// ==========================================
// KAIRO GO-WASM ENGINE
// ==========================================

// --- Math ---
type Vector3 struct {
	x, y, z float64
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{v.x + other.x, v.y + other.y, v.z + other.z}
}

// Rotate using Euler angles
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

// --- Global State ---
var (
	ctx    js.Value
	width  float64
	height float64
	scene  *Scene
)

type ProjectedFace struct {
	points [4]Vector3 // keeping Z for depth sorting
	color  string
}

// Projects 3D world coordinates to 2D screen coordinates relative to camera
func project(p Vector3, cam Camera) Vector3 {
	rel := Vector3{p.x - cam.position.x, p.y - cam.position.y, p.z - cam.position.z}
	
	zDepth := -rel.z // Camera looks down -Z
	if zDepth < 0.1 {
		zDepth = 0.1 // Prevent divide by zero behind camera
	}

	factor := cam.fov / zDepth
	x := rel.x*factor + width/2
	y := -rel.y*factor + height/2
	
	// Store relative Z in the projected point for painter's algorithm
	return Vector3{x: x, y: y, z: rel.z}
}

// Main Render Loop
func renderFrame(this js.Value, args []js.Value) interface{} {
	// Clear screen
	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)

	var pFaces []ProjectedFace

	for i, ent := range scene.entities {
		// Animate rotations differently per entity
		ent.transform.rotation.x += 0.01 * float64(i+1)
		ent.transform.rotation.y += 0.015 * float64(i+1)

		// 1. Transform Vertices
		transformed := make([]Vector3, len(ent.mesh.vertices))
		for j, v := range ent.mesh.vertices {
			v.x *= ent.transform.scale.x
			v.y *= ent.transform.scale.y
			v.z *= ent.transform.scale.z
			v = v.Rotate(ent.transform.rotation.x, ent.transform.rotation.y, ent.transform.rotation.z)
			v = v.Add(ent.transform.position)
			transformed[j] = v
		}

		// 2. Project Faces
		for _, f := range ent.mesh.faces {
			var pts [4]Vector3
			pts[0] = project(transformed[f.indices[0]], scene.camera)
			pts[1] = project(transformed[f.indices[1]], scene.camera)
			pts[2] = project(transformed[f.indices[2]], scene.camera)
			pts[3] = project(transformed[f.indices[3]], scene.camera)

			pFaces = append(pFaces, ProjectedFace{
				points: pts,
				color:  f.color,
			})
		}
	}

	// 3. Painter's Algorithm Sorting
	// Sort by average Z. Smaller Z (more negative) means further away!
	sort.Slice(pFaces, func(i, j int) bool {
		avgZi := (pFaces[i].points[0].z + pFaces[i].points[1].z + pFaces[i].points[2].z + pFaces[i].points[3].z) / 4.0
		avgZj := (pFaces[j].points[0].z + pFaces[j].points[1].z + pFaces[j].points[2].z + pFaces[j].points[3].z) / 4.0
		return avgZi < avgZj
	})

	// 4. Draw Faces (Back to Front)
	ctx.Set("lineWidth", 2)
	ctx.Set("lineJoin", "round")

	for _, pf := range pFaces {
		ctx.Set("fillStyle", pf.color)
		ctx.Set("strokeStyle", "#ffffff")
		ctx.Set("shadowBlur", 15)
		ctx.Set("shadowColor", pf.color)

		ctx.Call("beginPath")
		ctx.Call("moveTo", pf.points[0].x, pf.points[0].y)
		ctx.Call("lineTo", pf.points[1].x, pf.points[1].y)
		ctx.Call("lineTo", pf.points[2].x, pf.points[2].y)
		ctx.Call("lineTo", pf.points[3].x, pf.points[3].y)
		ctx.Call("closePath")
		
		ctx.Call("fill")
		ctx.Set("shadowBlur", 0)
		ctx.Call("stroke")
	}

	// Loop
	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	document := js.Global().Get("document")
	canvas := document.Call("getElementById", "canvas")
	width = canvas.Get("width").Float()
	height = canvas.Get("height").Float()
	
	js.Global().Get("window").Call("addEventListener", "resize", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		width = js.Global().Get("window").Get("innerWidth").Float()
		height = js.Global().Get("window").Get("innerHeight").Float()
		canvas.Set("width", width)
		canvas.Set("height", height)
		return nil
	}))
	
	width = js.Global().Get("window").Get("innerWidth").Float()
	height = js.Global().Get("window").Get("innerHeight").Float()
	canvas.Set("width", width)
	canvas.Set("height", height)
	ctx = canvas.Call("getContext", "2d")

	// --- Build Scene ---
	scene = &Scene{
		camera: Camera{position: Vector3{0, 0, 8}, fov: 400},
	}

	// Reusable Cube Mesh
	cubeMesh := &Mesh{
		vertices: []Vector3{
			{-1, -1, -1}, {1, -1, -1}, {1, 1, -1}, {-1, 1, -1},
			{-1, -1,  1}, {1, -1,  1}, {1, 1,  1}, {-1, 1,  1},
		},
		faces: []Face{
			{[4]int{0, 1, 2, 3}, "rgba(59, 130, 246, 0.85)"}, // Blue
			{[4]int{4, 5, 6, 7}, "rgba(139, 92, 246, 0.85)"}, // Purple
			{[4]int{0, 3, 7, 4}, "rgba(236, 72, 153, 0.85)"}, // Pink
			{[4]int{1, 5, 6, 2}, "rgba(16, 185, 129, 0.85)"}, // Green
			{[4]int{3, 2, 6, 7}, "rgba(245, 158, 11, 0.85)"}, // Orange
			{[4]int{0, 1, 5, 4}, "rgba(239, 68, 68, 0.85)"},  // Red
		},
	}

	// Add Left Cube
	scene.entities = append(scene.entities, &Entity{
		mesh: cubeMesh,
		transform: Transform{
			position: Vector3{-2.5, 0, 0},
			scale:    Vector3{1.2, 1.2, 1.2},
		},
	})
	
	// Add Right Cube
	scene.entities = append(scene.entities, &Entity{
		mesh: cubeMesh,
		transform: Transform{
			position: Vector3{2.5, 0, 0},
			scale:    Vector3{1.2, 1.2, 1.2},
		},
	})

	// Start Engine Loop
	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	<-c
}
