package game

import (
	"time"
	"strings"
	log "github.com/Sirupsen/logrus"
)

type Engine struct {
	Width int64
	Height int64
	Running bool
	Tick int64

	eventStream chan []byte
	ObjectContainer *ObjectContainer
	ObjectFactory *ObjectFactory
	ProtocolHandler *ProtocolHandler

	hub *Hub
	seq int64
}

func NewEngine(
	width int64,
	height int64,
) *Engine {
	container := NewObjectContainer()
	factory := NewObjectFactory(container)
	protocol := NewProtocolHandler()
	engine := Engine{
		Width: width,
		Height: height,
		ObjectContainer: container,
		ObjectFactory: factory,
		ProtocolHandler: protocol,
	}

	return &engine
}

func (e *Engine) SetHub(hub *Hub) {
	e.hub = hub
}

func (e *Engine) NewPlayer() int64 {
	// random world position
	x := RandomNumber(0, e.Width)
	y := RandomNumber(0, e.Height)

	player := e.ObjectFactory.CreatePlayer(x, y)
	e.ObjectContainer.WriteObject(player)
	log.Info("New player created, id ", player.ID)

	scene := NewScene(player.ID, 250, 50)
	e.seq++
	scene.AddRect(NewRect(e.seq, 76, 30, 41, 38, false))
	e.seq++
	scene.AddRect(NewRect(e.seq, 60, 70, 68, 64, false))
	e.seq++
	scene.AddRect(NewRect(e.seq, 65, 134, 56, 36, false))

	player.Scene = scene

	e.broadcastScene(scene)

	return player.ID
}

func (e *Engine) broadcastScene(scene *Scene) {
	for _, rect := range scene.Rects {
		e.broadcast(e.ProtocolHandler.asRect(rect))
	}
}

func (e *Engine) broadcast(message string) {
	go e.hub.sendToAll([]byte(message))
}

func (e *Engine) sendToPlayer(playerID int64, message string) {
	go e.hub.send(playerID, []byte(message))
}

func (e *Engine) broadcastObject(object *Object) {
	e.broadcast(e.ProtocolHandler.asNew(object))
}

func (e *Engine) sendWorld(playerID int64) {
	for _, object := range e.ObjectContainer.ObjectsByID {
		e.sendToPlayer(playerID, e.ProtocolHandler.asNew(object))
	}

	newPlayer := e.ObjectContainer.GetObject(playerID)
	e.broadcastPlayerAttributes(newPlayer)

	// annouce new player to other players
	for _, player := range e.ObjectContainer.GetObjectsByType("Player") {
		if player.ID != playerID {
			e.sendToPlayer(player.ID, e.ProtocolHandler.asNew(newPlayer))
		}
	}
}


func (e *Engine) RemovePlayer(playerID int64) {
	player := e.ObjectContainer.GetObject(playerID)
	if player != nil {
		e.removeAndBroadcast(player)
	}
}

func (e *Engine) removeAndBroadcast(object *Object) {
	e.ObjectContainer.DeleteObject(object)
	e.broadcast(e.ProtocolHandler.asRemove(object))
}


func (e *Engine) logState() {
	log.Info("--------------------------------")
}

func (e *Engine) MainLoop() {
	for e.Running {
		e.Tick += 1

		// wrap back around
		if e.Tick > 9223372036854775805 {
			e.Tick = 0
		}

		for _, object := range e.ObjectContainer.GetObjectsByType("Player") {
			scene := object.Scene
			scene.SetPosition(object.X, object.Y)
			e.broadcastScene(scene)
		}

		// sleep for an interval
		time.Sleep(30 * time.Millisecond)
	}
}

func (e *Engine) parseEvent(event string) {
	parts := strings.Split(event, ":")
	command := parts[0]

	switch command {
	case "P": {
		playerID :=  StringToInt64(parts[1])
		object := e.ObjectContainer.GetObject(playerID)

		if object != nil {
			// todo
		}
	}
	case "I": {
		playerID :=  StringToInt64(parts[1])
		name :=  parts[2]
		object := e.ObjectContainer.GetObject(playerID)

		if object != nil {
			object.Name = name
		}
		e.sendWorld(playerID)
	}
	case "T": {
		// mouse movement
		playerID :=  StringToInt64(parts[1])
		x :=  StringToInt64(parts[2])
		//y :=  StringToInt64(parts[3])

		object := e.ObjectContainer.GetObject(playerID)
		if object != nil {
			object.X = x
			object.Y = object.Y
		}
	}
		default:
		// nothing
	}
}

func (e *Engine) ListenToEvents() {
	// forever listen
	for e.Running {
		event := <- e.eventStream
		eventStr := string(event)
		//log.Info("Received [", eventStr, "]")
		e.parseEvent(eventStr)
	}
}

func (e *Engine) broadcastPlayerAttributes(player *Object) {
	e.broadcast(e.ProtocolHandler.asPlayerAttributes(player))
}

func (e *Engine) broadcastPlayedKilled(player *Object) {
}

func (e *Engine) Initialize() {
	log.Info("Initializing engine")

	e.eventStream = make(chan []byte)

	e.Running = true
	go e.MainLoop()
	go e.ListenToEvents()
	log.Info("Engine running")
}

func (e *Engine) Stop() {
	e.Running = false
}
