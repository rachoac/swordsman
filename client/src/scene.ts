import {Shape, Point} from "./shape";
import {NumberKeyedMap} from "./util"

export default class Scene {
    shapes: NumberKeyedMap<Shape>
    processing: any
    rotation: number
    position: Point

    constructor(processing: any, x: number, y: number) {
        this.processing = processing
        this.shapes = {}
        this.rotation = 0
        this.position = new Point(x, y)
    }

    getPosition(): Point {
        return this.position
    }

    setPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
        this.position.originalX = x
        this.position.originalY = y
        this.recompute()
    }

    getRotation(): number {
        return this.rotation
    }

    addShape(shape: Shape): Scene {
        this.shapes[shape.id] = shape
        this.recompute()
        return this
    }

    getShape(id: number): Shape {
        return this.shapes[id]
    }

    rotate(rotation: number) {
        this.rotation = rotation
        this.recompute()
    }

    recompute() {
        let keys: number[] = Object.keys(this.shapes).map(k => parseInt(k))

        let containerOrigin: Point = this.getPosition()
        keys.forEach(k => {
            let shape: Shape = this.shapes[k]
            shape.recompute()

            // apply container
            shape.visitNodes( { visit: (point: Point) => {
                let x: number = point.x - containerOrigin.x
                let y: number = point.y - containerOrigin.y
                let rotated: Point = shape.rotatePoint(x, y, this.getRotation())

                point.x = rotated.x + containerOrigin.x
                point.y = rotated.y + containerOrigin.y
            }})

        })
    }

    render() {
        let keys: number[] = Object.keys(this.shapes).map(k => parseInt(k))
        keys.forEach(k => {
            let shape: Shape = this.shapes[k]
            shape.render(this.processing)
        })
    }
}