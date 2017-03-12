import Scene from "./scene";
import { Rect} from "./shape";
// import {Shape, Point, Rect} from "./shape";
interface Client {
    send(value: string): void
}

export default class Engine {
    private client: Client
    sessionID: number
    playerName: string
    connected: boolean
    processing: any
    scene: Scene
    rect2: Rect

    constructor(processing: any, playerName: string) {
        this.playerName = playerName
        this.processing = processing
        this.mouseMovedHandling = this.mouseMovedHandling.bind(this)
        this.keyHandling = this.keyHandling.bind(this)
    }

    restart() {
    }

    keyHandling() {
        // let keyCode = this.processing.keyCode
    }

    mouseMovedHandling() {
        let mouseX = this.processing.mouseX
        let mouseY = this.processing.mouseY
        if (this.sessionID) {
            this.client.send(`T:${this.sessionID}:${mouseX}:${mouseY}`)
        }

        this.scene.setPosition(mouseX, mouseY)
    }

    update() {
        this.processing.background(0, 0, 0);
        this.processing.fill(255, 255, 255)
        this.processing.stroke(255, 255, 255)
        if (this.scene) {
            this.scene.rotation += 0.01
            this.rect2.rotation += 0.03
            this.rect2.rotate(this.rect2.rotation)
            this.scene.rotate(this.scene.rotation)
            // this.scene.rotate(0)

            this.scene.render()
        }
    }

    onSocketClose(evt: any) {
        console.log("Close!", evt)
        this.connected = false
        this.restart()
    }

    onSocketOpen(evt: any) {
        if (evt){}
        this.restart()
        this.connected = true
    }

    onSocketMessage(evt: any) {
        let messages = evt.data.split("\n")
        messages.forEach( (m: string) => {
            let opCode, data
            [opCode, ...data] = m.split(":")

            switch(opCode) {
                case 'ID': this.handleID(data); break;
                // case 'R': this.handleShape(data); break;
                default:
                    break;
            }
        })
    }

    setClient(client: Client) {
        this.client = client
    }

    static initialize(processing: any, playerName: string) {
        let w  = window,
            d  = w.document,
            de = d.documentElement,
            db = d.body || d.getElementsByTagName('body')[0],
            x  = w.innerWidth || de.clientWidth || db.clientWidth,
            y  = w.innerHeight|| de.clientHeight|| db.clientHeight;

        processing.size(x,y);

        let engine = new Engine(processing, playerName);

        processing.keyPressed = engine.keyHandling
        processing.mouseMoved = engine.mouseMovedHandling

        engine.restart()
        return engine
    }

    private handleID(data: string[]) {
        console.log("Got ID: " + data[0])
        this.sessionID = parseInt(data[0])
        this.client.send(`I:${this.sessionID}:${this.playerName}`)

        // create player scene
        this.scene = new Scene(this.processing, 300, 300)
        let rect: Rect = new Rect(1, this.scene, 0, 0, 100, 100)
        this.rect2 = new Rect(2, this.scene, 0, 50, 40, 35)

        this.scene.addShape(rect).addShape(this.rect2)
    }

    // private handleShape(data: string[]) {
    //     const [ id, x1, y1, x2, y2, x3, y3, x4, y4 ]: number[] = data.map(s => parseInt(s))
    //     let shape: Shape = this.scene.getShape(id)
    //     if (!shape) {
    //         shape = new Shape(id)
    //         this.scene.addShape(shape)
    //     }
    //     shape.clear()
    //     shape.addNode(new Point(x1, y1), new Point(x2, y2), new Point(x3, y3), new Point(x4, y4))
    // }
}
