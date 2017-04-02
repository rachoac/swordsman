package game

type Scene struct {
	ID int64
	Shapes map[int64]*Shape
	Sword *Shape
	Body map[int64]*Shape
	Head *Shape
}

type Shape struct {
	Label string
	Points map[int64]*Point
	X1 int64
	Y1 int64
	X2 int64
	Y2 int64
}

func (b *Shape) Collision(other *Shape) bool {
	return !(other.X1 > b.X2 || other.X2 < b.X1 || other.Y1 > b.Y2 || other.Y2 < b.Y1)
}

func NewScene(ID int64, x int64, y int64) *Scene {
	scene := Scene{}
	scene.ID = ID
	scene.Shapes = make(map[int64]*Shape)
	scene.Body = make(map[int64]*Shape)
	return &scene
}

func (s *Scene) Replace(shapeID int64, label string, pointID int64, x int64, y int64, pointLabel string) *Scene {
	shape := s.Shapes[shapeID]
	if shape == nil {
		shape = &(Shape{Points: make(map[int64]*Point)})
		s.Shapes[shapeID] = shape
	}
	shape.Label = label

	if label == "sword" {
		s.Sword = shape
	}
	if label == "head" {
		s.Head = shape
	}
	if label == "body" {
		s.Body[shapeID] = shape
	}

	points := shape.Points
	point := points[pointID]
	if point == nil {
		point = NewPoint(x, y)
		points[pointID] = point
	}
	point.X = x
	point.Y = y

	if pointLabel == "tl" {
		shape.X1 = point.X
		shape.Y1 = point.Y
	}
	if pointLabel == "br" {
		shape.X2 = point.X
		shape.Y2 = point.Y
	}

	return s
}

func (s *Scene) Visit(visitor func(*Point)) {
	for _, shape := range s.Shapes {
		for _, point := range shape.Points {
			visitor(point)
		}
	}
}
