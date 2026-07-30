package main

import (
	"math"
	"sort"
	"syscall/js"
)

var (
	ctx    js.Value
	width  float64
	height float64
	angle  float64 = 0.0
)

type Point3D struct {
	x, y, z float64
}

type Point2D struct {
	x, y float64
}

// Simple 3D projection
func project(p Point3D) Point2D {
	fov := 300.0
	viewerDistance := 4.0
	factor := fov / (viewerDistance - p.z) // Viewer is at +Z, so -p.z makes larger Z closer
	x := p.x*factor + width/2
	y := -p.y*factor + height/2
	return Point2D{x: x, y: y}
}

// 3D Rotation
func rotate(p Point3D, ax, ay, az float64) Point3D {
	// Rotate X
	y1 := p.y*math.Cos(ax) - p.z*math.Sin(ax)
	z1 := p.y*math.Sin(ax) + p.z*math.Cos(ax)
	// Rotate Y
	x2 := p.x*math.Cos(ay) + z1*math.Sin(ay)
	z2 := -p.x*math.Sin(ay) + z1*math.Cos(ay)
	// Rotate Z
	x3 := x2*math.Cos(az) - y1*math.Sin(az)
	y3 := x2*math.Sin(az) + y1*math.Cos(az)
	return Point3D{x: x3, y: y3, z: z2}
}

var vertices = []Point3D{
	{-1, -1, -1}, {1, -1, -1}, {1, 1, -1}, {-1, 1, -1},
	{-1, -1, 1}, {1, -1, 1}, {1, 1, 1}, {-1, 1, 1},
}

type Face struct {
	indices [4]int
	color   string
}

// Define the 6 faces of the cube with vibrant colors
var faces = []Face{
	{[4]int{0, 1, 2, 3}, "rgba(59, 130, 246, 0.85)"}, // Blue Back
	{[4]int{4, 5, 6, 7}, "rgba(139, 92, 246, 0.85)"}, // Purple Front
	{[4]int{0, 3, 7, 4}, "rgba(236, 72, 153, 0.85)"}, // Pink Left
	{[4]int{1, 5, 6, 2}, "rgba(16, 185, 129, 0.85)"}, // Green Right
	{[4]int{3, 2, 6, 7}, "rgba(245, 158, 11, 0.85)"}, // Orange Top
	{[4]int{0, 1, 5, 4}, "rgba(239, 68, 68, 0.85)"},  // Red Bottom
}

type ProjectedFace struct {
	Face
	points [4]Point2D
	z      float64
}

func renderFrame(this js.Value, args []js.Value) interface{} {
	// Clear screen
	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)

	angle += 0.015

	// Rotate and project vertices
	rotated := make([]Point3D, 8)
	projected := make([]Point2D, 8)
	for i, v := range vertices {
		r := rotate(v, angle, angle*0.7, angle*0.3)
		rotated[i] = r
		projected[i] = project(r)
	}

	// Prepare faces for painter's algorithm
	pFaces := make([]ProjectedFace, len(faces))
	for i, f := range faces {
		// Calculate average Z for depth sorting
		avgZ := (rotated[f.indices[0]].z + rotated[f.indices[1]].z + rotated[f.indices[2]].z + rotated[f.indices[3]].z) / 4.0
		
		var pts [4]Point2D
		pts[0] = projected[f.indices[0]]
		pts[1] = projected[f.indices[1]]
		pts[2] = projected[f.indices[2]]
		pts[3] = projected[f.indices[3]]

		pFaces[i] = ProjectedFace{
			Face:   f,
			points: pts,
			z:      avgZ,
		}
	}

	// Painter's Algorithm: Sort faces by Z
	// Smaller Z is further away, so we sort ascending!
	sort.Slice(pFaces, func(i, j int) bool {
		return pFaces[i].z < pFaces[j].z
	})

	// Draw sorted faces (back to front)
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
		
		ctx.Set("shadowBlur", 0) // No shadow for the stroke
		ctx.Call("stroke")
	}

	// Request next frame
	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	document := js.Global().Get("document")
	canvas := document.Call("getElementById", "canvas")
	width = canvas.Get("width").Float()
	height = canvas.Get("height").Float()
	
	// Fix resizing
	js.Global().Get("window").Call("addEventListener", "resize", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		width = js.Global().Get("window").Get("innerWidth").Float()
		height = js.Global().Get("window").Get("innerHeight").Float()
		canvas.Set("width", width)
		canvas.Set("height", height)
		return nil
	}))
	
	// Set initial size
	width = js.Global().Get("window").Get("innerWidth").Float()
	height = js.Global().Get("window").Get("innerHeight").Float()
	canvas.Set("width", width)
	canvas.Set("height", height)

	ctx = canvas.Call("getContext", "2d")

	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))

	<-c // Keep WASM running
}
