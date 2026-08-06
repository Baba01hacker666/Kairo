package main

import "math"

type PhysicsWorld struct {
	Bodies  map[string]*RigidBody
	Gravity Vector3
}

func NewPhysicsWorld() *PhysicsWorld {
	return &PhysicsWorld{
		Bodies:  make(map[string]*RigidBody),
		Gravity: Vector3{0, -9.81, 0},
	}
}

func (w *PhysicsWorld) AddBody(rb *RigidBody) {
	w.Bodies[rb.ID] = rb
}

func (w *PhysicsWorld) RemoveBody(id string) {
	delete(w.Bodies, id)
}

func (w *PhysicsWorld) Step(dt float64) {
	// 1. Integrate all bodies
	for _, b := range w.Bodies {
		b.Integrate(dt, w.Gravity)
	}

	// 2. Simple Sphere-Sphere Collision Resolution (O(N^2) for simplicity, could use Grid/BVH for max optimization)
	bodiesList := make([]*RigidBody, 0, len(w.Bodies))
	for _, b := range w.Bodies {
		bodiesList = append(bodiesList, b)
	}

	for i := 0; i < len(bodiesList); i++ {
		for j := i + 1; j < len(bodiesList); j++ {
			b1 := bodiesList[i]
			b2 := bodiesList[j]

			// Skip if both are kinematic
			if b1.IsKinematic && b2.IsKinematic {
				continue
			}

			diff := b1.Position.Sub(b2.Position)
			dist := diff.Mag()
			minDist := b1.Radius + b2.Radius

			if dist < minDist {
				// Collision detected
				normal := diff.Normalize()
				if dist == 0 {
					normal = Vector3{0, 1, 0}
				}

				overlap := minDist - dist

				// Resolve penetration
				totalInvMass := b1.InverseMass + b2.InverseMass
				if totalInvMass > 0 {
					correction := normal.Mul(overlap / totalInvMass)
					if !b1.IsKinematic {
						b1.Position = b1.Position.Add(correction.Mul(b1.InverseMass))
					}
					if !b2.IsKinematic {
						b2.Position = b2.Position.Sub(correction.Mul(b2.InverseMass))
					}
				}

				// Resolve velocity
				relVel := b1.Velocity.Sub(b2.Velocity)
				velAlongNormal := relVel.Dot(normal)

				if velAlongNormal > 0 {
					continue // Moving apart
				}

				e := math.Min(b1.Restitution, b2.Restitution)
				j := -(1.0 + e) * velAlongNormal
				j /= totalInvMass

				impulse := normal.Mul(j)

				if !b1.IsKinematic {
					b1.Velocity = b1.Velocity.Add(impulse.Mul(b1.InverseMass))
				}
				if !b2.IsKinematic {
					b2.Velocity = b2.Velocity.Sub(impulse.Mul(b2.InverseMass))
				}
			}
		}
	}
}
