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
}

func NewScene(ID int64, x int64, y int64) *Scene {
	scene := Scene{}
	scene.ID = ID
	scene.Shapes = make(map[int64]*Shape)
	scene.Body = make(map[int64]*Shape)
	return &scene
}

func (s *Scene) Replace(shapeID int64, label string, pointID int64, x int64, y int64) *Scene {
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
	return s
}

func (s *Scene) Visit(visitor func(*Point)) {
	for _, shape := range s.Shapes {
		for _, point := range shape.Points {
			visitor(point)
		}
	}
}
