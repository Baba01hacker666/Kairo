package main

import (
	"syscall/js"
)

var world *PhysicsWorld

func addBody(this js.Value, args []js.Value) interface{} {
	id := args[0].String()
	mass := args[1].Float()
	radius := args[2].Float()
	x := args[3].Float()
	y := args[4].Float()
	z := args[5].Float()

	rb := NewRigidBody(id, mass, radius)
	rb.Position = Vector3{x, y, z}
	world.AddBody(rb)
	return nil
}

func applyForce(this js.Value, args []js.Value) interface{} {
	id := args[0].String()
	fx := args[1].Float()
	fy := args[2].Float()
	fz := args[3].Float()

	if rb, ok := world.Bodies[id]; ok {
		rb.ApplyForce(Vector3{fx, fy, fz})
	}
	return nil
}

func stepSimulation(this js.Value, args []js.Value) interface{} {
	dt := args[0].Float()
	world.Step(dt)
	return nil
}

func getBodyState(this js.Value, args []js.Value) interface{} {
	id := args[0].String()
	if rb, ok := world.Bodies[id]; ok {
		return map[string]interface{}{
			"id": rb.ID,
			"px": rb.Position.X,
			"py": rb.Position.Y,
			"pz": rb.Position.Z,
			"vx": rb.Velocity.X,
			"vy": rb.Velocity.Y,
			"vz": rb.Velocity.Z,
		}
	}
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	world = NewPhysicsWorld()

	js.Global().Set("KairoPhysicsAddBody", js.FuncOf(addBody))
	js.Global().Set("KairoPhysicsApplyForce", js.FuncOf(applyForce))
	js.Global().Set("KairoPhysicsStep", js.FuncOf(stepSimulation))
	js.Global().Set("KairoPhysicsGetState", js.FuncOf(getBodyState))

	println("Kairo Golang WASM Physics Backend Initialized!")
	<-c
}
