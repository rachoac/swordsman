import Scene from "./scene";
import {Rect, Point, Color} from "./shape";

export default class Fighter {

    sceneLeft: Scene
    sceneRight: Scene
    processing: any
    facingDir: string
    playerX: number

    constructor(processing: any, playerX: number) {
        this.processing = processing
        this.playerX = playerX

        this.sceneLeft = this.createSceneLeft()
        this.sceneRight = this.createSceneRight()
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