class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
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

    constructor(id: number, nodes?: Point[]) {
        this.id = id
        this.nodes = nodes || []
    }

    addNode(node: Point) {
        this.nodes.push(node)
    }

    visitNodes(visitor: ShapeVisitor): void {
        this.nodes.forEach( point => visitor.visit(point) )
    }
}

export {
    Point,
    Renderable,
    ShapeVisitor,
    Shape
}