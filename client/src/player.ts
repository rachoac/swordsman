import Fighter from "./fighter";

export default class Player extends Fighter {

    sessionID: number
    name: string

    constructor(processing: any, sessionID: number, name: string, playerX: number) {
        super(processing, playerX)
        this.sessionID = sessionID;
        this.name = name
    }

    update(): boolean {
        let walked: boolean = false
        if (this.walking && this.walkDir !== "") {
            if (this.walkDir === "left") {
                this.playerX -= 8
            } else {
                this.playerX += 8
            }

            this.handleWalking()
            walked = true
        }

        if (this.facingDir === "right" && this.sceneRight) {
            this.sceneRight.setPosition(this.playerX, this.sceneRight.position.y)
        } else if (this.sceneLeft) {
            this.sceneLeft.setPosition(this.playerX, this.sceneLeft.position.y)
        }

        return walked
    }

    handleMouse(mouseX: number, mouseY: number) {
        let dx: number = mouseX - this.playerX
        let dy: number = mouseY - this.processing.height / 2
        let angle1: number = this.processing.atan2(dy, dx)

        if (mouseX > this.playerX) {
            this.orient(true, Math.max(0, mouseX - this.playerX), angle1)
        } else {
            this.orient(false, Math.max(0, this.playerX - mouseX), angle1)
        }
    }

}