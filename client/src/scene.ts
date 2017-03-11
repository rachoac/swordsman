import {Shape, Point} from "./shape";
import {StringKeyedMap} from "./util"

export default class Scene {
    shapes: StringKeyedMap<Shape>
    processing: any
    private first?: Point
    private last?: Point

    constructor(processing: any) {
        this.processing = processing
    }

    addShape(shape: Shape) {
        this.shapes[shape.id] = shape
    }

    getShape(id: string): Shape {
        return this.shapes[id]
    }

    visit(point: Point) {
        if (this.first !== undefined) {
            this.first = point
            return
        }

        if (this.last) {
            this.processing.line(this.last.x, this.last.y, point.x, point.y)
            this.last = point
        }
    }

    render() {
        let keys: string[] = Object.keys(this.shapes)
        keys.forEach( k => this.shapes[k].visitNodes(this))

        if (this.first && this.last) {
            // wrap around to the first point
            this.processing.line(this.last.x, this.last.y, this.first.x, this.first.y)
        }

        this.first = undefined
        this.last = undefined

    }
}