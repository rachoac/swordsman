package game

type Scene struct {
	ID int64
	Shapes map[int64]map[int64]*Point
}

func NewScene(ID int64, x int64, y int64) *Scene {
	scene := Scene{}
	scene.ID = ID
	scene.Shapes = make(map[int64]map[int64]*Point)
	return &scene
}

func (s *Scene) Replace(shapeID int64, pointID int64, x int64, y int64) *Scene {
	points := s.Shapes[shapeID]
	if points == nil {
		points = make(map[int64]*Point)
		s.Shapes[shapeID] = points
	}
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
	for _, points := range s.Shapes {
		for _, point := range points {
			visitor(point)
		}
	}
}
