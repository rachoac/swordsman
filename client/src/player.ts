import Fighter from "./fighter";

export default class Player extends Fighter {

    sessionID: number
    name: string

    constructor(processing: any, sessionID: number, name: string, playerX: number) {
        super(processing, playerX)
        this.sessionID = sessionID;
        this.name = name
    }

    update(mouseX: number): boolean {
        let walked: boolean = false
        if (this.walking) {
            let distance = Math.max(0, mouseX - this.playerX)
            walked = this.handleWalking(distance)
        }

        if (mouseX > this.playerX) {
            if (this.sceneRight) {
                this.sceneRight.setPosition(this.playerX, this.sceneRight.position.y)
                this.sceneRight.render()
            }
        } else {
            if (this.sceneLeft) {
                this.sceneLeft.setPosition(this.playerX, this.sceneLeft.position.y)
                this.sceneLeft.render()
            }
        }

        return walked
    }

    handleMouse(mouseX: number, mouseY: number) {
        let dx: number = mouseX - this.playerX
        let dy: number = mouseY - this.processing.height / 2
        let angle1: number = this.processing.atan2(dy, dx)

        if (mouseX > this.playerX) {
            this.mouseSceneRight(Math.max(0, mouseX - this.playerX), angle1)
        } else {
            this.mouseSceneLeft(Math.max(0, this.playerX - mouseX), angle1)
        }
    }

}