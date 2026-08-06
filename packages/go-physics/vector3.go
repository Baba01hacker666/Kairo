package main

import "math"

type Vector3 struct {
	X float64
	Y float64
	Z float64
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{v.X + other.X, v.Y + other.Y, v.Z + other.Z}
}

func (v Vector3) Sub(other Vector3) Vector3 {
	return Vector3{v.X - other.X, v.Y - other.Y, v.Z - other.Z}
}

func (v Vector3) Mul(scalar float64) Vector3 {
	return Vector3{v.X * scalar, v.Y * scalar, v.Z * scalar}
}

func (v Vector3) Div(scalar float64) Vector3 {
	return Vector3{v.X / scalar, v.Y / scalar, v.Z / scalar}
}

func (v Vector3) Dot(other Vector3) float64 {
	return v.X*other.X + v.Y*other.Y + v.Z*other.Z
}

func (v Vector3) Cross(other Vector3) Vector3 {
	return Vector3{
		v.Y*other.Z - v.Z*other.Y,
		v.Z*other.X - v.X*other.Z,
		v.X*other.Y - v.Y*other.X,
	}
}

func (v Vector3) MagSq() float64 {
	return v.X*v.X + v.Y*v.Y + v.Z*v.Z
}

func (v Vector3) Mag() float64 {
	return math.Sqrt(v.MagSq())
}

func (v Vector3) Normalize() Vector3 {
	mag := v.Mag()
	if mag == 0 {
		return Vector3{0, 0, 0}
	}
	return v.Div(mag)
}
