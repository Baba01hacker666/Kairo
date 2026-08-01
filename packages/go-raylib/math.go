package raylib

import "math"

type Vector2 struct {
	X float32
	Y float32
}

type Vector3 struct {
	X float32
	Y float32
	Z float32
}

type Vector4 struct {
	X float32
	Y float32
	Z float32
	W float32
}

type Matrix struct {
	M0, M4, M8, M12  float32
	M1, M5, M9, M13  float32
	M2, M6, M10, M14 float32
	M3, M7, M11, M15 float32
}

type Ray struct {
	Position  Vector3
	Direction Vector3
}

type BoundingBox struct {
	Min Vector3
	Max Vector3
}

type CameraProjection int

const (
	CameraPerspective CameraProjection = iota
	CameraOrthographic
)

type Camera3D struct {
	Position   Vector3
	Target     Vector3
	Up         Vector3
	Fov        float32
	Projection CameraProjection
}

// Vector2 Math Helpers
func NewVector2(x, y float32) Vector2 {
	return Vector2{X: x, Y: y}
}

func (v Vector2) Add(other Vector2) Vector2 {
	return Vector2{X: v.X + other.X, Y: v.Y + other.Y}
}

func (v Vector2) Sub(other Vector2) Vector2 {
	return Vector2{X: v.X - other.X, Y: v.Y - other.Y}
}

func (v Vector2) Scale(s float32) Vector2 {
	return Vector2{X: v.X * s, Y: v.Y * s}
}

func (v Vector2) Length() float32 {
	return float32(math.Sqrt(float64(v.X*v.X + v.Y*v.Y)))
}

func (v Vector2) Normalize() Vector2 {
	l := v.Length()
	if l == 0 {
		return Vector2{}
	}
	return Vector2{X: v.X / l, Y: v.Y / l}
}

func (v Vector2) Dot(other Vector2) float32 {
	return v.X*other.X + v.Y*other.Y
}

func Vector2Distance(v1, v2 Vector2) float32 {
	return v1.Sub(v2).Length()
}

// Vector3 Math Helpers
func NewVector3(x, y, z float32) Vector3 {
	return Vector3{X: x, Y: y, Z: z}
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{X: v.X + other.X, Y: v.Y + other.Y, Z: v.Z + other.Z}
}

func (v Vector3) Sub(other Vector3) Vector3 {
	return Vector3{X: v.X - other.X, Y: v.Y - other.Y, Z: v.Z - other.Z}
}

func (v Vector3) Scale(s float32) Vector3 {
	return Vector3{X: v.X * s, Y: v.Y * s, Z: v.Z * s}
}

func (v Vector3) Length() float32 {
	return float32(math.Sqrt(float64(v.X*v.X + v.Y*v.Y + v.Z*v.Z)))
}

func (v Vector3) Normalize() Vector3 {
	l := v.Length()
	if l == 0 {
		return Vector3{}
	}
	return Vector3{X: v.X / l, Y: v.Y / l, Z: v.Z / l}
}

func (v Vector3) Cross(other Vector3) Vector3 {
	return Vector3{
		X: v.Y*other.Z - v.Z*other.Y,
		Y: v.Z*other.X - v.X*other.Z,
		Z: v.X*other.Y - v.Y*other.X,
	}
}

func (v Vector3) Dot(other Vector3) float32 {
	return v.X*other.X + v.Y*other.Y + v.Z*other.Z
}

func Vector3Distance(v1, v2 Vector3) float32 {
	return v1.Sub(v2).Length()
}

func Vector3Lerp(v1, v2 Vector3, amount float32) Vector3 {
	return Vector3{
		X: v1.X + (v2.X-v1.X)*amount,
		Y: v1.Y + (v2.Y-v1.Y)*amount,
		Z: v1.Z + (v2.Z-v1.Z)*amount,
	}
}

// BoundingBoxCollision checks AABB collision
func CheckCollisionBoxes(box1, box2 BoundingBox) bool {
	return (box1.Max.X >= box2.Min.X && box1.Min.X <= box2.Max.X) &&
		(box1.Max.Y >= box2.Min.Y && box1.Min.Y <= box2.Max.Y) &&
		(box1.Max.Z >= box2.Min.Z && box1.Min.Z <= box2.Max.Z)
}

// CheckCollisionCircles checks 2D circle collision
func CheckCollisionCircles(center1 Vector2, radius1 float32, center2 Vector2, radius2 float32) bool {
	dx := center1.X - center2.X
	dy := center1.Y - center2.Y
	distanceSq := dx*dx + dy*dy
	radiusSum := radius1 + radius2
	return distanceSq <= radiusSum*radiusSum
}

// CheckCollisionRecs checks 2D rectangle collision
func CheckCollisionRecs(rec1X, rec1Y, rec1W, rec1H, rec2X, rec2Y, rec2W, rec2H float32) bool {
	return (rec1X < rec2X+rec2W && rec1X+rec1W > rec2X &&
		rec1Y < rec2Y+rec2H && rec1Y+rec1H > rec2Y)
}
