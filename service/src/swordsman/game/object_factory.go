package game

type ObjectFactory struct {
	ObjectContainer *ObjectContainer
}

func NewObjectFactory(objectContainer *ObjectContainer) *ObjectFactory {
	objectFactory := ObjectFactory{objectContainer}

	return &objectFactory
}

func (e *ObjectFactory) CreatePlayer(x, y int64) *Object {
	player := e.ObjectContainer.CreateBlankObject()
	player.Code = "P"
	player.Type = "Player"
	player.X = x
	player.Y = y

	return player
}