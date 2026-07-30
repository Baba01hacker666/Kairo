package main

import (
	"encoding/json"
	"math"
	"math/rand"
	"syscall/js"
)

type EntityType string

const (
	Player  EntityType = "player"
	Tree    EntityType = "tree"
	Avocado EntityType = "avocado"
)

type Entity struct {
	ID       int        `json:"id"`
	Type     EntityType `json:"type"`
	X        float64    `json:"x"`
	Y        float64    `json:"y"`
	Z        float64    `json:"z"`
	RotY     float64    `json:"rotY"`
	Speed    float64    `json:"speed"` // Only used by player for animation blending
	Active   bool       `json:"active"`
	Radius   float64    `json:"-"`     // Physics radius, not sent to TS
	BaseY    float64    `json:"-"`     // Base Y for bobbing
	TimeOff  float64    `json:"-"`
}

var (
	entities []*Entity
	player   *Entity
	score    int = 0
	nextID   int = 1
)

func initGame() {
	entities = []*Entity{}
	score = 0
	nextID = 1

	// Spawn Player
	player = &Entity{
		ID:     nextID,
		Type:   Player,
		X:      0,
		Y:      0,
		Z:      0,
		RotY:   0,
		Speed:  0,
		Active: true,
		Radius: 0.5,
	}
	entities = append(entities, player)
	nextID++

	// Spawn 30 Trees
	for i := 0; i < 30; i++ {
		angle := rand.Float64() * math.Pi * 2
		radius := 5.0 + rand.Float64()*40.0
		entities = append(entities, &Entity{
			ID:     nextID,
			Type:   Tree,
			X:      math.Cos(angle) * radius,
			Y:      0,
			Z:      math.Sin(angle) * radius,
			RotY:   0,
			Active: true,
			Radius: 0.6,
		})
		nextID++
	}

	// Spawn 10 Avocados
	for i := 0; i < 10; i++ {
		angle := rand.Float64() * math.Pi * 2
		radius := 3.0 + rand.Float64()*20.0
		entities = append(entities, &Entity{
			ID:      nextID,
			Type:    Avocado,
			X:       math.Cos(angle) * radius,
			Y:       0.5,
			Z:       math.Sin(angle) * radius,
			RotY:    0,
			Active:  true,
			Radius:  1.5, // Interaction radius
			BaseY:   0.5,
			TimeOff: rand.Float64() * 100,
		})
		nextID++
	}
}

// update(dt, dirX, dirZ, run)
func update(this js.Value, args []js.Value) interface{} {
	dt := args[0].Float()
	dirX := args[1].Float()
	dirZ := args[2].Float()
	isRunning := args[3].Bool()

	// Normalize input direction
	dirLen := math.Sqrt(dirX*dirX + dirZ*dirZ)
	if dirLen > 0 {
		dirX /= dirLen
		dirZ /= dirLen
	}

	// Determine target speed
	targetSpeed := 0.0
	if dirLen > 0 {
		if isRunning {
			targetSpeed = 8.0
		} else {
			targetSpeed = 3.0
		}
		
		// Rotate player towards direction
		targetRot := math.Atan2(dirX, dirZ)
		// Smooth rotation
		diff := targetRot - player.RotY
		diff = math.Atan2(math.Sin(diff), math.Cos(diff)) // Normalize to -PI to PI
		player.RotY += diff * 5.0 * dt
	}

	// Lerp current speed
	player.Speed += (targetSpeed - player.Speed) * 10.0 * dt

	// Apply movement
	movementX := math.Sin(player.RotY) * player.Speed * dt
	movementZ := math.Cos(player.RotY) * player.Speed * dt
	player.X += movementX
	player.Z += movementZ

	// Physics and Interactions
	for _, ent := range entities {
		if !ent.Active {
			continue
		}

		if ent.Type == Tree {
			// Tree collision
			dx := player.X - ent.X
			dz := player.Z - ent.Z
			distSq := dx*dx + dz*dz
			minDist := player.Radius + ent.Radius
			
			if distSq < minDist*minDist {
				dist := math.Sqrt(distSq)
				if dist == 0 { dist = 1 } // prevent division by zero
				overlap := minDist - dist
				player.X += (dx / dist) * overlap
				player.Z += (dz / dist) * overlap
			}
		} else if ent.Type == Avocado {
			// Bobbing animation for avocado
			ent.TimeOff += dt * 2.0
			ent.Y = ent.BaseY + math.Sin(ent.TimeOff)*0.2
			ent.RotY += dt

			// Collection logic
			dx := player.X - ent.X
			dz := player.Z - ent.Z
			distSq := dx*dx + dz*dz
			if distSq < ent.Radius*ent.Radius {
				ent.Active = false
				score++
			}
		}
	}

	return nil
}

func getEntities(this js.Value, args []js.Value) interface{} {
	bytes, _ := json.Marshal(entities)
	return string(bytes)
}

func getScore(this js.Value, args []js.Value) interface{} {
	return score
}

func main() {
	c := make(chan struct{}, 0)

	initGame()

	// Expose Kairo Engine API to JS
	js.Global().Set("kairo", js.ValueOf(map[string]interface{}{
		"update":      js.FuncOf(update),
		"getEntities": js.FuncOf(getEntities),
		"getScore":    js.FuncOf(getScore),
		"reset":       js.FuncOf(func(this js.Value, args []js.Value) interface{} { initGame(); return nil }),
	}))

	<-c
}
