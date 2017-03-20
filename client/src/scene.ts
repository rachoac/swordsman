import {Shape, Point} from "./shape";
import {NumberKeyedMap} from "./util"

export default class Scene {
    id: number
    shapes: NumberKeyedMap<Shape>
    scenes: NumberKeyedMap<Scene>
    sceneOrdering: Scene[]
    processing: any
    parent: Scene | null
    rotation: number
    position: Point
    pin: Point
    translateX: number
    translateY: number

    constructor(id: number, processing: any, x: number, y: number) {
        this.id = id
        this.processing = processing
        this.shapes = {}
        this.scenes = {}
        this.sceneOrdering = []
        this.rotation = 0
        this.position = new Point(x, y)
        this.pin = new Point(0, 0)
        this.translateX = 0
        this.translateY = 0
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
        shape.parent = this
        this.recompute()
        return this
    }

    addScene(scene: Scene): Scene {
        scene.parent = this
        this.scenes[scene.id] = scene
        this.sceneOrdering.push(scene)
        this.recompute()
        return this
    }

    getScene(id: number): Scene {
        return this.scenes[id]
    }

    rotate(rotation: number): Scene {
        this.rotation = rotation
        this.recompute()
        return this
    }

    translate(x: number, y: number): Scene {
        this.translateX = x
        this.translateY = y
        return this
    }

    applyParent(shape: Shape) {
        if (this.parent) {
            let parentContainerOrigin: Point = this.parent.getPosition()
            shape.nodes.forEach( (point: Point) => {
                let x: number = point.x - this.pin.x + (this.parent ? this.parent.translateX : 0)
                let y: number = point.y - this.pin.y + (this.parent ? this.parent.translateY : 0)
                let rotated = new Point(0, 0)
                if (this.parent) {
                    rotated = shape.rotatePoint(x, y, this.parent.getRotation())
                }
                point.x = rotated.x + parentContainerOrigin.x + this.pin.x
                point.y = rotated.y + parentContainerOrigin.y + this.pin.y
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
                    let x: number = point.x - this.pin.x + this.translateX
                    let y: number = point.y - this.pin.y + this.translateY
                    let rotated: Point = shape.rotatePoint(x, y, this.getRotation())

                    point.x = rotated.x + containerOrigin.x + this.pin.x
                    point.y = rotated.y + containerOrigin.y  + this.pin.y
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
        this.sceneOrdering.forEach( (scene: Scene) => scene.render())
    }

    collect(collection: Shape[]) {
        let keys: number[] = Object.keys(this.shapes).map(k => parseInt(k))
        keys.forEach(k => {
            let shape: Shape = this.shapes[k]
            collection.push(shape)
        })

        this.sceneOrdering.forEach( (scene: Scene) => scene.collect(collection))
    }
}