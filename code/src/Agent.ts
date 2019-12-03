import randomNormal from "random-normal";

import { CONSTANTS } from "./controls";

const strictNormal = (mean: number, dev: number) =>
  Math.min(Math.max(randomNormal({ mean, dev }), mean - dev), mean + dev);
const normalFactor = (value: number, mean: number) => value / mean;

class Agent extends Phaser.GameObjects.Arc {
  desiredVelocity: number;
  visualRange: number;
  reactionTime: number;

  health: number;
  name: string;

  //can be used as a reference for weight, around 1
  normalizedRadius: number;

  //the currently tracked path
  visitedTargets: number[];

  path: { x: number; y: number }[];
  nextNode: number;

  constructor(x: number, y: number, name: string, scene: Phaser.Scene) {
    const r = strictNormal(
      CONSTANTS.MEAN_DUDE_RADIUS,
      CONSTANTS.DUDE_RADIUS_STD_DEV
    );

    super(scene, x, y, r, 0, 360, true, 0xf1c40f, 1);
    this.normalizedRadius = normalFactor(r, CONSTANTS.MEAN_DUDE_RADIUS);// THIS DOES NOT MAKE ANY SENSE.

    this.path = null;
    this.visitedTargets = [];
    this.nextNode = 0;

    this.desiredVelocity = strictNormal(
      CONSTANTS.MEAN_DUDE_DESIRED_VELOCITY,
      CONSTANTS.DUDE_DESIRED_VELOCITY_STD_DEV
    );

    this.visualRange = strictNormal(
      CONSTANTS.MEAN_DUDE_VISUAL_RANGE,
      CONSTANTS.DUDE_VISUAL_RANGE_STD_DEV
    );

    this.reactionTime = strictNormal(
      CONSTANTS.MEAN_DUDE_REACTION_TIME,
      CONSTANTS.DUDE_REACTION_TIME_STD_DEV
    );

    this.health = 4000;
    this.name = name;
  }

  getBody() {
    //@ts-ignore
    const body: Phaser.Physics.Arcade.Body = this.body;

    return body;
  }

  getPosition() {
    return new Phaser.Math.Vector2(this.x, this.y);
  }
}

export default Agent;
