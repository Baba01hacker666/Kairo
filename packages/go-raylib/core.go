package raylib

import (
	"syscall/js"
	"time"
)

var (
	canvas        js.Value
	ctx           js.Value
	windowWidth   int
	windowHeight  int
	windowTitle   string
	shouldClose   bool
	targetFPS     int = 60
	frameTimeSec  float32
	lastFrameTime time.Time
	startTime     time.Time
	currentFPS    int
	frameCount    int
	fpsTimer      time.Time

	// Active mode
	isDrawing3D bool
	activeCam   Camera3D
)

// InitWindow initializes the HTML5 canvas context and window configuration
func InitWindow(width, height int, title string) {
	windowWidth = width
	windowHeight = height
	windowTitle = title

	doc := js.Global().Get("document")
	canvas = doc.Call("getElementById", "canvas")
	if canvas.IsNull() || canvas.IsUndefined() {
		// Create canvas dynamically if not present
		canvas = doc.Call("createElement", "canvas")
		canvas.Set("id", "canvas")
		doc.Get("body").Call("appendChild", canvas)
	}

	canvas.Set("width", width)
	canvas.Set("height", height)

	ctx = canvas.Call("getContext", "2d")

	startTime = time.Now()
	lastFrameTime = time.Now()
	fpsTimer = time.Now()
}

// WindowShouldClose returns true if the user requested window closure
func WindowShouldClose() bool {
	return shouldClose
}

// CloseWindow clears resources and flags exit
func CloseWindow() {
	shouldClose = true
}

// SetTargetFPS sets target framerate limit
func SetTargetFPS(fps int) {
	if fps > 0 {
		targetFPS = fps
	}
}

// GetFPS returns current measured framerate
func GetFPS() int {
	return currentFPS
}

// GetFrameTime returns duration of last frame in seconds
func GetFrameTime() float32 {
	if frameTimeSec <= 0 {
		return 1.0 / 60.0
	}
	return frameTimeSec
}

// GetTime returns total elapsed time since InitWindow in seconds
func GetTime() float64 {
	return time.Since(startTime).Seconds()
}

// GetScreenWidth returns window width
func GetScreenWidth() int {
	return windowWidth
}

// GetScreenHeight returns window height
func GetScreenHeight() int {
	return windowHeight
}

// BeginDrawing prepares canvas for a new frame
func BeginDrawing() {
	now := time.Now()
	dt := now.Sub(lastFrameTime).Seconds()
	lastFrameTime = now

	if dt > 0.1 {
		dt = 0.1 // Cap max frame delta
	}
	frameTimeSec = float32(dt)

	// Calculate FPS
	frameCount++
	if now.Sub(fpsTimer) >= time.Second {
		currentFPS = frameCount
		frameCount = 0
		fpsTimer = now
	}
}

// EndDrawing flushes frame buffer
func EndDrawing() {
	// Frame completion hook if needed
}

// ClearBackground fills canvas with color
func ClearBackground(color Color) {
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("fillRect", 0, 0, windowWidth, windowHeight)
}

// GetCanvasContext exposes underlying 2D canvas context for advanced WASM ops
func GetCanvasContext() js.Value {
	return ctx
}
