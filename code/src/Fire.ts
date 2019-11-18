import { getBody } from "./index";
import { Scene } from "phaser";
import { spawn } from "child_process";

const AverageRadius = 50;
const MinRadius = 10;

const Velocity = 40;
const MinVelocity = 10;

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
    const radius = AverageRadius * Math.random() + MinRadius;
      const circle = scene.add.circle(this.x, this.y, radius, 0x626262);
      circle.alpha = 0.7;

      const sign1 = Math.random() > 0.5 ? -1 : 1;
      const sign2 = Math.random() > 0.5 ? -1 : 1;

      const velocityX = sign1 * (Math.random() * Velocity + MinVelocity);
      const velocityY = sign2 * (Math.random() * Velocity + MinVelocity);

      scene.physics.world.enable(circle); //adds body / enables physics
      getBody(circle)
        .setCollideWorldBounds(true)
        .setBounce(0, 0)
        .setVelocityX(velocityX)
        .setVelocityY(velocityY);
      
      this.smokeParticles.push(circle);
      this.group.add(circle);
  }
}

export default Fire;
