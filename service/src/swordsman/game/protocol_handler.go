package game

type ProtocolHandler struct {}

func NewProtocolHandler() *ProtocolHandler {
	handler := ProtocolHandler{}
	return &handler
}

func (e *ProtocolHandler) asNew(object *Object) string {
	return "N:" + Int64ToString(object.ID) + ":" +
		object.Code + ":" + Int64ToString(object.X) + ":" +
		Int64ToString(object.Y) + ":" +
		object.Name + ":" +
		Int64ToString(object.Score) + ":" +
		Int64ToString(object.OriginID)
}

func (e *ProtocolHandler) asRect(object *Rect) string {
	return "R:" +
		Int64ToString(object.ID) + ":" +
		Int64ToString(object.Points[0].X) + ":" +
		Int64ToString(object.Points[0].Y) + ":" +

		Int64ToString(object.Points[1].X) + ":" +
		Int64ToString(object.Points[1].Y) + ":" +

		Int64ToString(object.Points[2].X) + ":" +
		Int64ToString(object.Points[2].Y) + ":" +

		Int64ToString(object.Points[3].X) + ":" +
		Int64ToString(object.Points[3].Y)
}

func (e *ProtocolHandler) asRemove(object *Object) string {
	return "R:" + Int64ToString(object.ID)
}

func (e *ProtocolHandler) asPlayerAttributes(player *Object) string {
	return "A:" + Int64ToString(player.ID) + ":" +
		Int64ToString(player.Score)
}
