import Fighter from "./fighter";
import {Shape} from "./shape";

export default class Player extends Fighter {

    sessionID: number
    name: string
    walking: boolean
    walkDir: string
    walkCtr: number
    walkSign: number

    constructor(processing: any, sessionID: number, name: string, playerX: number) {
        super(processing, playerX)
        this.sessionID = sessionID;
        this.name = name
        this.walkCtr = 0
        this.walkSign = 5
    }

    updatePlayerX(delta: number) {
        this.playerX += delta
    }

    stopWalking() {
        this.walking = false
        this.walkDir = ""
        this.walkCtr = 0
        this.walkSign = 5
    }

    walkLeft() {
        this.walking = true
        this.walkDir = "left"
    }

    walkRight() {
        this.walking = true
        this.walkDir = "right"
    }

    update() {
        if (this.walking) {
            this.handleWalking()
        }

        if (this.processing.mouseX > this.playerX) {
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
    }

    handleWalking() {
        if (this.walkDir === "") {
            // not walking
            return
        }

        if (this.walkDir === "left") {
            this.playerX -= 8
        } else {
            this.playerX += 8
        }

        this.walkCtr += this.walkSign
        if (this.walkCtr > 100 || this.walkCtr < 0) {
            this.walkSign *= -1
        }

        if (this.facingDir === "right") {
            // distance from shoulder
            let distance = Math.max(0, this.processing.mouseX - this.playerX)
            let maxDistance = 600
            let maxTorsoRotation = (Math.PI * 0.05)
            let torsoRotation = Math.min(maxTorsoRotation, distance / maxDistance * maxTorsoRotation)

            let walkPct = this.walkCtr / 100
            let pct = (walkPct <= 0.5 ? (0.5 - walkPct) / 0.5 : (walkPct - 0.5) / 0.5)

            this.sceneRight.getScene(11)
                .rotate(torsoRotation + -pct * Math.PI * 0.15 * (walkPct < 0.5 ? -1 : 1))
                .translate(
                    pct * (walkPct < 0.5 ? 60 : -50),
                    pct * (walkPct < 0.5 ? -25 : -5)
                )

            this.sceneRight.getScene(12)
                .rotate(torsoRotation + pct * Math.PI * 0.15 * (walkPct < 0.5 ? -1 : 1))
                .translate(
                    pct * (walkPct < 0.5 ? -50 : 60),
                    pct * (walkPct < 0.5 ? -5 : -25)
                )
        } else {
            // left

            // distance from shoulder
            let walkPct = this.walkCtr / 100
            let pct = (walkPct <= 0.5 ? (0.5 - walkPct) / 0.5 : (walkPct - 0.5) / 0.5)

            this.sceneLeft.getScene(11)
                .rotate(-pct * Math.PI * 0.15 * (walkPct < 0.5 ? -1 : 1))
                .translate(
                    pct * (walkPct < 0.5 ? 45 : -45),
                    pct * (walkPct < 0.5 ? -35 : 5)
                )

            this.sceneLeft.getScene(12)
                .rotate(pct * Math.PI * 0.15 * (walkPct < 0.5 ? -1 : 1))
                .translate(
                    pct * (walkPct < 0.5 ? -45 : 45),
                    pct * (walkPct < 0.5 ? 5 : -35)
                )
        }
    }

    mouseSceneLeft(mouseX: number, mouseY: number) {
        this.facingDir = "left"
        let dx: number = mouseX - this.playerX
        let dy: number = mouseY - this.processing.height / 2
        let angle1: number = this.processing.atan2(dy, dx)

        // shoulder rotation - right
        var shoulderRotation = angle1 + (Math.PI * 1.5)
        this.sceneLeft.getScene(2).rotate(shoulderRotation)

        // distance from shoulder
        let distance = Math.max(0, this.playerX - mouseX)
        let maxDistance = 600

        // shoulder rotation - left
        this.sceneLeft.getScene(4).rotate(-Math.min(Math.PI * 0.15, distance / maxDistance * Math.PI * 0.15))

        // shoulder stretch
        var shoulderStretch = Math.min(30, distance / maxDistance * 30)
        this.sceneLeft.getScene(2).translate(0, shoulderStretch)

        // elbow rotation
        let pctDistance = distance / maxDistance * 2
        let maxRotation = -(Math.PI * 0.8)
        let elbowRotation = Math.max(0, -(1.0 - pctDistance) * maxRotation)
        this.sceneLeft.getScene(2).getScene(3).rotate(elbowRotation)

        // torso rotation
        let maxTorsoRotation = (Math.PI * 0.05)
        let torsoRotation = Math.min(maxTorsoRotation, distance / maxDistance * maxTorsoRotation)
        this.sceneLeft.getScene(10).rotate(-torsoRotation)

        // // leg rotation right
        let maxLegRotation = Math.PI * 0.15
        this.sceneLeft.getScene(11)
            .rotate(distance / maxDistance * maxLegRotation)
            .translate(distance / maxDistance * 45, distance / maxDistance * -45)

        // leg rotation left
        this.sceneLeft.getScene(12)
            .rotate(distance / maxDistance * -maxLegRotation)
            .translate(distance / maxDistance * -35, distance / maxDistance * 5)
    }

    mouseSceneRight(mouseX: number, mouseY: number) {
        this.facingDir = "right"
        let dx: number = mouseX - this.playerX
        let dy: number = mouseY - this.processing.height / 2
        let angle1: number = this.processing.atan2(dy, dx)

        // shoulder rotation - right
        var shoulderRotation = Math.max((Math.PI * 0.8), Math.min((Math.PI * 2.3), angle1 + (Math.PI * 1.5)))
        this.sceneRight.getScene(2).rotate(shoulderRotation)

        // distance from shoulder
        let distance = Math.max(0, mouseX - this.playerX)
        let maxDistance = 600

        // shoulder rotation - left
        this.sceneRight.getScene(4).rotate(Math.min(Math.PI * 0.15, distance / maxDistance * Math.PI * 0.15))

        // shoulder stretch
        var shoulderStretch = Math.min(30, distance / maxDistance * 30)
        this.sceneRight.getScene(2).translate(-shoulderStretch, shoulderStretch)

        // elbow rotation
        let pctDistance = distance / maxDistance * 2
        let maxRotation = (Math.PI * 0.8)
        let elbowRotation = Math.min(0, -(1.0 - pctDistance) * maxRotation)
        this.sceneRight.getScene(2).getScene(3).rotate(elbowRotation)

        // torso rotation
        let maxTorsoRotation = (Math.PI * 0.05)
        let torsoRotation = Math.min(maxTorsoRotation, distance / maxDistance * maxTorsoRotation)
        this.sceneRight.getScene(10).rotate(torsoRotation)

        // leg rotation right
        let maxLegRotation = Math.PI * 0.15
        this.sceneRight.getScene(11)
            .rotate(torsoRotation + -Math.min(maxLegRotation, distance / maxDistance * maxLegRotation))
            .translate(Math.max(-50, distance / maxDistance * -50), Math.max(-5, distance / maxDistance * -5))

        // leg rotation left
        this.sceneRight.getScene(12)
            .rotate(torsoRotation + Math.min(maxLegRotation, distance / maxDistance * maxLegRotation))
            .translate(Math.min(60, distance / maxDistance * 60), Math.max(-25, distance / maxDistance * -25))
    }

    handleMouse(mouseX: number, mouseY: number) {
        if (mouseX > this.playerX) {
            this.mouseSceneRight(mouseX, mouseY)
        } else {
            this.mouseSceneLeft(mouseX, mouseY)
        }
    }

    collectShapes(): Shape[] {
        let shapes: Shape[] = []
        if (this.facingDir === 'right') {
            this.sceneRight.collect(shapes)
        } else {
            this.sceneLeft.collect(shapes)
        }

        return shapes
    }

}