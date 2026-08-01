package raylib

import (
	"fmt"
	"math"
)

// DiagnosticGraph tracks frame times for diagnostic UI rendering
type DiagnosticGraph struct {
	history   []float32
	maxFrames int
	index     int
}

func NewDiagnosticGraph(historyLength int) *DiagnosticGraph {
	return &DiagnosticGraph{
		history:   make([]float32, historyLength),
		maxFrames: historyLength,
	}
}

func (dg *DiagnosticGraph) AddSample(frameTimeMs float32) {
	dg.history[dg.index] = frameTimeMs
	dg.index = (dg.index + 1) % dg.maxFrames
}

func (dg *DiagnosticGraph) Draw(x, y, width, height int, title string) {
	DrawRectangle(x, y, width, height, Fade(BLACK, 0.75))
	DrawRectangleLines(x, y, width, height, DARKGRAY)

	DrawText(title, x+8, y+6, 14, SKYBLUE)

	// Draw graph grid lines (16.6ms = 60FPS target, 33.3ms = 30FPS target)
	target60Y := y + height - int((16.6/50.0)*float32(height-30))
	target30Y := y + height - int((33.3/50.0)*float32(height-30))

	DrawLine(x, target60Y, x+width, target60Y, Fade(GREEN, 0.4))
	DrawText("16.6ms (60fps)", x+width-85, target60Y-12, 10, GREEN)

	DrawLine(x, target30Y, x+width, target30Y, Fade(RED, 0.4))
	DrawText("33.3ms (30fps)", x+width-85, target30Y-12, 10, RED)

	// Plot history
	stepX := float32(width) / float32(dg.maxFrames)
	for i := 0; i < dg.maxFrames-1; i++ {
		idx1 := (dg.index + i) % dg.maxFrames
		idx2 := (dg.index + i + 1) % dg.maxFrames

		val1 := dg.history[idx1]
		val2 := dg.history[idx2]

		if val1 <= 0 || val2 <= 0 {
			continue
		}

		px1 := float32(x) + float32(i)*stepX
		py1 := float32(y+height) - (val1/50.0)*float32(height-30)

		px2 := float32(x) + float32(i+1)*stepX
		py2 := float32(y+height) - (val2/50.0)*float32(height-30)

		col := GREEN
		if val1 > 33.3 {
			col = RED
		} else if val1 > 16.6 {
			col = YELLOW
		}

		DrawLineEx(NewVector2(px1, py1), NewVector2(px2, py2), 2, col)
	}
}

// DrawSystemStatsOverlay draws a full diagnostic panel for Kairo systems
func DrawSystemStatsOverlay(x, y int, activeEntities int, systemName string) {
	width := 240
	height := 130

	DrawRectangle(x, y, width, height, Fade(Color{15, 23, 42, 255}, 0.85))
	DrawRectangleLines(x, y, width, height, SKYBLUE)

	DrawText("⚡ KAIRO SYSTEM DIAGNOSTICS", x+10, y+10, 13, GOLD)
	DrawText(fmt.Sprintf("System: %s", systemName), x+10, y+32, 12, WHITE)
	DrawText(fmt.Sprintf("Active Entities: %d", activeEntities), x+10, y+50, 12, LIME)

	ftMs := GetFrameTime() * 1000.0
	DrawText(fmt.Sprintf("Frame Delta: %.2f ms", ftMs), x+10, y+68, 12, LIGHTGRAY)
	DrawText(fmt.Sprintf("Target FPS: %d", targetFPS), x+10, y+86, 12, LIGHTGRAY)

	DrawFPS(x+10, y+104)
}

// DrawVector2DVisualizer draws a 2D vector arrow for testing velocity / physics forces
func DrawVector2DVisualizer(start, vector Vector2, scale float32, color Color) {
	end := start.Add(vector.Scale(scale))
	DrawLineEx(start, end, 2.5, color)

	// Arrowhead
	angle := float64(math.Atan2(float64(vector.Y), float64(vector.X)))
	arrowSize := float64(8.0)

	leftX := float64(end.X) - arrowSize*math.Cos(angle-math.Pi/6)
	leftY := float64(end.Y) - arrowSize*math.Sin(angle-math.Pi/6)

	rightX := float64(end.X) - arrowSize*math.Cos(angle+math.Pi/6)
	rightY := float64(end.Y) - arrowSize*math.Sin(angle+math.Pi/6)

	DrawTriangle(end, NewVector2(float32(leftX), float32(leftY)), NewVector2(float32(rightX), float32(rightY)), color)
}
