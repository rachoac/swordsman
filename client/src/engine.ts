import Player from "./player";

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

    constructor(processing: any, playerName: string) {
        this.playerName = playerName
        this.processing = processing
        this.mouseMovedHandling = this.mouseMovedHandling.bind(this)
        this.keyHandling = this.keyHandling.bind(this)
        this.keyReleased = this.keyReleased.bind(this)
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

        if (mouseX > this.player.playerX) {
            this.player.mouseSceneRight(mouseX, mouseY)
        } else {
            this.player.mouseSceneLeft(mouseX, mouseY)
        }

    }

    update() {
        this.processing.background(0, 0, 0);
        this.processing.fill(255, 255, 255)
        this.processing.stroke(255, 255, 255)

        if (!this.player) {
            return
        }

        this.player.update()
        this.player.render()
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

}
