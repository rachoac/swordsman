package game

import (
	"math"
)

type Point struct {
	X int64
	Y int64
}

func NewPoint(x int64, y int64) *Point {
	point := Point{}
	point.X = x
	point.Y = y
	return &point
}

type Rect struct {
	ID int64
	Points []*Point
	Width int64
	Height int64
	Centered bool
}

func NewRect(ID int64, X int64, Y int64, Width int64, Height int64, centered bool) *Rect {
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

func (r *Rect) Rotate(radians float64) *Rect {
	sinTheta := Round(math.Sin(radians), 0.005)
	cosTheta := Round(math.Cos(radians), 0.005)

	for _, node := range r.Points {
		x := float64(node.X)
		y := float64(node.Y)
		xNew := x * cosTheta - y * sinTheta
		yNew := y * cosTheta + x * sinTheta
	
		node.X = Float64ToInt64(xNew)
		node.Y = Float64ToInt64(yNew)
	}

	return r
}

func (r *Rect) Visit( visitor func(*Point) ) {
	for _, node := range r.Points {
		visitor(node)
	}
}