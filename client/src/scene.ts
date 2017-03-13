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
        keys.forEach(k => {
            let shape: Shape = this.shapes[k]
            shape.requireCompute()
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