package game

type Scene struct {
	ID int64
	Position *Point
	Rects []*Rect
	LastRotation float64
}

func NewScene(ID int64, x int64, y int64) *Scene {
	scene := Scene{}
	scene.ID = ID
	scene.Position = NewPoint(x, y)
	return &scene
}

func (s *Scene) AddRect(rect *Rect) *Scene {
	rect.Visit( func(p *Point) {
		p.X += s.Position.X
		p.Y += s.Position.Y

		if rect.Centered {
			p.X -= rect.Width/2
			p.Y -= rect.Height/2
		}
	})
	s.Rects = append(s.Rects, rect)
	return s
}

func (s *Scene) SetPosition(x int64, y int64) {
	deltaX := x - s.Position.X
	deltaY := y - s.Position.Y

	s.Position.X = x
	s.Position.Y = y

	for _, rect := range s.Rects {
		func(r *Rect) {
			r.Visit( func(p *Point) {
				p.X += deltaX
				p.Y += deltaY
			})
		}(rect)
	}
}


func (s *Scene) Visit(visitor func(*Point)) {
	for _, rect := range s.Rects {
		rect.Visit(visitor)
	}
}
