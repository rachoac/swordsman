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

        // this.scene.setPosition(mouseX, mouseY)
        let rotationMax = Math.PI * 2
        let rotation = mouseX / this.processing.width * rotationMax
        // this.scene.getScene(2).getScene(3).getShape(2).rotate(rotation)
        // this.scene.getScene(2).getScene(3).getShape(3).rotate(rotation)
        this.scene.getScene(2).getScene(3).rotate(rotation)
        this.scene.rotate(rotation/4)
        this.scene.recompute()
    }

    update() {
        this.processing.background(0, 0, 0);
        this.processing.fill(255, 255, 255)
        this.processing.stroke(255, 255, 255)
        if (this.scene) {
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
        this.scene = new Scene(1, this.processing, null, 300, 300)
        let subScene: Scene = new Scene(2, this.processing, this.scene, 0, 0)
        this.scene.addScene(subScene)
        subScene
            .addShape(new Rect(1, this.scene, 0, 0, 50, 70))

        let subSubScene: Scene = new Scene(3, this.processing, subScene, 0, 71)
        subScene.addScene(subSubScene)

        subSubScene.addShape(new Rect(2, subScene, 0, 0, 50, 100))
                   .addShape(new Rect(3, subScene, 0, 101, 50, 50))
        this.scene.rotate(25)
        this.scene.recompute()
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
