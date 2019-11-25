import { getBody } from "./index";

import {
  MAX_RADIUS,
  MIN_RADIUS,
  VELOCITY,
  VISIBILITY,
  FIRE_RADIUS,
  SMOKE_EMISSION_RATE,
  MAX_SMOKE_PARTICLES_PER_FIRE
} from "./controls";

class Fire {
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
    amount: number,
    group: Phaser.GameObjects.Group
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.smokeParticles = new Array();
    this.group = group;
    this.fire = scene.add
      .circle(this.x, this.y, FIRE_RADIUS, 0xfc581a)
      .setVisible(false);
    scene.time.addEvent({
      delay: SMOKE_EMISSION_RATE,
      callback: () => this.spawn(this.scene),
      callbackScope: this,
      repeat: -1
    });
  }

  spawn(scene: Phaser.Scene) {
    const radius = MAX_RADIUS * Math.random() + MIN_RADIUS;
    const circle = scene.add.circle(this.x, this.y, radius, 0x626262);
    circle.alpha = VISIBILITY;

    const sign1 = Math.random() > 0.5 ? -1 : 1;
    const sign2 = Math.random() > 0.5 ? -1 : 1;

    const velocityX = sign1 * Math.random() * VELOCITY;
    const velocityY = sign2 * Math.random() * VELOCITY;

    scene.physics.world.enable(circle); //adds body / enables physics
    getBody(circle)
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
        (1000 * MAX_SMOKE_PARTICLES_PER_FIRE) / (SMOKE_EMISSION_RATE / 1000),
      repeat: 0,
      yoyo: false,
      onComplete: function() {
        circle.destroy();
      }
    });
  }
}

export default Fire;
