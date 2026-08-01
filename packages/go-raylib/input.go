package raylib

import "syscall/js"

type Key int
type MouseButton int

const (
	KEY_NULL Key = 0

	// Alphanumeric keys
	KEY_APOSTROPHE Key = 39
	KEY_COMMA      Key = 44
	KEY_MINUS      Key = 45
	KEY_PERIOD     Key = 46
	KEY_SLASH      Key = 47
	KEY_ZERO       Key = 48
	KEY_ONE        Key = 49
	KEY_TWO        Key = 50
	KEY_THREE      Key = 51
	KEY_FOUR       Key = 52
	KEY_FIVE       Key = 53
	KEY_SIX        Key = 54
	KEY_SEVEN      Key = 55
	KEY_EIGHT      Key = 56
	KEY_NINE       Key = 57
	KEY_SEMICOLON  Key = 59
	KEY_EQUAL      Key = 61
	KEY_A          Key = 65
	KEY_B          Key = 66
	KEY_C          Key = 67
	KEY_D          Key = 68
	KEY_E          Key = 69
	KEY_F          Key = 70
	KEY_G          Key = 71
	KEY_H          Key = 72
	KEY_I          Key = 73
	KEY_J          Key = 74
	KEY_K          Key = 75
	KEY_L          Key = 76
	KEY_M          Key = 77
	KEY_N          Key = 78
	KEY_O          Key = 79
	KEY_P          Key = 80
	KEY_Q          Key = 81
	KEY_R          Key = 82
	KEY_S          Key = 83
	KEY_T          Key = 84
	KEY_U          Key = 85
	KEY_V          Key = 86
	KEY_W          Key = 87
	KEY_X          Key = 88
	KEY_Y          Key = 89
	KEY_Z          Key = 90

	// Special Keys
	KEY_SPACE    Key = 32
	KEY_ESCAPE   Key = 256
	KEY_ENTER    Key = 257
	KEY_TAB      Key = 258
	KEY_BACKSPACE Key = 259
	KEY_RIGHT    Key = 262
	KEY_LEFT     Key = 263
	KEY_DOWN     Key = 264
	KEY_UP       Key = 265
	KEY_LEFT_SHIFT Key = 340
	KEY_LEFT_CONTROL Key = 341

	MOUSE_BUTTON_LEFT   MouseButton = 0
	MOUSE_BUTTON_RIGHT  MouseButton = 1
	MOUSE_BUTTON_MIDDLE MouseButton = 2
)

var (
	keysDown    = make(map[Key]bool)
	keysPressed = make(map[Key]bool)
	mouseDown   = make(map[MouseButton]bool)
	mousePos    Vector2
	mouseDelta  Vector2
	mouseWheel  float32
	inputInited bool
)

// InitInputListeners hooks DOM keyboard and mouse events
func InitInputListeners() {
	if inputInited {
		return
	}
	inputInited = true

	doc := js.Global().Get("document")

	// Keydown listener
	doc.Call("addEventListener", "keydown", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		keyCode := Key(e.Get("keyCode").Int())
		if !keysDown[keyCode] {
			keysPressed[keyCode] = true
		}
		keysDown[keyCode] = true
		return nil
	}))

	// Keyup listener
	doc.Call("addEventListener", "keyup", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		keyCode := Key(e.Get("keyCode").Int())
		keysDown[keyCode] = false
		return nil
	}))

	// Mousemove listener
	doc.Call("addEventListener", "mousemove", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		rect := canvas.Call("getBoundingClientRect")
		newX := float32(e.Get("clientX").Float() - rect.Get("left").Float())
		newY := float32(e.Get("clientY").Float() - rect.Get("top").Float())

		mouseDelta.X = newX - mousePos.X
		mouseDelta.Y = newY - mousePos.Y
		mousePos.X = newX
		mousePos.Y = newY
		return nil
	}))

	// Mousedowns
	doc.Call("addEventListener", "mousedown", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		btn := MouseButton(e.Get("button").Int())
		mouseDown[btn] = true
		return nil
	}))

	// Mouseups
	doc.Call("addEventListener", "mouseup", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		btn := MouseButton(e.Get("button").Int())
		mouseDown[btn] = false
		return nil
	}))

	// Touch listeners for mobile support
	canvas.Call("addEventListener", "touchstart", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		touches := e.Get("touches")
		if touches.Length() > 0 {
			t := touches.Index(0)
			rect := canvas.Call("getBoundingClientRect")
			newX := float32(t.Get("clientX").Float() - rect.Get("left").Float())
			newY := float32(t.Get("clientY").Float() - rect.Get("top").Float())

			mousePos.X = newX
			mousePos.Y = newY
			mouseDown[MOUSE_BUTTON_LEFT] = true
		}
		return nil
	}))

	canvas.Call("addEventListener", "touchmove", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		touches := e.Get("touches")
		if touches.Length() > 0 {
			t := touches.Index(0)
			rect := canvas.Call("getBoundingClientRect")
			newX := float32(t.Get("clientX").Float() - rect.Get("left").Float())
			newY := float32(t.Get("clientY").Float() - rect.Get("top").Float())

			mouseDelta.X = newX - mousePos.X
			mouseDelta.Y = newY - mousePos.Y
			mousePos.X = newX
			mousePos.Y = newY
		}
		return nil
	}))

	canvas.Call("addEventListener", "touchend", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		mouseDown[MOUSE_BUTTON_LEFT] = false
		return nil
	}))

	// Wheel
	doc.Call("addEventListener", "wheel", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		e := args[0]
		mouseWheel = float32(-e.Get("deltaY").Float() * 0.01)
		return nil
	}))
}

// SimulateVirtualKey forces key press/release state for touch UI controls
func SimulateVirtualKey(key Key, isDown bool) {
	if isDown && !keysDown[key] {
		keysPressed[key] = true
	}
	keysDown[key] = isDown
}

// IsKeyDown returns true if key is held down
func IsKeyDown(key Key) bool {
	return keysDown[key]
}

// IsKeyPressed returns true if key was pressed in current frame
func IsKeyPressed(key Key) bool {
	p := keysPressed[key]
	keysPressed[key] = false
	return p
}

// IsMouseButtonDown returns true if mouse button is held down
func IsMouseButtonDown(button MouseButton) bool {
	return mouseDown[button]
}

// GetMousePosition returns current mouse position
func GetMousePosition() Vector2 {
	return mousePos
}

// GetMouseDelta returns movement of mouse since last frame
func GetMouseDelta() Vector2 {
	d := mouseDelta
	mouseDelta = Vector2{}
	return d
}

// GetMouseWheelMove returns wheel scroll value
func GetMouseWheelMove() float32 {
	w := mouseWheel
	mouseWheel = 0
	return w
}
