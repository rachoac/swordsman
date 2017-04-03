import Player from "./player";
import {NumberKeyedMap} from "./util"
import {Shape, Point} from "./shape";

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
    players: NumberKeyedMap<Player>
    doTransmit: boolean
    walking: boolean

    constructor(processing: any, playerName: string) {
        this.playerName = playerName
        this.processing = processing
        this.mouseMovedHandling = this.mouseMovedHandling.bind(this)
        this.keyHandling = this.keyHandling.bind(this)
        this.keyReleased = this.keyReleased.bind(this)
        this.transmitWalkingStatus = this.transmitWalkingStatus.bind(this)
        this.players = {}
    }

    restart() {
    }

    keyReleased() {
        if (!this.player) {
            return
        }

        this.player.stopWalking()
        if (this.walking) {
            this.transmitWalkingStatus(false)
        }
        this.walking = false
    }

    keyHandling() {
        if (!this.player) {
            return
        }

        let keyCode = this.processing.keyCode
        if (keyCode === 65) {
            if (!this.walking) {
                this.transmitWalkingStatus(true)
            }
            this.player.walkLeft()
            this.walking = true
        }
        if (keyCode === 68) {
            if (!this.walking) {
                this.transmitWalkingStatus(true)
            }
            this.player.walkRight()
            this.walking = true
        }
    }

    transmitWalkingStatus(walking: boolean) {
        let packet: string = `W:${this.sessionID}:${walking}:${this.player.walkDir}`
        this.client.send(packet)
        this.doTransmit = true
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

        this.doTransmit = true
    }

    private transmit() {
        let packet: string = `S:${this.sessionID}:${this.player.playerX}:${this.player.facingDir}:${this.player.distance}:${this.player.angle1}`
        this.client.send(packet)

        let shapes: Shape[] = this.player.collectShapes()
        shapes.forEach( (shape: Shape) => {
            let packet: string = `U:${this.sessionID}:${shape.id}:${shape.label}`
            shape.nodes.forEach( (node: Point) => {
                packet += `:${node.id}:${Math.round(node.x)}:${Math.round(node.y)}:${node.label}`
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

        if (this.player.update() || this.doTransmit) {
            this.transmit()
            this.doTransmit = false
        }

        // this.player.render()

        const k1: number[] = Object.keys(this.players).map(k => parseInt(k)).sort()
        k1.forEach( (playerID: number) => {
            const player: Player = this.players[playerID]
            if (player.walking) player.handleWalking()
            player.render()
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
                case 'S': this.handleStatus(data);
                    break;
                case 'W': this.handleWalking(data);
                    break;
                case 'Y': this.handleStrike(data);
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
        this.players[this.sessionID] = this.player
    }

    private handleNew(data: string[]) {
        const [id, type]: string[] = data

        switch (type) {
            case 'P': {
                if (parseInt(id) !== this.sessionID) {
                    this.players[parseInt(id)] = new Player(this.processing, parseInt(id), "REMOTE", this.processing.width/2)
                }
                break;
            }
        }
    }

    private handleStatus(data: string[]) {
        const [ ownerIdStr, playerXStr, facingDir, distanceStr, angle1Str] = data
        const ownerId = parseInt(ownerIdStr)

        if (ownerId == this.sessionID) {
            return
        }

        const playerX = parseInt(playerXStr)
        const distance = parseFloat(distanceStr)
        const angle1 = parseFloat(angle1Str)

        const player: Player = this.players[ownerId]
        if (!player) {
            return
        }
        player.playerX = playerX
        player.orient(facingDir == "right", distance, angle1)
    }

    private handleWalking(data: string[]) {
        const [ ownerIdStr, walkingStr, walkDir] = data
        const ownerId = parseInt(ownerIdStr)
        const walking = walkingStr == "true"

        const player: Player = this.players[ownerId]
        if (!player || player.sessionID == this.sessionID) {
            return
        }
        if (walking) {
            player.walkDir = walkDir
            player.walking = walking
            player.handleWalking()
        } else {
            player.stopWalking()
        }
    }

    private handleStrike(data: string[]) {
        const [ strikerIDStr, struckIDStr, shapeLabel ]: string[] = data
        if (strikerIDStr){}

        const struckPlayer: Player = this.players[parseInt(struckIDStr)]
        if (!struckPlayer) {
            return
        }

        struckPlayer.strike(shapeLabel)
    }

}
