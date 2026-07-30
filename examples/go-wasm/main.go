package main

import (
	"math"
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
	factor := fov / (viewerDistance + p.z)
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

var edges = [][2]int{
	{0, 1}, {1, 2}, {2, 3}, {3, 0},
	{4, 5}, {5, 6}, {6, 7}, {7, 4},
	{0, 4}, {1, 5}, {2, 6}, {3, 7},
}

func renderFrame(this js.Value, args []js.Value) interface{} {
	// Clear screen
	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)

	angle += 0.015

	// Project vertices
	projected := make([]Point2D, 8)
	for i, v := range vertices {
		r := rotate(v, angle, angle*0.7, angle*0.3)
		projected[i] = project(r)
	}

	// Draw edges with an awesome glow
	ctx.Set("strokeStyle", "#3b82f6")
	ctx.Set("lineWidth", 3)
	ctx.Set("shadowBlur", 15)
	ctx.Set("shadowColor", "#3b82f6")

	for _, edge := range edges {
		p1 := projected[edge[0]]
		p2 := projected[edge[1]]
		ctx.Call("beginPath")
		ctx.Call("moveTo", p1.x, p1.y)
		ctx.Call("lineTo", p2.x, p2.y)
		ctx.Call("stroke")
	}
	
	// Reset shadow
	ctx.Set("shadowBlur", 0)

	// Draw vertices
	ctx.Set("fillStyle", "#ffffff")
	for _, p := range projected {
		ctx.Call("beginPath")
		ctx.Call("arc", p.x, p.y, 4, 0, 2*math.Pi)
		ctx.Call("fill")
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
