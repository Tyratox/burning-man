import { getBody } from "./index";
import randomNormal from "random-normal";

import { CONSTANTS } from "./controls";

const strictNormal = (mean: number, dev: number) =>
  Math.min(Math.max(randomNormal({ mean, dev }), mean - dev), mean + dev);
const normalFactor = (value: number, mean: number) => value / value;

class Dude extends Phaser.GameObjects.Arc {
  maxVelocity: number;
  maxAcceleration: number;
  visualRange: number;
  health: number;
  name: string;

  //should't be changed, just informational
  fitness: number;
  normalizedFitness: number;

  weight: number;
  normalizedWeight: number;

  age: number;
  normalizedAge: number;

  //the currently tracked path
  visitedTargets: number[];
  path: { x: number; y: number }[];

  constructor(x: number, y: number, name: string, scene: Phaser.Scene) {
    const weight = strictNormal(
      CONSTANTS.MEAN_DUDE_WEIGHT,
      CONSTANTS.DUDE_WEIGHT_STD_DEV
    );
    const normalizedWeight = normalFactor(weight, CONSTANTS.MEAN_DUDE_WEIGHT);

    const fitness = strictNormal(
      CONSTANTS.MEAN_DUDE_FITNESS,
      CONSTANTS.DUDE_FITNESS_STD_DEV
    );
    const normalizedFitness = normalFactor(
      fitness,
      CONSTANTS.MEAN_DUDE_FITNESS
    );

    const normalizedAgility = normalizedFitness / normalizedWeight;

    const age = strictNormal(
      CONSTANTS.MEAN_DUDE_AGE,
      CONSTANTS.DUDE_AGE_STD_DEV
    );
    const normalizedAge = normalFactor(age, CONSTANTS.MEAN_DUDE_AGE);

    const r =
      strictNormal(CONSTANTS.MEAN_DUDE_RADIUS, CONSTANTS.DUDE_RADIUS_STD_DEV) *
      (1 / normalizedAgility);

    super(scene, x, y, r, 0, 360, true, 0xf1c40f, 1);

    scene.children.add(this);

    this.path = null;
    this.visitedTargets = [];
    this.fitness = fitness;
    this.weight = weight;
    this.age = age;

    this.normalizedWeight = normalizedWeight;
    this.normalizedFitness = normalizedFitness;
    this.normalizedAge = normalizedAge;

    this.maxVelocity =
      strictNormal(
        CONSTANTS.MEAN_DUDE_MAX_VELOCITY,
        CONSTANTS.DUDE_MAX_ACCELERATION_STD_DEV
      ) * normalizedAgility;

    this.maxAcceleration =
      strictNormal(
        CONSTANTS.MEAN_DUDE_MAX_VELOCITY,
        CONSTANTS.DUDE_MAX_ACCELERATION_STD_DEV
      ) * normalizedAgility;

    this.visualRange =
      strictNormal(
        CONSTANTS.MEAN_DUDE_VISUAL_RANGE,
        CONSTANTS.DUDE_VISUAL_RANGE_STD_DEV
      ) / this.normalizedAge;

    this.health = 4000;
    this.name = name;

    scene.physics.world.enable(this); //adds body / enables physics
    this.getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0);
  }

  getBody() {
    return getBody(this);
  }
}

export default Dude;
