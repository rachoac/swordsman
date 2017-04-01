import Scene from "./scene";
import {Rect, Point, Color} from "./shape";
import {Shape} from "./shape";

export default class Fighter {

    sceneLeft: Scene
    sceneRight: Scene
    processing: any
    facingDir: string
    playerX: number
    angle1: number
    distance: number

    walking: boolean
    walkDir: string
    walkCtr: number
    walkSign: number

    constructor(processing: any, playerX: number) {
        this.processing = processing
        this.playerX = playerX
        this.walkCtr = 0
        this.walkSign = 5

        this.sceneLeft = this.createSceneLeft()
        this.sceneRight = this.createSceneRight()
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

    setFacingDir(facingDir: string) {
        this.facingDir = facingDir
    }

    private createSceneLeft(): Scene {
        let scene: Scene = new Scene(1, this.processing,
            this.playerX, this.processing.height / 2)

        let legScene2: Scene = new Scene(12, this.processing, 0, 0)
        legScene2
            .addShape(new Rect(0, 135, 60, 80).rotate(Math.PI * 0.04))
            .addShape(new Rect(8, 210, 50, 120).rotate(-Math.PI * 0.04))
        scene.addScene(legScene2)

        let armScene2: Scene = new Scene(4, this.processing, 10, 0)
        armScene2.pin = new Point(25, 0)
        scene.addScene(armScene2)
        armScene2
            .addShape(new Rect(0, 0, 50, 70))
        {
            let foreArm: Scene = new Scene(1, this.processing, 0, 71)
            armScene2.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(Math.PI * 0.3)
        }

        let bodyScene: Scene = new Scene(10, this.processing, -10, -10)
        scene.addScene(bodyScene)

        let legScene: Scene = new Scene(11, this.processing, 0, 0)
        legScene
            .addShape(new Rect(0, 140, 60, 80).rotate(Math.PI * 0.05))
            .addShape(new Rect(10, 215, 50, 120).rotate(-Math.PI * 0.05))

        scene.addScene(legScene)

        bodyScene
            .addShape(new Rect(0, 0, 80, 100))
            .addShape(new Rect(5, 101, 70, 50))
            .addShape(new Rect(10, -52, 50, 50))

        let armScene: Scene = new Scene(2, this.processing, 10, 0)
        armScene.pin = new Point(25, 0)
        scene.addScene(armScene)
        armScene
            .addShape(new Rect(0, 0, 50, 70))
        {
            let foreArm: Scene = new Scene(3, this.processing, 0, 71)
            armScene.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(Math.PI * 0.15)

            let sword: Rect = new Rect(22, 131, 5, 210);
            sword.setColor(new Color(255, 0, 0, 255))
            foreArm.addShape(new Rect(3, 0, 40, 100))
                .addShape(new Rect(4, 101, 35, 30))
                .addShape(sword)
        }

        return scene
    }

    private createSceneRight(): Scene {
        // create player scene
        let scene: Scene = new Scene(1, this.processing,
            this.playerX, this.processing.height / 2)

        let legScene2: Scene = new Scene(12, this.processing, 0, 0)
        legScene2
            .addShape(new Rect(8, 135, 60, 80).rotate(-Math.PI * 0.04))
            .addShape(new Rect(18, 210, 50, 120).rotate(Math.PI * 0.04))
        scene.addScene(legScene2)

        let armScene2: Scene = new Scene(4, this.processing, 0, 0)
        armScene2.pin = new Point(25, 0)
        scene.addScene(armScene2)
        armScene2
            .addShape(new Rect(0, 0, 50, 70))
        {
            let foreArm: Scene = new Scene(1, this.processing, 0, 71)
            armScene2.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(-Math.PI * 0.3)
        }

        let bodyScene: Scene = new Scene(10, this.processing, -10, -10)
        scene.addScene(bodyScene)

        let legScene: Scene = new Scene(11, this.processing, 0, 0)
        legScene
            .addShape(new Rect(10, 140, 60, 80).rotate(-Math.PI * 0.05))
            .addShape(new Rect(20, 215, 50, 120).rotate(Math.PI * 0.05))

        scene.addScene(legScene)

        bodyScene
            .addShape(new Rect(0, 0, 80, 100))
            .addShape(new Rect(5, 101, 70, 50))
            .addShape(new Rect(20, -52, 50, 50))

        let armScene: Scene = new Scene(2, this.processing, 0, 0)
        armScene.pin = new Point(25, 0)
        scene.addScene(armScene)
        armScene
            .addShape(new Rect(0, 0, 50, 70))

        {
            let foreArm: Scene = new Scene(3, this.processing, 0, 71)
            armScene.addScene(foreArm)
            foreArm.pin = new Point(25, 0)
            foreArm.rotate(-Math.PI * 0.15)

            let sword: Rect = new Rect(22, 131, 5, 210);
            sword.setColor(new Color(255, 0, 0, 255))
            foreArm.addShape(new Rect(3, 0, 40, 100))
                .addShape(new Rect(4, 101, 35, 30))
                .addShape(sword)
        }

        return scene
    }

    mouseSceneLeft() {
        const distance = this.distance
        const angle1 = this.angle1
        // shoulder rotation - right
        var shoulderRotation = angle1 + (Math.PI * 1.5)
        this.sceneLeft.getScene(2).rotate(shoulderRotation)

        // distance from shoulder
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

    mouseSceneRight() {
        const distance = this.distance
        const angle1 = this.angle1

        // shoulder rotation - right
        var shoulderRotation = Math.max((Math.PI * 0.8), Math.min((Math.PI * 2.3), angle1 + (Math.PI * 1.5)))
        this.sceneRight.getScene(2).rotate(shoulderRotation)

        // distance from shoulder
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

    orient(facingRight: boolean, distance: number, angle1: number) {
        this.angle1 = angle1
        this.distance = distance
        if (facingRight) {
            this.facingDir = "right"
            this.mouseSceneRight()
        } else {
            this.facingDir = "left"
            this.mouseSceneLeft()
        }
    }

    handleWalking() {
        this.walkCtr += this.walkSign
        if (this.walkCtr > 100 || this.walkCtr < 0) {
            this.walkSign *= -1
        }

        if (this.facingDir === "right") {
            // distance from shoulder
            let maxDistance = 600
            let maxTorsoRotation = (Math.PI * 0.05)
            let torsoRotation = Math.min(maxTorsoRotation, this.distance / maxDistance * maxTorsoRotation)

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

    collectShapes(): Shape[] {
        let shapes: Shape[] = []
        if (this.facingDir === 'right') {
            this.sceneRight.collect(shapes)
        } else {
            this.sceneLeft.collect(shapes)
        }

        return shapes
    }

    render() {
        if (this.facingDir === "right") {
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

}