package main

import (
	"math"
)

type Point struct {
	X int64
	Y int64
}

func NewPoint(X int64, Y int64) *Point {
	point := Point{ X, Y }
	return &point
}

type Rect struct {
	ID string
	Points []*Point
	Width int64
	Height int64
	Centered bool
}

func NewRect(ID string, X int64, Y int64, Width int64, Height int64, centered bool) *Rect {
	shape := Rect{}
	shape.ID = ID
	shape.Width = Width
	shape.Height = Height

	shape.AddPoint(X, Y)
	shape.AddPoint(X + Width, Y)
	shape.AddPoint(X + Width, Y + Height)
	shape.AddPoint(X, Y + Height)
	shape.Centered = centered

	return &shape
}

func (r *Rect) AddPoint(x int64, y int64) *Rect {
	r.Points = append(r.Points, NewPoint(x, y))
	return r
}

func (r *Rect) Translate(x int64, y int64) *Rect {
	for _, point := range r.Points {
		point.X += x
		point.Y += y
	}

	return r
}

func (r *Rect) Rotate(theta float64) *Rect {
	sinTheta := math.Sin(theta)
	cosTheta := math.Cos(theta)

	for _, node := range r.Points {
		x := float64(node.X)
		y := float64(node.X)
		xNew := x * cosTheta - y * sinTheta
		yNew := y * cosTheta + x * sinTheta
	
		node.X = int64(xNew)
		node.X = int64(yNew)
	}

	return r
}
