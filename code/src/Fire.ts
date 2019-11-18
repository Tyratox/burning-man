import { getBody } from "./index";
import { Scene } from "phaser";
import { spawn } from "child_process";

const MAX_RADIUS = 20;
const MIN_RADIUS = 10;

const VELOCITY = 30;
const VISIBILITY = 0.1;
const FIRE_RADIUS = 20;

class Fire {
  x: number;
  y: number;
  group: Phaser.GameObjects.Group;
  smokeParticles: Phaser.GameObjects.GameObject[];
  fire: Phaser.GameObjects.GameObject;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    amount: number,
    group: Phaser.GameObjects.Group
  ) {
    this.x = x;
    this.y = y;
    this.smokeParticles = new Array();
    this.group = group;
    const circle = scene.add.circle(this.x, this.y, FIRE_RADIUS, 0xFC581A);
    this.fire = circle;
    scene.time.addEvent({ delay: 5000, callback: (scene) => this.spawn, callbackScope: this, repeat: (100000 / 100) - 1 });
    // for (let i = 0; i < amount; i++) {
    //   this.spawn(scene);
    // }
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
        alpha: { from: 0.2, to: 0 },
        ease: 'Linear',
        duration: 100000,
        repeat: 0,
        yoyo: false,
        onComplete: function () {
          circle.destroy();
        },
      });
  }
}

export default Fire;