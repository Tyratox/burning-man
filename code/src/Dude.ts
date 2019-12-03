import { getBody } from "./index";
import randomNormal from "random-normal";

import { CONSTANTS } from "./controls";

const strictNormal = (mean: number, dev: number) =>
  Math.min(Math.max(randomNormal({ mean, dev }), mean - dev), mean + dev);
const normalFactor = (value: number, mean: number) => value / mean;

class Dude extends Phaser.GameObjects.Arc {
  maxVelocity: number;
  maxAcceleration: number;
  visualRange: number;
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
    this.normalizedRadius = normalFactor(r, CONSTANTS.MEAN_DUDE_RADIUS);

    this.path = null;
    this.visitedTargets = [];
    this.nextNode = 0;

    this.maxVelocity = strictNormal(
      CONSTANTS.MEAN_DUDE_MAX_VELOCITY,
      CONSTANTS.DUDE_MAX_ACCELERATION_STD_DEV
    );

    this.maxAcceleration = strictNormal(
      CONSTANTS.MEAN_DUDE_MAX_VELOCITY,
      CONSTANTS.DUDE_MAX_ACCELERATION_STD_DEV
    );

    this.visualRange = strictNormal(
      CONSTANTS.MEAN_DUDE_VISUAL_RANGE,
      CONSTANTS.DUDE_VISUAL_RANGE_STD_DEV
    );

    this.health = 4000;
    this.name = name;

    scene.children.add(this); //add the the scene
    scene.physics.world.enable(this); //adds body / enables physics
    this.getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0)
      .setFriction(0.9, 0.9);
  }

  getBody() {
    return getBody(this);
  }

  getPosition() {
    return new Phaser.Math.Vector2(this.x, this.y);
  }
}

export default Dude;
