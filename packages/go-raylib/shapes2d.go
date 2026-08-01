package raylib

import (
	"math"
)

// DrawPixel draws a single pixel
func DrawPixel(x, y int, color Color) {
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("fillRect", x, y, 1, 1)
}

// DrawLine draws a line between two points
func DrawLine(startPosX, startPosY, endPosX, endPosY int, color Color) {
	ctx.Set("strokeStyle", color.HexString())
	ctx.Set("lineWidth", 1)
	ctx.Call("beginPath")
	ctx.Call("moveTo", startPosX, startPosY)
	ctx.Call("lineTo", endPosX, endPosY)
	ctx.Call("stroke")
}

// DrawLineV draws a line using Vector2
func DrawLineV(startPos, endPos Vector2, color Color) {
	DrawLine(int(startPos.X), int(startPos.Y), int(endPos.X), int(endPos.Y), color)
}

// DrawLineEx draws a line with specified thickness
func DrawLineEx(startPos, endPos Vector2, thick float32, color Color) {
	ctx.Set("strokeStyle", color.HexString())
	ctx.Set("lineWidth", thick)
	ctx.Call("beginPath")
	ctx.Call("moveTo", startPos.X, startPos.Y)
	ctx.Call("lineTo", endPos.X, endPos.Y)
	ctx.Call("stroke")
}

// DrawRectangle draws a filled rectangle
func DrawRectangle(posX, posY, width, height int, color Color) {
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("fillRect", posX, posY, width, height)
}

// DrawRectangleV draws rectangle using Vector2 position and size
func DrawRectangleV(position, size Vector2, color Color) {
	DrawRectangle(int(position.X), int(position.Y), int(size.X), int(size.Y), color)
}

// DrawRectangleLines draws outline of a rectangle
func DrawRectangleLines(posX, posY, width, height int, color Color) {
	ctx.Set("strokeStyle", color.HexString())
	ctx.Set("lineWidth", 1)
	ctx.Call("strokeRect", posX, posY, width, height)
}

// DrawRectangleRounded draws a rounded rectangle
func DrawRectangleRounded(posX, posY, width, height float32, roundness float32, color Color) {
	radius := (width * roundness) / 2
	if radius > height/2 {
		radius = height / 2
	}

	ctx.Set("fillStyle", color.HexString())
	ctx.Call("beginPath")
	ctx.Call("moveTo", posX+radius, posY)
	ctx.Call("lineTo", posX+width-radius, posY)
	ctx.Call("quadraticCurveTo", posX+width, posY, posX+width, posY+radius)
	ctx.Call("lineTo", posX+width, posY+height-radius)
	ctx.Call("quadraticCurveTo", posX+width, posY+height, posX+width-radius, posY+height)
	ctx.Call("lineTo", posX+radius, posY+height)
	ctx.Call("quadraticCurveTo", posX, posY+height, posX, posY+height-radius)
	ctx.Call("lineTo", posX, posY+radius)
	ctx.Call("quadraticCurveTo", posX, posY, posX+radius, posY)
	ctx.Call("closePath")
	ctx.Call("fill")
}

// DrawCircle draws a filled circle
func DrawCircle(centerX, centerY int, radius float32, color Color) {
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("beginPath")
	ctx.Call("arc", centerX, centerY, radius, 0, math.Pi*2)
	ctx.Call("fill")
}

// DrawCircleV draws circle using Vector2
func DrawCircleV(center Vector2, radius float32, color Color) {
	DrawCircle(int(center.X), int(center.Y), radius, color)
}

// DrawCircleLines draws outline of a circle
func DrawCircleLines(centerX, centerY int, radius float32, color Color) {
	ctx.Set("strokeStyle", color.HexString())
	ctx.Set("lineWidth", 1)
	ctx.Call("beginPath")
	ctx.Call("arc", centerX, centerY, radius, 0, math.Pi*2)
	ctx.Call("stroke")
}

// DrawTriangle draws a filled 2D triangle
func DrawTriangle(v1, v2, v3 Vector2, color Color) {
	ctx.Set("fillStyle", color.HexString())
	ctx.Call("beginPath")
	ctx.Call("moveTo", v1.X, v1.Y)
	ctx.Call("lineTo", v2.X, v2.Y)
	ctx.Call("lineTo", v3.X, v3.Y)
	ctx.Call("closePath")
	ctx.Call("fill")
}

// DrawPoly draws a regular polygon
func DrawPoly(center Vector2, sides int, radius, rotation float32, color Color) {
	if sides < 3 {
		return
	}

	ctx.Set("fillStyle", color.HexString())
	ctx.Call("beginPath")

	angleStep := (math.Pi * 2) / float64(sides)
	rotRad := float64(rotation * math.Pi / 180.0)

	for i := 0; i < sides; i++ {
		angle := rotRad + float64(i)*angleStep
		x := float64(center.X) + math.Cos(angle)*float64(radius)
		y := float64(center.Y) + math.Sin(angle)*float64(radius)

		if i == 0 {
			ctx.Call("moveTo", x, y)
		} else {
			ctx.Call("lineTo", x, y)
		}
	}

	ctx.Call("closePath")
	ctx.Call("fill")
}
