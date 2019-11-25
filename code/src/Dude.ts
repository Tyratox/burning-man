import { getBody } from "./index";

const MAX_VELOCITY = 150;
const MAX_ACCELERATION = 50;
const MAX_RADIUS = 9;
const MAX_VISUAL_RANGE = 50;

class Dude extends Phaser.GameObjects.Arc {
  maxVelocity: number;
  maxAcceleration: number;
  radius: number;
  stressLevel: number;
  visualRange: number;
  health: number;
  name: string;

  //should't be changed, just informational
  fitness: number;
  weight: number;
  age: number;
  sign: { x: number; y: number };

  constructor(
    x: number,
    y: number,
    fitness: number,
    weight: number,
    age: number,
    name: string,
    scene: Phaser.Scene
  ) {
    const radius = Math.min(MAX_RADIUS, MAX_RADIUS * (weight / fitness));
    super(scene, x, y, radius, 0, 360, true, 0xf1c40f, 1);

    scene.children.add(this);

    this.sign = { x: 0, y: 0 };
    this.fitness = fitness; // Math.random(),
    this.weight = weight; // 0.6 + Math.random() * 0.4
    this.age = age; // Math.random()

    this.maxVelocity = MAX_VELOCITY * ((fitness * weight) / age);
    this.maxAcceleration = MAX_ACCELERATION * ((fitness * weight) / age);
    this.radius = radius;
    this.stressLevel = Math.random();
    this.visualRange = MAX_VISUAL_RANGE / age;
    this.health = 4000;
    this.name = name;

    scene.physics.world.enable(this); //adds body / enables physics
    this.getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0);
  }

  getRadius() {
    return this.radius;
  }

  getBody() {
    return getBody(this);
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
