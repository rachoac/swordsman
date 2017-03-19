import Scene from "./scene";
import { Rect} from "./shape";
import {Point, Color} from "./shape";
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
    playerX: number
    
    constructor(processing: any, playerName: string) {
        this.playerName = playerName
        this.processing = processing
        this.mouseMovedHandling = this.mouseMovedHandling.bind(this)
        this.keyHandling = this.keyHandling.bind(this)
    }

    restart() {
    }

    keyHandling() {
        let keyCode = this.processing.keyCode
        if (keyCode === 65) {
            this.playerX -= 20
        }
        if (keyCode === 68) {
            this.playerX += 20
        }
    }

    mouseMovedHandling() {
        let mouseX = this.processing.mouseX
        let mouseY = this.processing.mouseY
        if (this.sessionID) {
            this.client.send(`T:${this.sessionID}:${mouseX}:${mouseY}`)
        }

        let dx: number =  mouseX - this.playerX
        let dy: number = mouseY - this.processing.height/2
        let angle1: number = this.processing.atan2(dy, dx)

        // shoulder rotation - right
        var shoulderRotation = Math.max((Math.PI * 0.8), Math.min( (Math.PI * 2.3), angle1 + (Math.PI * 1.5)))
        this.scene.getScene(2).rotate(shoulderRotation)

        // distance from shoulder
        let distance = Math.max(0, mouseX - this.playerX)
        let maxDistance = 600

        // shoulder rotation - left
        this.scene.getScene(4).rotate(Math.min(Math.PI * 0.15, distance/maxDistance * Math.PI * 0.15))

        // shoulder stretch
        var shoulderStretch = Math.min( 30, distance/maxDistance * 30 )
        this.scene.getScene(2).translate(-shoulderStretch, shoulderStretch)

        // elbow rotation
        let pctDistance = distance/maxDistance * 2
        let maxRotation = (Math.PI * 0.8)
        let elbowRotation = Math.min(0, -(1.0 - pctDistance) * maxRotation)
        this.scene.getScene(2).getScene(3).rotate(elbowRotation)

        // torso rotation
        let maxTorsoRotation = (Math.PI * 0.05)
        let torsoRotation = Math.min(maxTorsoRotation, distance/maxDistance * maxTorsoRotation)
        // console.log(distance, maxDistance, torsoRotation, maxTorsoRotation)
        this.scene.getScene(10).rotate(torsoRotation)

        // leg rotation right
        let maxLegRotation = Math.PI * 0.15
        this.scene.getScene(11)
            .rotate(torsoRotation + -Math.min(maxLegRotation, distance/maxDistance * maxLegRotation))
            .translate(Math.max(-50, distance/maxDistance * -50), Math.max(-5, distance/maxDistance * -5))

        // leg rotation left
        this.scene.getScene(12)
            .rotate(torsoRotation + Math.min(maxLegRotation, distance/maxDistance * maxLegRotation))
            .translate(Math.min(60, distance/maxDistance * 60), Math.max(-25, distance/maxDistance * -25))
    }

    update() {
        this.processing.background(0, 0, 0);
        this.processing.fill(255, 255, 255)
        this.processing.stroke(255, 255, 255)
        if (this.scene) {
            this.scene.setPosition(this.playerX, this.scene.position.y)
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

        this.playerX = this.processing.width/2
        
        // create player scene
        this.scene = new Scene(1, this.processing,
            this.playerX, this.processing.height/2)

        let legScene2: Scene = new Scene(12, this.processing, 0, 0)
        legScene2
            .addShape(new Rect(1, 8, 135, 60, 80).rotate(-Math.PI * 0.04))
            .addShape(new Rect(2, 18, 210, 50, 120).rotate(Math.PI * 0.04))
        this.scene.addScene(legScene2)

        let armScene2: Scene = new Scene(4, this.processing, 0, 0)
        armScene2.pin = new Point(25, 0)
        this.scene.addScene(armScene2)
        armScene2
            .addShape(new Rect(1, 0, 0, 50, 70))
        {
            let foreArm: Scene = new Scene(1, this.processing, 0, 71)
            armScene2.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(-Math.PI * 0.3)
        }

        let bodyScene: Scene = new Scene(10, this.processing, -10, -10)
        this.scene.addScene(bodyScene)

        let legScene: Scene = new Scene(11, this.processing, 0, 0)
        legScene
            .addShape(new Rect(1, 10, 140, 60, 80).rotate(-Math.PI * 0.05))
            .addShape(new Rect(2, 20, 215, 50, 120).rotate(Math.PI * 0.05))

        this.scene.addScene(legScene)

        bodyScene
            .addShape(new Rect(1, 0, 0, 80, 100))
            .addShape(new Rect(2, 5, 101, 70, 50))
            .addShape(new Rect(3, 20, -52, 50, 50))

        let armScene: Scene = new Scene(2, this.processing, 0, 0)
        armScene.pin = new Point(25, 0)
        this.scene.addScene(armScene)
        armScene
            .addShape(new Rect(1, 0, 0, 50, 70))

        {
            let foreArm: Scene = new Scene(3, this.processing, 0, 71)
            armScene.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(-Math.PI * 0.15)

            let sword: Rect = new Rect(4, 22, 131, 5, 210);
            sword.setColor(new Color(255, 0, 0, 255))
            foreArm.addShape(new Rect(2, 3, 0, 40, 100))
                .addShape(new Rect(3, 4, 101, 35, 30))
                .addShape(sword)
        }

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
