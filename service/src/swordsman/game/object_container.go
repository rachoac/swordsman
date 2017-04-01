package game

import (
	"sync"
)

type Object struct {
	ID        int64
	OriginID  int64
	X         int64
	Y         int64
	Angle     float64
	FacingDir string
	Distance  int64

	Code string
	Type string

	Name  string
	Score int64
	Scene *Scene
}

type ObjectContainer struct {
	ObjectsByID   map[int64]*Object
	ObjectsByType map[string]map[int64]*Object
	IDSequence    int64
	S             sync.RWMutex
}

func NewObjectContainer() *ObjectContainer {
	container := ObjectContainer{}
	container.ObjectsByID = make(map[int64]*Object)
	container.ObjectsByType = make(map[string]map[int64]*Object)
	container.IDSequence = 100000

	return &container
}

func (oc *ObjectContainer) CreateBlankObject() *Object {
	oc.IDSequence = oc.IDSequence + 1
	return &Object{
		ID: oc.IDSequence,
	}
}

func (oc *ObjectContainer) WriteObject(object *Object) {
	oc.S.Lock()

	// index by ID
	oc.ObjectsByID[object.ID] = object

	// index by type
	{
		peers := oc.ObjectsByType[object.Type]
		if peers == nil {
			peers = make(map[int64]*Object)
			oc.ObjectsByType[object.Type] = peers
		}
		peers[object.ID] = object
	}
	oc.S.Unlock()
}

func (oc *ObjectContainer) DeleteObject(object *Object) {
	oc.S.Lock()

	// index by type
	{
		peers := oc.ObjectsByType[object.Type]
		delete(peers, object.ID)
	}

	// index by ID
	delete(oc.ObjectsByID, object.ID)
	oc.S.Unlock()

}

func (oc *ObjectContainer) DeleteAll() {
	oc.ObjectsByID = make(map[int64]*Object)
	oc.ObjectsByType = make(map[string]map[int64]*Object)
}

func (oc *ObjectContainer) GetObject(objectID int64) *Object {
	oc.S.RLock()
	defer oc.S.RUnlock()
	return oc.ObjectsByID[objectID]
}

func (oc *ObjectContainer) GetObjectsByType(objectType string) map[int64]*Object {
	oc.S.RLock()
	defer oc.S.RUnlock()
	return oc.ObjectsByType[objectType]
}
