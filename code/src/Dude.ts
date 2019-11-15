import { getBody } from "./index";

const MAX_VELOCITY = 150;
const MAX_ACCELERATION = 50;
const MAX_RADIUS = 9;
const MAX_VISUAL_RANGE = 50;

class Dude {
  maxVelocity: number;
  maxAcceleration: number;
  radius: number;
  stressLevel: number;
  visualRange: number;
  health: number;
  out: boolean;

  object: Phaser.GameObjects.GameObject;

  //should't be changed, just informational
  fitness: number;
  weight: number;
  age: number;
  sign: {x: number, y: number};

  constructor(
    x: number,
    y: number,
    fitness: number,
    weight: number,
    age: number,
    scene: Phaser.Scene
  ) {
    this.sign = {x: 0, y: 0};
    this.fitness = fitness; // Math.random(),
    this.weight = weight;   // 0.3 + Math.random() * 0.7
    this.age = age;         // Math.random()

    this.maxVelocity = MAX_VELOCITY * ((fitness * weight) / age);
    this.maxAcceleration = MAX_ACCELERATION * ((fitness * weight) / age);
    this.radius = Math.min(MAX_RADIUS, MAX_RADIUS * (weight / fitness));
    this.stressLevel = Math.random();
    this.visualRange = MAX_VISUAL_RANGE / age;
    this.health = 1;
    this.out = false;

    const circle = scene.add.circle(x, y, this.radius, 0xf1c40f);

    scene.physics.world.enable(circle); //adds body / enables physics
    this.object = circle;
    this.getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0);
  }

  getRadius() {
    return this.radius;
  }

  getBody() {
    return getBody(this.object);
  }

  getSign() {
    return this.sign;
  }

  setSign(x: number, y: number) {
    this.sign.x = x;
    this.sign.y = y;
  }
}

export default Dude;
