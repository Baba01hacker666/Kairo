package main

import (
	"fmt"
	"math"
	"math/rand"
	"syscall/js"

	rl "kairo/packages/go-raylib"
)

type TestMode int

const (
	Mode2DPhysics TestMode = iota
	Mode3DScene
	ModeECSStress
	ModeRaycast
)

// 2D Entity for Physics Test
type Entity2D struct {
	Pos    rl.Vector2
	Vel    rl.Vector2
	Radius float32
	Color  rl.Color
	Mass   float32
}

// Particle for ECS Stress Test
type Particle struct {
	Pos   rl.Vector2
	Vel   rl.Vector2
	Color rl.Color
}

// 3D Object for Scene Test
type Object3D struct {
	Pos    rl.Vector3
	RotY   float32
	Size   rl.Vector3
	Color  rl.Color
	Type   string // "cube", "sphere"
}

var (
	currentMode TestMode = Mode2DPhysics

	// Mode 1: 2D Physics
	entities2D []*Entity2D
	gravity    = rl.Vector2{X: 0, Y: 400.0}

	// Mode 2: 3D Scene
	camera3D rl.Camera3D
	objects3D []Object3D

	// Mode 3: ECS Stress Test
	particles []Particle
	diagGraph *rl.DiagnosticGraph

	// Mode 4: Raycast Test
	rayOrigin    rl.Vector2
	obstacles2D  []rl.Vector4 // x, y, w, h
)

func initSystem() {
	rl.InitWindow(1024, 768, "Kairo Engine - Go Raylib System Tester")
	rl.InitInputListeners()
	rl.SetTargetFPS(60)

	diagGraph = rl.NewDiagnosticGraph(120)

	init2DPhysics()
	init3DScene()
	initECSStress()
	initRaycast()
}

func init2DPhysics() {
	entities2D = []*Entity2D{}
	colors := []rl.Color{rl.RED, rl.GREEN, rl.SKYBLUE, rl.YELLOW, rl.PURPLE, rl.ORANGE, rl.GOLD}

	for i := 0; i < 20; i++ {
		entities2D = append(entities2D, &Entity2D{
			Pos:    rl.NewVector2(float32(100+rand.Intn(800)), float32(50+rand.Intn(300))),
			Vel:    rl.NewVector2(float32(rand.Intn(400)-200), float32(rand.Intn(100)-50)),
			Radius: float32(15 + rand.Intn(20)),
			Color:  colors[rand.Intn(len(colors))],
			Mass:   1.0,
		})
	}
}

func init3DScene() {
	camera3D = rl.Camera3D{
		Position:   rl.NewVector3(0, 10, 20),
		Target:     rl.NewVector3(0, 0, 0),
		Up:         rl.NewVector3(0, 1, 0),
		Fov:        60,
		Projection: rl.CameraPerspective,
	}

	objects3D = []Object3D{
		{Pos: rl.NewVector3(-4, 2, 0), Size: rl.NewVector3(2, 2, 2), Color: rl.RED, Type: "cube"},
		{Pos: rl.NewVector3(0, 3, -2), Size: rl.NewVector3(3, 3, 3), Color: rl.GOLD, Type: "cube"},
		{Pos: rl.NewVector3(4, 2, 0), Size: rl.NewVector3(2, 2, 2), Color: rl.SKYBLUE, Type: "sphere"},
		{Pos: rl.NewVector3(-2, 1, 4), Size: rl.NewVector3(1.5, 1.5, 1.5), Color: rl.LIME, Type: "sphere"},
		{Pos: rl.NewVector3(3, 1.5, 4), Size: rl.NewVector3(2, 2, 2), Color: rl.PURPLE, Type: "cube"},
	}
}

func initECSStress() {
	particles = make([]Particle, 500)
	for i := range particles {
		particles[i] = Particle{
			Pos:   rl.NewVector2(float32(rand.Intn(1024)), float32(rand.Intn(768))),
			Vel:   rl.NewVector2(float32(rand.Intn(200)-100), float32(rand.Intn(200)-100)),
			Color: rl.ColorFromHSV(float32(rand.Intn(360)), 0.8, 1.0),
		}
	}
}

func initRaycast() {
	rayOrigin = rl.NewVector2(512, 384)
	obstacles2D = []rl.Vector4{
		{X: 200, Y: 150, Z: 150, W: 120},
		{X: 650, Y: 200, Z: 180, W: 200},
		{X: 400, Y: 500, Z: 220, W: 100},
		{X: 150, Y: 450, Z: 100, W: 180},
	}
}

func updateAndDraw() {
	dt := rl.GetFrameTime()
	diagGraph.AddSample(dt * 1000.0)

	// Tab or Key 1..4 to switch test modes
	if rl.IsKeyPressed(rl.KEY_ONE) {
		currentMode = Mode2DPhysics
	}
	if rl.IsKeyPressed(rl.KEY_TWO) {
		currentMode = Mode3DScene
	}
	if rl.IsKeyPressed(rl.KEY_THREE) {
		currentMode = ModeECSStress
	}
	if rl.IsKeyPressed(rl.KEY_FOUR) {
		currentMode = ModeRaycast
	}

	rl.BeginDrawing()
	rl.ClearBackground(rl.Color{15, 23, 42, 255}) // Dark slate slate blue

	switch currentMode {
	case Mode2DPhysics:
		updateDraw2DPhysics(dt)
	case Mode3DScene:
		updateDraw3DScene(dt)
	case ModeECSStress:
		updateDrawECSStress(dt)
	case ModeRaycast:
		updateDrawRaycast(dt)
	}

	// Navigation & Mode Bar
	drawNavigationHeader()

	rl.EndDrawing()
}

func updateDraw2DPhysics(dt float32) {
	screenW := float32(rl.GetScreenWidth())
	screenH := float32(rl.GetScreenHeight())

	// Mouse interaction: spawn entity on click
	mouse := rl.GetMousePosition()
	if rl.IsMouseButtonDown(rl.MOUSE_BUTTON_LEFT) {
		if mouse.Y > 100 && mouse.Y < screenH-150 {
			entities2D = append(entities2D, &Entity2D{
				Pos:    mouse,
				Vel:    rl.NewVector2(float32(rand.Intn(400)-200), float32(-200-rand.Intn(200))),
				Radius: float32(12 + rand.Intn(18)),
				Color:  rl.ColorFromHSV(float32(rand.Intn(360)), 0.85, 1.0),
				Mass:   1.0,
			})
		}
	}

	// Update Physics
	for i, e := range entities2D {
		e.Vel = e.Vel.Add(gravity.Scale(dt))
		e.Pos = e.Pos.Add(e.Vel.Scale(dt))

		// Screen boundary bounce
		if e.Pos.X-e.Radius < 0 {
			e.Pos.X = e.Radius
			e.Vel.X *= -0.8
		}
		if e.Pos.X+e.Radius > screenW {
			e.Pos.X = screenW - e.Radius
			e.Vel.X *= -0.8
		}
		if e.Pos.Y-e.Radius < 80 {
			e.Pos.Y = 80 + e.Radius
			e.Vel.Y *= -0.8
		}
		if e.Pos.Y+e.Radius > screenH-150 {
			e.Pos.Y = screenH - 150 - e.Radius
			e.Vel.Y *= -0.85
		}

		// Inter-entity collisions
		for j := i + 1; j < len(entities2D); j++ {
			e2 := entities2D[j]
			if rl.CheckCollisionCircles(e.Pos, e.Radius, e2.Pos, e2.Radius) {
				delta := e.Pos.Sub(e2.Pos)
				dist := delta.Length()
				if dist == 0 {
					dist = 0.001
				}
				normal := delta.Normalize()
				overlap := (e.Radius + e2.Radius) - dist

				// Separate circles
				e.Pos = e.Pos.Add(normal.Scale(overlap * 0.5))
				e2.Pos = e2.Pos.Sub(normal.Scale(overlap * 0.5))

				// Elastic collision velocity exchange
				relVel := e.Vel.Sub(e2.Vel)
				velAlongNormal := relVel.Dot(normal)
				if velAlongNormal < 0 {
					impulse := -(1.8 * velAlongNormal) / 2.0
					e.Vel = e.Vel.Add(normal.Scale(impulse))
					e2.Vel = e2.Vel.Sub(normal.Scale(impulse))
				}

				// Draw contact force vector visualizer using Raylib helper
				rl.DrawVector2DVisualizer(e.Pos, normal.Scale(-30), 1.0, rl.YELLOW)
			}
		}

		// Draw entity using Raylib primitive
		rl.DrawCircleV(e.Pos, e.Radius, e.Color)
		rl.DrawCircleLines(int(e.Pos.X), int(e.Pos.Y), e.Radius, rl.WHITE)

		// Draw velocity arrow using Raylib test visualizer
		rl.DrawVector2DVisualizer(e.Pos, e.Vel, 0.1, rl.Fade(rl.WHITE, 0.6))
	}

	// Ground plane line
	rl.DrawLine(0, int(screenH-150), int(screenW), int(screenH-150), rl.GREEN)

	rl.DrawSystemStatsOverlay(20, 90, len(entities2D), "2D RigidBody Physics Engine")
	diagGraph.Draw(int(screenW)-320, 90, 300, 130, "Frame Performance (ms)")
	rl.DrawText("💡 Click anywhere to spawn bouncing physics circles!", 20, int(screenH-180), 16, rl.GOLD)
}

func updateDraw3DScene(dt float32) {
	timeVal := rl.GetTime()

	// Orbit camera around center
	camRadius := float32(22.0)
	camera3D.Position.X = float32(math.Cos(timeVal*0.5)) * camRadius
	camera3D.Position.Z = float32(math.Sin(timeVal*0.5)) * camRadius
	camera3D.Position.Y = 8.0 + float32(math.Sin(timeVal*0.3))*3.0

	// Camera WASD manual input override
	if rl.IsKeyDown(rl.KEY_W) {
		camera3D.Position.Y += 10.0 * dt
	}
	if rl.IsKeyDown(rl.KEY_S) {
		camera3D.Position.Y -= 10.0 * dt
	}

	rl.BeginMode3D(camera3D)

	// Draw 3D Ground Grid using Raylib API
	rl.DrawGrid(20, 1.5)

	// Render 3D Objects with animation
	for i := range objects3D {
		obj := &objects3D[i]
		obj.RotY += dt * 45.0

		bobY := float32(math.Sin(timeVal*2.0+float64(i))) * 0.5
		renderPos := obj.Pos
		renderPos.Y += bobY

		if obj.Type == "cube" {
			rl.DrawCube(renderPos, obj.Size.X, obj.Size.Y, obj.Size.Z, obj.Color)
		} else {
			rl.DrawSphere(renderPos, obj.Size.X*0.6, obj.Color)
		}

		// Draw bounding box
		half := obj.Size.Scale(0.55)
		box := rl.BoundingBox{
			Min: renderPos.Sub(half),
			Max: renderPos.Add(half),
		}
		rl.DrawBoundingBox(box, rl.Fade(rl.CYAN, 0.8))
	}

	// Laser Ray casting in 3D
	laserRay := rl.Ray{
		Position:  rl.NewVector3(0, 0.5, 0),
		Direction: rl.NewVector3(float32(math.Cos(timeVal*2.0)), 0.2, float32(math.Sin(timeVal*2.0))),
	}
	rl.DrawRay(laserRay, rl.RED)

	rl.EndMode3D()

	rl.DrawSystemStatsOverlay(20, 90, len(objects3D), "3D Raylib Software Engine")
	diagGraph.Draw(rl.GetScreenWidth()-320, 90, 300, 130, "3D Render Frame Graph")
	rl.DrawText("💡 Camera orbiting scene. Use W / S keys to adjust camera height!", 20, rl.GetScreenHeight()-180, 16, rl.CYAN)
}

func updateDrawECSStress(dt float32) {
	screenW := float32(rl.GetScreenWidth())
	screenH := float32(rl.GetScreenHeight())

	// Up / Down keys to adjust particle count dynamically
	if rl.IsKeyDown(rl.KEY_UP) || rl.IsKeyDown(rl.KEY_W) {
		for i := 0; i < 20; i++ {
			particles = append(particles, Particle{
				Pos:   rl.NewVector2(screenW*0.5, screenH*0.5),
				Vel:   rl.NewVector2(float32(rand.Intn(400)-200), float32(rand.Intn(400)-200)),
				Color: rl.ColorFromHSV(float32(rand.Intn(360)), 0.9, 1.0),
			})
		}
	}
	if (rl.IsKeyDown(rl.KEY_DOWN) || rl.IsKeyDown(rl.KEY_S)) && len(particles) > 50 {
		particles = particles[:len(particles)-20]
	}

	// Update particle swarm
	for i := range particles {
		p := &particles[i]
		p.Pos = p.Pos.Add(p.Vel.Scale(dt))

		if p.Pos.X < 0 || p.Pos.X > screenW {
			p.Vel.X *= -1
		}
		if p.Pos.Y < 80 || p.Pos.Y > screenH-150 {
			p.Vel.Y *= -1
		}

		// Fast drawing
		rl.DrawPixel(int(p.Pos.X), int(p.Pos.Y), p.Color)
		rl.DrawRectangle(int(p.Pos.X)-1, int(p.Pos.Y)-1, 3, 3, rl.Fade(p.Color, 0.7))
	}

	rl.DrawSystemStatsOverlay(20, 90, len(particles), "ECS High-Scale Entity Swarm")
	diagGraph.Draw(int(screenW)-320, 90, 300, 130, "ECS Frame Load (ms)")
	rl.DrawText("💡 Press UP / DOWN arrow keys to add or remove entities in real-time!", 20, int(screenH-180), 16, rl.LIME)
}

func updateDrawRaycast(dt float32) {
	timeVal := rl.GetTime()
	screenW := float32(rl.GetScreenWidth())
	screenH := float32(rl.GetScreenHeight())

	mouse := rl.GetMousePosition()
	if mouse.Y > 80 && mouse.Y < screenH-150 {
		rayOrigin = mouse
	}

	// Draw obstacles
	for _, obs := range obstacles2D {
		rl.DrawRectangle(int(obs.X), int(obs.Y), int(obs.Z), int(obs.W), rl.Color{30, 41, 59, 255})
		rl.DrawRectangleLines(int(obs.X), int(obs.Y), int(obs.Z), int(obs.W), rl.SKYBLUE)
	}

	// Cast 60 rays in a 360 circle
	numRays := 60
	for i := 0; i < numRays; i++ {
		angle := float64(i)*(2*math.Pi/float64(numRays)) + timeVal*0.5
		dir := rl.NewVector2(float32(math.Cos(angle)), float32(math.Sin(angle)))

		maxDist := float32(600.0)
		hitDist := maxDist

		// Test ray against rectangle obstacles
		for _, obs := range obstacles2D {
			if dist, hit := rayIntersectRec(rayOrigin, dir, obs); hit {
				if dist < hitDist {
					hitDist = dist
				}
			}
		}

		hitPoint := rayOrigin.Add(dir.Scale(hitDist))
		col := rl.ColorAlpha(rl.YELLOW, 0.6)
		if hitDist < maxDist {
			col = rl.ColorAlpha(rl.RED, 0.8)
			rl.DrawCircleV(hitPoint, 4, rl.GOLD)
		}

		rl.DrawLineEx(rayOrigin, hitPoint, 1.5, col)
	}

	// Center emitter
	rl.DrawCircleV(rayOrigin, 8, rl.WHITE)

	rl.DrawSystemStatsOverlay(20, 90, numRays, "Raycasting & Line-of-Sight Sensor")
	diagGraph.Draw(int(screenW)-320, 90, 300, 130, "Raycast Sensor Load")
	rl.DrawText("💡 Move mouse to position the 360° laser sensor emitter!", 20, int(screenH-180), 16, rl.GOLD)
}

func rayIntersectRec(origin, dir rl.Vector2, rec rl.Vector4) (float32, bool) {
	rx, ry, rw, rh := rec.X, rec.Y, rec.Z, rec.W

	invDirX := 1.0 / dir.X
	invDirY := 1.0 / dir.Y

	t1 := (rx - origin.X) * invDirX
	t2 := (rx + rw - origin.X) * invDirX
	t3 := (ry - origin.Y) * invDirY
	t4 := (ry + rh - origin.Y) * invDirY

	tmin := float32(math.Max(math.Min(float64(t1), float64(t2)), math.Min(float64(t3), float64(t4))))
	tmax := float32(math.Min(math.Max(float64(t1), float64(t2)), math.Max(float64(t3), float64(t4))))

	if tmax < 0 || tmin > tmax {
		return 0, false
	}
	if tmin < 0 {
		return tmax, true
	}
	return tmin, true
}

func drawNavigationHeader() {
	screenW := rl.GetScreenWidth()

	// Top Title Header Bar
	rl.DrawRectangle(0, 0, screenW, 70, rl.Color{15, 23, 42, 255})
	rl.DrawLine(0, 70, screenW, 70, rl.SKYBLUE)

	rl.DrawText("🔥 KAIRO RAYLIB GO SYSTEM TESTER", 20, 14, 22, rl.WHITE)

	// Mode buttons indicators
	modes := []struct {
		Key  string
		Name string
		Mode TestMode
	}{
		{"[1]", "2D Physics", Mode2DPhysics},
		{"[2]", "3D Scene", Mode3DScene},
		{"[3]", "ECS Stress", ModeECSStress},
		{"[4]", "Raycasting", ModeRaycast},
	}

	startX := 500
	for _, m := range modes {
		bgCol := rl.Color{30, 41, 59, 255}
		textCol := rl.LIGHTGRAY
		if currentMode == m.Mode {
			bgCol = rl.BLUE
			textCol = rl.WHITE
		}

		rl.DrawRectangleRounded(float32(startX), 15, 110, 40, 0.2, bgCol)
		rl.DrawText(fmt.Sprintf("%s %s", m.Key, m.Name), startX+8, 26, 12, textCol)
		startX += 120
	}
}

func main() {
	c := make(chan struct{}, 0)

	initSystem()

	// WASM animation loop caller
	var renderFrame js.Func
	renderFrame = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		updateAndDraw()
		js.Global().Call("requestAnimationFrame", renderFrame)
		return nil
	})

	js.Global().Call("requestAnimationFrame", renderFrame)

	// Expose Raylib WASM testing API to JavaScript
	js.Global().Set("kairoRaylib", js.ValueOf(map[string]interface{}{
		"setMode": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			if len(args) > 0 {
				m := args[0].Int()
				currentMode = TestMode(m)
			}
			return nil
		}),
		"getFPS": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return rl.GetFPS()
		}),
		"reset2D": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			init2DPhysics()
			return nil
		}),
	}))

	<-c
}
