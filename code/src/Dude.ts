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

  sprite: Phaser.GameObjects.GameObject;

  //should't be changed, just informational
  fitness: number;
  weight: number;
  age: number;

  constructor(fitness: number, weight: number, age: number) {
    this.fitness = fitness;
    this.weight = weight;
    this.age = age;

    this.maxVelocity = MAX_VELOCITY * ((fitness * weight) / age);
    this.maxAcceleration = MAX_ACCELERATION * ((fitness * weight) / age);
    this.radius = MAX_RADIUS * (weight / fitness);
    this.stressLevel = Math.random();
    this.visualRange = MAX_VISUAL_RANGE / age;
  }

  generateSprite(scene: Phaser.Scene) {
    const sprite = scene.physics.add
      .sprite(
        10 + Math.random() * 780,
        10 + Math.random() * 580,
        Math.random().toString(),
        null
      )
      //.setVelocity(Math.random() * 100, Math.random() * 100)
      .setCollideWorldBounds(true)
      .setTintFill()
      .setBounce(0.8);

    this.sprite = sprite;
    return sprite;
  }

  getBody() {
    return getBody(this.sprite);
  }
}

export default Dude;
