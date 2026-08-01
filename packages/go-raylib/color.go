package raylib

import (
	"fmt"
	"math"
)

// Color represents RGBA color (0-255)
type Color struct {
	R uint8
	G uint8
	B uint8
	A uint8
}

// Raylib Predefined Colors
var (
	LIGHTGRAY  = Color{200, 200, 200, 255}
	GRAY       = Color{130, 130, 130, 255}
	DARKGRAY   = Color{80, 80, 80, 255}
	YELLOW     = Color{253, 249, 0, 255}
	GOLD       = Color{255, 203, 0, 255}
	ORANGE     = Color{255, 161, 0, 255}
	PINK       = Color{255, 109, 194, 255}
	RED        = Color{230, 41, 55, 255}
	MAROON     = Color{190, 33, 55, 255}
	GREEN      = Color{0, 228, 48, 255}
	LIME       = Color{0, 158, 47, 255}
	DARKGREEN  = Color{0, 117, 44, 255}
	SKYBLUE    = Color{102, 191, 255, 255}
	BLUE       = Color{0, 121, 241, 255}
	DARKBLUE   = Color{0, 82, 172, 255}
	PURPLE     = Color{200, 122, 255, 255}
	VIOLET     = Color{135, 60, 190, 255}
	DARKPURPLE = Color{112, 31, 126, 255}
	BEIGE      = Color{211, 176, 131, 255}
	BROWN      = Color{127, 106, 79, 255}
	DARKBROWN  = Color{76, 63, 47, 255}
	WHITE      = Color{255, 255, 255, 255}
	BLACK      = Color{0, 0, 0, 255}
	BLANK      = Color{0, 0, 0, 0}
	MAGENTA    = Color{255, 0, 255, 255}
	RAYWHITE   = Color{245, 245, 245, 255}
	CYAN       = Color{0, 255, 255, 255}
)

// HexString returns the CSS hex string format for WebAssembly canvas rendering
func (c Color) HexString() string {
	if c.A == 255 {
		return fmt.Sprintf("#%02x%02x%02x", c.R, c.G, c.B)
	}
	return fmt.Sprintf("rgba(%d,%d,%d,%.3f)", c.R, c.G, c.B, float64(c.A)/255.0)
}

// Fade returns color with alpha value set to factor (0.0 to 1.0)
func Fade(color Color, alpha float32) Color {
	if alpha < 0 {
		alpha = 0
	}
	if alpha > 1 {
		alpha = 1
	}
	return Color{
		R: color.R,
		G: color.G,
		B: color.B,
		A: uint8(float32(color.A) * alpha),
	}
}

// ColorAlpha returns color with alpha component
func ColorAlpha(color Color, alpha float32) Color {
	return Fade(color, alpha)
}

// ColorFromHSV creates a Color from HSV values (hue: 0..360, saturation: 0..1, value: 0..1)
func ColorFromHSV(hue, saturation, value float32) Color {
	c := value * saturation
	x := c * (1 - float32(math.Abs(math.Mod(float64(hue/60.0), 2)-1)))
	m := value - c

	var r, g, b float32
	switch {
	case hue >= 0 && hue < 60:
		r, g, b = c, x, 0
	case hue >= 60 && hue < 120:
		r, g, b = x, c, 0
	case hue >= 120 && hue < 180:
		r, g, b = 0, c, x
	case hue >= 180 && hue < 240:
		r, g, b = 0, x, c
	case hue >= 240 && hue < 300:
		r, g, b = x, 0, c
	default:
		r, g, b = c, 0, x
	}

	return Color{
		R: uint8((r + m) * 255),
		G: uint8((g + m) * 255),
		B: uint8((b + m) * 255),
		A: 255,
	}
}
