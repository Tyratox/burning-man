import { getBody } from "./index";
import { Scene } from "phaser";
import { spawn } from "child_process";

const MAX_RADIUS = 20;
const MIN_RADIUS = 10;

const VELOCITY = 30;
const VISIBILITY = 0.3;

class Fire {
  x: number;
  y: number;
  group: Phaser.GameObjects.Group;
  smokeParticles: Phaser.GameObjects.GameObject[];

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
    for (let i = 0; i < amount; i++) {
      this.spawn(scene);
    }
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
      
      this.smokeParticles.push(circle);
      this.group.add(circle);
  }
}

export default Fire;
