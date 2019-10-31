import { getBody } from "./index";

const MAX_VELOCITY = 150;
const MAX_ACCELERATION = 50;
const MAX_RADIUS = 50;
const MAX_VISUAL_RANGE = 50;

class Dude {
  maxVelocity: number;
  maxAcceleration: number;
  radius: number;
  stressLevel: number;
  visualRange: number;

  object: Phaser.GameObjects.GameObject;

  //should't be changed, just informational
  fitness: number;
  weight: number;
  age: number;

  constructor(
    x: number,
    y: number,
    fitness: number,
    weight: number,
    age: number,
    scene: Phaser.Scene
  ) {
    this.fitness = fitness;
    this.weight = weight;
    this.age = age;

    this.maxVelocity = MAX_VELOCITY * ((fitness * weight) / age);
    this.maxAcceleration = MAX_ACCELERATION * ((fitness * weight) / age);
    this.radius = MAX_RADIUS * (weight / fitness);
    this.stressLevel = Math.random();
    this.visualRange = MAX_VISUAL_RANGE / age;

    const circle = scene.add.circle(x, y, 7.5, 0xffffff);

    scene.physics.world.enable(circle); //adds body / enables physics
    this.object = circle;
    this.getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0);
  }

  getBody() {
    return getBody(this.object);
  }
}

export default Dude;
