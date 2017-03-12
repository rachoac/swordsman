import Scene from "./scene";
class Point {
    originalX: number
    originalY: number
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.originalX = x
        this.originalY = y
    }
}

interface ShapeVisitor {
    visit(point: Point): void
}

interface Renderable {
    render(): void
}

class Shape {
    id: number
    nodes: Point[]
    rotation: number
    translateX :number
    translateY: number
    offsetX: number
    offsetY: number
    parent: Scene
    needsCompute: boolean

    constructor(id: number, parent: Scene, nodes?: Point[]) {
        this.id = id
        this.nodes = nodes || []
        this.offsetX = 0
        this.offsetY = 0
        this.translateX = 0
        this.translateY = 0
        this.parent = parent
        this.rotation = 0
        this.needsCompute = true
    }

    addNode(...nodes: Point[]) {
        nodes.forEach( n => this.nodes.push(n))
        this.requireCompute()
    }

    clear() {
        this.nodes = []
    }

    visitNodes(visitor: ShapeVisitor): void {
        this.nodes.forEach( point => visitor.visit(point) )
    }

    render(processing: any) {
        if (this.needsCompute) {
            this.recompute()
        }

        for ( var i: number = 0; i < this.nodes.length; i++) {
            var from: Point = this.nodes[i];
            var to: Point = this.nodes[i >= this.nodes.length - 1 ? 0 : i + 1];
            processing.line(from.x, from.y, to.x, to.y);
        }
    }

    requireCompute() {
        this.needsCompute = true
    }

    rotatePoint(x: number, y: number, theta: number): Point {
        let sinTheta: number = Math.sin(theta)
        let cosTheta: number = Math.cos(theta)
        let xNew: number = x * cosTheta - y * sinTheta
        let yNew: number = y * cosTheta + x * sinTheta
        return new Point(xNew, yNew)
    }

    recompute() {
        if (!this.needsCompute) {
            return
        }

        let containerOrigin: Point = this.parent.getPosition()

        this.visitNodes( { visit: (point: Point) => {
            let x: number = point.originalX
            let y: number = point.originalY - (this.id ==2 ? 50 : 0)
            let rotated: Point = this.rotatePoint(x, y, this.rotation)

            point.x = rotated.x + this.offsetX + this.translateX + containerOrigin.x
            point.y = rotated.y + this.offsetY + this.translateY + containerOrigin.y + (this.id ==2 ? 50 : 0)
        }})

        this.visitNodes( { visit: (point: Point) => {
            let x: number = point.x - containerOrigin.x
            let y: number = point.y - containerOrigin.y
            let rotated: Point = this.rotatePoint(x, y, this.parent.getRotation())

            point.x = rotated.x + containerOrigin.x
            point.y = rotated.y + containerOrigin.y
        }})

        this.needsCompute = false
    }

    translate(x: number, y: number) {
        this.translateX = x
        this.translateY = y
        this.requireCompute()
    }

    rotate(rotation: number) {
        this.rotation = rotation
        this.requireCompute()
    }
}

class Rect extends Shape {
    constructor(id: number, parent: Scene, x: number, y: number, width: number, height: number) {
        super(id, parent, [new Point(x, y), new Point(x + width, y), new Point(x + width, y + height), new Point(x, y + height)])
    }
}

export {
    Point,
    Renderable,
    ShapeVisitor,
    Shape,
    Rect,
}