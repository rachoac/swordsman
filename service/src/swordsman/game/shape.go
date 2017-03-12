package game

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
	LastRotation float64
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


func (r *Rect) Visit( visitor func(*Point) ) {
	for _, node := range r.Points {
		visitor(node)
	}
}