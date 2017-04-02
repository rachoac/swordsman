import Scene from "./scene";

class Color {
    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
}

let pointIDCtr: number = 0
let shapeIDCtr: number = 0

class Point {
    originalX: number
    originalY: number
    x: number
    y: number
    id: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.originalX = x
        this.originalY = y
        this.id = ++pointIDCtr
    }

    add(other: Point): Point {
        return new Point(other.x + this.x, other.y + this.y)
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
    color: Color
    label: string

    constructor(id: number, nodes?: Point[]) {
        this.id = id
        this.nodes = nodes || []
        this.offsetX = 0
        this.offsetY = 0
        this.translateX = 0
        this.translateY = 0
        this.rotation = 0
        this.needsCompute = true
    }

    setLabel(label: string): Shape {
        this.label = label
        return this
    }

    setColor(color: Color): Shape {
        this.color = color
        return this
    }

    addNode(...nodes: Point[]): Shape {
        nodes.forEach( n => this.nodes.push(n))
        this.requireCompute()
        return this
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

        processing.stroke(0, 0, 0)
        if (this.color) {
            processing.fill(this.color.r, this.color.g, this.color.b)
        } else {
            processing.fill(255, 255, 255)
        }
        processing.beginShape();
        for ( var i: number = 0; i < this.nodes.length; i++) {
            var from: Point = this.nodes[i];
            processing.vertex(from.x, from.y);
        }
        let first: Point = this.nodes[0]
        processing.vertex(first.x, first.y);
        processing.endShape();
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

        let anchor: Point = this.nodes[0]

        // apply self
        this.visitNodes( { visit: (point: Point) => {
            let x: number = point.originalX - anchor.originalX + this.offsetX
            let y: number = point.originalY - anchor.originalY + this.offsetY
            let rotated: Point = this.rotatePoint(x, y, this.rotation)

            point.x = rotated.x + this.translateX + anchor.originalX - this.offsetX
            point.y = rotated.y + this.translateY + anchor.originalY - this.offsetY
        }})

        this.needsCompute = false
    }

    translate(x: number, y: number) {
        this.translateX = x
        this.translateY = y
        this.requireCompute()
    }

    rotate(rotation: number): Shape {
        this.rotation = rotation
        this.requireCompute()
        return this
    }
}

class Rect extends Shape {
    constructor(x: number, y: number, width: number, height: number) {
        super(++shapeIDCtr, [new Point(x, y), new Point(x + width, y), new Point(x + width, y + height), new Point(x, y + height)])
        this.offsetX = -width/2
        this.offsetY = -height * 0.25
    }
}

export {
    Point,
    Renderable,
    ShapeVisitor,
    Shape,
    Rect,
    Color,
}