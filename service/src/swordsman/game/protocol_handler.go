package game

type ProtocolHandler struct {}

func NewProtocolHandler() *ProtocolHandler {
	handler := ProtocolHandler{}
	return &handler
}

func (e *ProtocolHandler) asNew(object *Object) string {
	return "N:" +
		Int64ToString(object.ID) + ":" +
		object.Code + ":" +
		Int64ToString(object.X) + ":" +
		Int64ToString(object.Y) + ":" +
		object.Name + ":" +
		Int64ToString(object.Score) + ":" +
		Int64ToString(object.OriginID)
}

func (e *ProtocolHandler) asRect(ownerID int64, shapeID int64, points map[int64]*Point) string {
	packet := "R:" + Int64ToString(ownerID) + ":"  + Int64ToString(shapeID)
	for pointId, point := range points {
		packet += ":" +
			Int64ToString(pointId) + ":" +
			Int64ToString(point.X) + ":" +
			Int64ToString(point.Y)
	}

	return packet
}

func (e *ProtocolHandler) asRemove(object *Object) string {
	return "R:" + Int64ToString(object.ID)
}

func (e *ProtocolHandler) asPlayerAttributes(player *Object) string {
	return "A:" + Int64ToString(player.ID) + ":" +
		Int64ToString(player.Score)
}
