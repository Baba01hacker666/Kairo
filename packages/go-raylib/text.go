package raylib

import (
	"fmt"
)

// DrawText draws text on screen using specified position, font size, and color
func DrawText(text string, posX, posY, fontSize int, color Color) {
	ctx.Set("font", fmt.Sprintf("%dpx Inter, sans-serif", fontSize))
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("fillText", text, posX, posY+fontSize)
}

// DrawFPS draws current frames-per-second at specified position
func DrawFPS(posX, posY int) {
	fps := GetFPS()
	col := GREEN
	if fps < 30 {
		col = RED
	} else if fps < 55 {
		col = YELLOW
	}

	text := fmt.Sprintf("%d FPS", fps)
	DrawRectangle(posX-4, posY-4, 85, 30, Fade(BLACK, 0.6))
	DrawText(text, posX, posY, 20, col)
}

// MeasureText calculates pixel width of a text string
func MeasureText(text string, fontSize int) int {
	ctx.Set("font", fmt.Sprintf("%dpx Inter, sans-serif", fontSize))
	metrics := ctx.Call("measureText", text)
	return int(metrics.Get("width").Float())
}
