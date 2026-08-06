package main

type RigidBody struct {
	ID             string
	Position       Vector3
	Velocity       Vector3
	Force          Vector3
	Mass           float64
	InverseMass    float64
	Restitution    float64
	IsKinematic    bool
	Radius         float64 // for sphere collision
}

func NewRigidBody(id string, mass float64, radius float64) *RigidBody {
	invMass := 0.0
	if mass > 0 {
		invMass = 1.0 / mass
	}
	return &RigidBody{
		ID:          id,
		Mass:        mass,
		InverseMass: invMass,
		Restitution: 0.5,
		Radius:      radius,
		IsKinematic: mass <= 0,
	}
}

func (rb *RigidBody) ApplyForce(f Vector3) {
	if !rb.IsKinematic {
		rb.Force = rb.Force.Add(f)
	}
}

func (rb *RigidBody) Integrate(dt float64, gravity Vector3) {
	if rb.IsKinematic {
		return
	}

	// Apply gravity
	rb.ApplyForce(gravity.Mul(rb.Mass))

	// a = F / m
	acceleration := rb.Force.Mul(rb.InverseMass)

	// v = v + a*dt
	rb.Velocity = rb.Velocity.Add(acceleration.Mul(dt))

	// p = p + v*dt
	rb.Position = rb.Position.Add(rb.Velocity.Mul(dt))

	// clear force
	rb.Force = Vector3{0, 0, 0}
}
