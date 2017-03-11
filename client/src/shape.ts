class Point {
    x: number
    y: number
}

interface ShapeVisitor {
    visit(point: Point): void
}

interface Renderable {
    render(): void
}

class Shape {
    id: string
    nodes: Point[]

    constructor(id: string, nodes: Point[]) {
        this.id = id
        this.nodes = nodes
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