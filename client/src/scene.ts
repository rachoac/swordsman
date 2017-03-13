import {Shape, Point} from "./shape";
import {NumberKeyedMap} from "./util"

export default class Scene {
    id: number
    shapes: NumberKeyedMap<Shape>
    scenes: NumberKeyedMap<Scene>
    processing: any
    parent: Scene | null
    rotation: number
    position: Point
    pin: Point

    constructor(id: number, processing: any, parent: Scene | null, x: number, y: number) {
        this.id = id
        this.processing = processing
        this.parent = parent
        this.shapes = {}
        this.scenes = {}
        this.rotation = 0
        this.position = new Point(x, y)
        this.pin = new Point(0, 0)
    }

    getPosition(): Point {
        // if (this.parent) {
        //     return this.position.add(this.parent.getPosition())
        // }
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

    addScene(scene: Scene): Scene {
        this.scenes[scene.id] = scene
        this.recompute()
        return this
    }

    getShape(id: number): Shape {
        return this.shapes[id]
    }

    getScene(id: number): Scene {
        return this.scenes[id]
    }

    rotate(rotation: number) {
        this.rotation = rotation
        this.recompute()
    }

    applyParent(shape: Shape) {
        if (this.parent) {
            let parentContainerOrigin: Point = this.parent.getPosition()
            shape.nodes.forEach( (point: Point) => {
                let x: number = point.x
                let y: number = point.y
                    x -= this.pin.x
                    y -= this.pin.y
                let rotated = new Point(0, 0)
                if (this.parent) {
                    rotated = shape.rotatePoint(x, y, this.parent.getRotation())
                }
                point.x = rotated.x + parentContainerOrigin.x
                point.y = rotated.y + parentContainerOrigin.y

                    point.x += this.pin.x
                    point.y += this.pin.y

            })

            this.parent.applyParent(shape)
        }
    }

    recompute() {
        // shapes
        {
            let keys: number[] = Object.keys(this.shapes).map(k => parseInt(k))
            let containerOrigin: Point = this.getPosition()

            keys.forEach(k => {
                let shape: Shape = this.shapes[k]
                shape.requireCompute()
                shape.recompute()

                // apply this scene
                shape.visitNodes( { visit: (point: Point) => {
                    let x: number = point.x - this.pin.x
                    let y: number = point.y - this.pin.y
                    let rotated: Point = shape.rotatePoint(x, y, this.getRotation())

                    point.x = rotated.x + containerOrigin.x + this.pin.x
                    point.y = rotated.y + containerOrigin.y + this.pin.y
                }})

                // recursively apply container parent
                this.applyParent(shape)
            })
        }

        // scenes
        {
            let keys: number[] = Object.keys(this.scenes).map(k => parseInt(k))
            keys.forEach(k => {
                let scene: Scene = this.scenes[k]
                scene.recompute()
            })
        }
    }

    render() {
        // shapes
        {
            let keys: number[] = Object.keys(this.shapes).map(k => parseInt(k))
            keys.forEach(k => {
                let shape: Shape = this.shapes[k]
                shape.render(this.processing)
            })
        }
        // scenes
        {
            let keys: number[] = Object.keys(this.scenes).map(k => parseInt(k))
            keys.forEach(k => {
                let scene: Scene = this.scenes[k]
                scene.render()
            })
        }
    }
}