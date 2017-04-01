import Player from "./player";
import {Shape, Point} from "./shape";
import {NumberKeyedMap} from "./util"

interface Client {
    send(value: string): void
}

export default class Engine {
    private client: Client
    sessionID: number
    playerName: string
    connected: boolean
    processing: any
    player: Player
    remotePlayers: NumberKeyedMap<NumberKeyedMap<NumberKeyedMap<Point>>>

    constructor(processing: any, playerName: string) {
        this.playerName = playerName
        this.processing = processing
        this.mouseMovedHandling = this.mouseMovedHandling.bind(this)
        this.keyHandling = this.keyHandling.bind(this)
        this.keyReleased = this.keyReleased.bind(this)
        this.remotePlayers = {}
    }

    restart() {
    }

    keyReleased() {
        if (!this.player) {
            return
        }

        this.player.stopWalking()
    }

    keyHandling() {
        if (!this.player) {
            return
        }

        let keyCode = this.processing.keyCode
        if (keyCode === 65) {
            this.player.walkLeft()
        }
        if (keyCode === 68) {
            this.player.walkRight()
        }
    }

    mouseMovedHandling() {
        if (!this.player) {
            return
        }

        let mouseX = this.processing.mouseX
        let mouseY = this.processing.mouseY
        if (this.sessionID) {
            this.client.send(`T:${this.sessionID}:${mouseX}:${mouseY}`)
        }

        let oldFaceDir = this.player.facingDir
        this.player.handleMouse(mouseX, mouseY)
        if (oldFaceDir != this.player.facingDir) {
            // flip
            let packet: string = `C:${this.sessionID}`
            this.client.send(packet)
        }

        let shapes: Shape[] = this.player.collectShapes()
        this.transmit(shapes)
    }

    private transmit(shapes: Shape[]) {
        shapes.forEach( (shape: Shape) => {
            let packet: string = `U:${this.sessionID}:${shape.id}`
            shape.nodes.forEach( (node: Point) => {
                packet += `:${node.id}:${Math.round(node.x)}:${Math.round(node.y)}`
            })

            this.client.send(packet)
        })
    }

    update() {
        this.processing.background(0, 0, 0);
        this.processing.fill(255, 255, 255)
        this.processing.stroke(255, 255, 255)

        if (!this.player) {
            return
        }

        if (this.player.update()) {
            let shapes: Shape[] = this.player.collectShapes()
            this.transmit(shapes)
        }

        // this.player.render()

        const k1: number[] = Object.keys(this.remotePlayers).map(k => parseInt(k)).sort()
        k1.forEach( (playerID: number) => {
            const shapes: NumberKeyedMap<NumberKeyedMap<Point>> = this.remotePlayers[playerID]
            const k2: number[] = Object.keys(shapes).map(k => parseInt(k)).sort()
            k2.forEach( (shapeID: number) => {
                const shape: NumberKeyedMap<Point> = shapes[shapeID]
                const k3: number[] = Object.keys(shape).map(k => parseInt(k)).sort()

                this.processing.stroke(0, 0, 0)
                this.processing.fill(255, 255, 255)
                this.processing.beginShape();
                for ( var i: number = 0; i < k3.length; i++) {
                    var from: Point = shape[k3[i]];
                    this.processing.vertex(from.x, from.y);
                }
                let first: Point = shape[k3[0]]
                this.processing.vertex(first.x, first.y);
                this.processing.endShape();
            })
        })
    }

    onSocketClose(evt: any) {
        console.log("Close!", evt)
        this.connected = false
        this.restart()
    }

    onSocketOpen(evt: any) {
        if (evt) {
        }
        this.restart()
        this.connected = true
    }

    onSocketMessage(evt: any) {
        let messages = evt.data.split("\n")
        messages.forEach((m: string) => {
            let opCode, data
            [opCode, ...data] = m.split(":")

            switch (opCode) {
                case 'ID':
                    this.handleID(data);
                    break;
                case 'N':
                    this.handleNew(data);
                    break;
                case 'U': this.handleShape(data);
                    break;
                case 'C': this.handleClear(data);
                    break;
                default:
                    break;
            }
        })
    }

    setClient(client: Client) {
        this.client = client
    }

    static initialize(processing: any, playerName: string) {
        let w = window,
            d = w.document,
            de = d.documentElement,
            db = d.body || d.getElementsByTagName('body')[0],
            x = w.innerWidth || de.clientWidth || db.clientWidth,
            y = w.innerHeight || de.clientHeight || db.clientHeight;

        processing.size(x, y);

        let engine = new Engine(processing, playerName);

        processing.keyPressed = engine.keyHandling
        processing.keyReleased = engine.keyReleased
        processing.mouseMoved = engine.mouseMovedHandling

        engine.restart()
        return engine
    }

    private handleID(data: string[]) {
        console.log("Got ID: " + data[0])
        this.sessionID = parseInt(data[0])
        this.client.send(`I:${this.sessionID}:${this.playerName}`)

        this.player = new Player(this.processing, this.sessionID, this.playerName, this.processing.width / 2)
    }

    private handleNew(data: string[]) {
        const [id, type]: string[] = data

        switch (type) {
            case 'P': {
                this.remotePlayers[parseInt(id)] = {}
                break;
            }
        }
    }

    private handleClear(data: string[]) {
        const [ownerId]: number[] = data.map(s => parseInt(s))
        this.remotePlayers[ownerId] = {}
    }

    private handleShape(data: string[]) {
        const [ ownerId, id, point1Id, x1, y1, point2Id, x2, y2, point3Id, x3, y3, point4Id, x4, y4 ]: number[] = data.map(s => parseInt(s))
        let playerShapes: NumberKeyedMap<NumberKeyedMap<Point>> = this.remotePlayers[ownerId]
        if (!playerShapes) {
            playerShapes = {}
            this.remotePlayers[ownerId] = playerShapes
        }
        
        let shape: NumberKeyedMap<Point> = playerShapes[id]
        if (!shape) {
            shape = {}
            playerShapes[id] = shape
        }
        
        let point1 = shape[point1Id]
        if (!point1) {
            point1 = new Point(x1, y1)
            shape[point1Id] = point1
        } else {
            point1.x = x1
            point1.y = y1
        }

        let point2 = shape[point2Id]
        if (!point2) {
            point2 = new Point(x2, y2)
            shape[point2Id] = point2
        } else {
            point2.x = x2
            point2.y = y2
        }

        let point3 = shape[point3Id]
        if (!point3) {
            point3 = new Point(x3, y3)
            shape[point3Id] = point3
        } else {
            point3.x = x3
            point3.y = y3
        }

        let point4 = shape[point4Id]
        if (!point4) {
            point4 = new Point(x4, y4)
            shape[point4Id] = point4
        } else {
            point4.x = x4
            point4.y = y4
        }
    }
}
