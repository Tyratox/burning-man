import { getBody } from "./index";
import randomNormal from "random-normal";

import { CONSTANTS } from "./controls";

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

  //the currently tracked sign
  sign: { x: number; y: number };

  constructor(x: number, y: number, name: string, scene: Phaser.Scene) {
    const weight = Math.min(
      Math.max(
        randomNormal({
          mean: CONSTANTS.MEAN_DUDE_WEIGHT,
          dev: CONSTANTS.DUDE_WEIGHT_STD_DEV
        }),
        0.1
      ),
      1
    );
    const fitness = Math.min(
      Math.max(
        randomNormal({
          mean: CONSTANTS.MEAN_DUDE_FITNESS,
          dev: CONSTANTS.DUDE_FITNESS_STD_DEV
        }),
        0.1
      ),
      1
    );

    const r = Math.max(
      randomNormal({
        mean: CONSTANTS.MEAN_DUDE_RADIUS,
        dev: CONSTANTS.DUDE_RADIUS_STD_DEV
      }),
      8
    );

    const radius = Math.min(
      Math.max((r * Math.pow(weight, 2)) / fitness, 9),
      18
    );
    super(scene, x, y, radius, 0, 360, true, 0xf1c40f, 1);

    scene.children.add(this);

    this.sign = { x: 0, y: 0 };
    this.fitness = fitness;
    this.weight = weight;
    this.age = Math.min(
      Math.max(
        randomNormal({
          mean: CONSTANTS.MEAN_DUDE_AGE,
          dev: CONSTANTS.DUDE_AGE_STD_DEV
        }),
        0.1
      ),
      1
    );

    this.maxVelocity = Math.max(
      randomNormal({
        mean: CONSTANTS.MEAN_DUDE_MAX_VELOCITY,
        dev: CONSTANTS.DUDE_MAX_VELOCITY_STD_DEV
      }) *
        ((fitness * weight) / this.age),
      100
    );
    this.maxAcceleration =
      Math.max(
        randomNormal({
          mean: CONSTANTS.MEAN_DUDE_MAX_ACCELERATION,
          dev: CONSTANTS.DUDE_MAX_ACCELERATION_STD_DEV
        }),
        30
      ) *
      ((fitness * weight) / this.age);
    this.radius = radius;
    this.stressLevel = Math.random();
    this.visualRange =
      Math.max(
        randomNormal({
          mean: CONSTANTS.MEAN_DUDE_VISUAL_RANGE,
          dev: CONSTANTS.DUDE_VISUAL_RANGE_STD_DEV
        }),
        300
      ) / this.age;
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
