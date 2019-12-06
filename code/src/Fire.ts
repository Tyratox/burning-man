import { CONSTANTS } from "./controls";
import { Physics } from "phaser";
import SimulationController from "./SimulationController";

class Fire extends Phaser.GameObjects.Arc {
  x: number;
  y: number;
  smokeParticles: Phaser.GameObjects.GameObject[];
  fire: Phaser.GameObjects.GameObject;
  controller: SimulationController;

  constructor(x: number, y: number, controller: SimulationController) {
    super(
      controller.scene,
      x,
      y,
      CONSTANTS.FIRE_RADIUS,
      0,
      360,
      true,
      0xfc581a,
      1
    );

    //🔥 emoji
    controller.scene.add.sprite(x, y, "fire");
    this.setVisible(false);

    this.scene = controller.scene;
    this.x = x;
    this.y = y;
    this.smokeParticles = new Array();
    this.controller = controller;

    controller.scene.time.addEvent({
      delay: CONSTANTS.SMOKE_EMISSION_RATE,
      callback: () => this.spawn(this.scene),
      callbackScope: this,
      repeat: -1
    });

    controller.scene.matter.add.gameObject(this, {
      label: "Fire",
      shape: "circle",
      chamfer: null,

      isStatic: true,
      isSensor: false
    });

    this.setCollisionCategory(controller.fireGroup);
    this.setCollidesWith([controller.agentGroup]);
  }

  spawn(scene: Phaser.Scene) {
    const radius =
      CONSTANTS.MIN_SMOKE_RADIUS +
      (CONSTANTS.MAX_SMOKE_RADIUS - CONSTANTS.MIN_SMOKE_RADIUS) * Math.random();
    const circle = scene.add.circle(this.x, this.y, radius, 0x090909, 0.4);

    const sign1 = Math.random() > 0.5 ? -1 : 1;
    const sign2 = Math.random() > 0.5 ? -1 : 1;

    const velocityX = sign1 * Math.random() * CONSTANTS.SMOKE_VELOCITY;
    const velocityY = sign2 * Math.random() * CONSTANTS.SMOKE_VELOCITY;

    this.controller.scene.matter.add.gameObject(circle, {
      label: "Smoke",
      shape: "circle",
      chamfer: null,

      isStatic: true,
      isSensor: false
    });

    this.body.force = { x: velocityX, y: velocityY };
    // Delete faded smoke particles
    scene.tweens.add({
      targets: circle,
      alpha: { from: 0.6, to: 0 },
      scale: { from: 1, to: 2 },
      ease: "cubic.out",
      duration:
        (1000 * CONSTANTS.MAX_SMOKE_PARTICLES_PER_FIRE) /
        (CONSTANTS.SMOKE_EMISSION_RATE / 1000),
      repeat: 0,
      yoyo: false,
      onComplete: () => circle.destroy()
    });
  }
}

export default Fire;
