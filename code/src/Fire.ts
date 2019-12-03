import { CONSTANTS } from "./controls";
import { Physics } from "phaser";

class Fire extends Phaser.GameObjects.Arc {
  x: number;
  y: number;
  group: Phaser.GameObjects.Group;
  smokeParticles: Phaser.GameObjects.GameObject[];
  fire: Phaser.GameObjects.GameObject;
  scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    group: Phaser.GameObjects.Group
  ) {
    super(scene, x, y, CONSTANTS.FIRE_RADIUS, 0, 360, true, 0xfc581a, 1);
    scene.children.add(this);

    //🔥 emoji
    scene.add.sprite(x, y, "fire");
    this.setVisible(false);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.smokeParticles = new Array();
    this.group = group;

    scene.time.addEvent({
      delay: CONSTANTS.SMOKE_EMISSION_RATE,
      callback: () => this.spawn(this.scene),
      callbackScope: this,
      repeat: -1
    });
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

    scene.physics.world.enable(circle); //adds body / enables physics

    //@ts-ignore
    const body: Physics.Arcade.Body = circle.body;
    body
      .setCollideWorldBounds(true)
      .setBounce(0.2, 0.2)
      .setVelocityX(velocityX)
      .setVelocityY(velocityY);

    this.group.add(circle);
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
