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

	scene := NewScene(player.ID, 0, 0)
	player.Scene = scene

	e.broadcastScene(scene)

	return player.ID
}

func (e *Engine) broadcastScene(scene *Scene) {
	for shapeID, shape := range scene.Shapes {
		e.broadcast(e.ProtocolHandler.asRect(scene.ID, shapeID, shape.Points))
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

		// sleep for an interval
		time.Sleep(1000 * time.Millisecond)
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
	case "C": {
		playerID := StringToInt64(parts[1])
		e.broadcast("C:" + Int64ToString(playerID))
		object := e.ObjectContainer.GetObject(playerID)
		if object != nil {
			object.Scene.ClearShapes()
		}
	}
	case "S": {
		// broadcast status
		e.broadcast(event)
	}
	case "W": {
		// broadcast status
		e.broadcast(event)
		e.analyzeCollisions()
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
	case "U": {
		// update
		playerID :=  StringToInt64(parts[1])
		shapeID :=  StringToInt64(parts[2])
		label := parts[3]

		object := e.ObjectContainer.GetObject(playerID)
		if object != nil {
			{
				pointID :=  StringToInt64(parts[4])
				x :=  StringToInt64(parts[5])
				y :=  StringToInt64(parts[6])
				pointLabel := parts[7]
				object.Scene.Replace(shapeID, label, pointID, x, y, pointLabel)
			}
			{
				pointID :=  StringToInt64(parts[8])
				x :=  StringToInt64(parts[9])
				y :=  StringToInt64(parts[10])
				pointLabel := parts[11]
				object.Scene.Replace(shapeID, label, pointID, x, y, pointLabel)
			}
			{
				pointID :=  StringToInt64(parts[12])
				x :=  StringToInt64(parts[13])
				y :=  StringToInt64(parts[14])
				pointLabel := parts[15]
				object.Scene.Replace(shapeID, label, pointID, x, y, pointLabel)
			}
			{
				pointID :=  StringToInt64(parts[16])
				x :=  StringToInt64(parts[17])
				y :=  StringToInt64(parts[18])
				pointLabel := parts[19]
				object.Scene.Replace(shapeID, label, pointID, x, y, pointLabel)
			}

			e.analyzeCollisions()
		}

	}
		default:
		// nothing
	}
}

func (e *Engine) struck(player1 *Object, player2 *Object) *Shape {
	if player1.Scene == nil || player2.Scene == nil {
		return nil
	}

	sword := player1.Scene.Sword
	if sword == nil {
		return nil
	}

	head := player2.Scene.Head
	if head != nil && head.Collision(sword) {
		return head
	}

	for _, v := range player2.Scene.Body {
		if v.Collision(sword) {
			return v
		}
	}

	return nil
}

func (e *Engine) handleStrike(striker *Object, struck  *Object, struckPart *Shape) {
	e.broadcast(e.ProtocolHandler.asStrike(striker, struck, struckPart))
}

func (e *Engine) analyzeCollisions() {
	players := e.ObjectContainer.GetObjectsByType("Player")
	for _, player1 := range players {
		for _, player2 := range players {
			if player1.ID == player2.ID {
				// don't analyze against self
				continue
			}

			struckPart := e.struck(player1, player2)
			if struckPart != nil {
				e.handleStrike(player1, player2, struckPart)
				return
			}
		}
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
