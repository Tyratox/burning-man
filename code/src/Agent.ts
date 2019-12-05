import randomNormal from "random-normal";

import { CONSTANTS } from "./controls";
import SimulationController from "./SimulationController";

export const strictNormal = (mean: number, dev: number) =>
  Math.min(Math.max(randomNormal({ mean, dev }), mean - dev), mean + dev);
const normalFactor = (value: number, mean: number) => value / mean;

interface Vector {
  x: number;
  y: number;
}

interface MatterBody {
  velocity: Vector;
}

class Agent extends Phaser.GameObjects.Ellipse {
  desiredVelocity: number;
  visualRange: number;
  reactionTime: number;

  health: number;
  name: string;

  radius: number;

  body: MatterJS.Body;

  //can be used as a reference for weight, around 1
  normalizedRadius: number;

  //the currently tracked path
  visitedTargets: number[];

  path: { x: number; y: number }[];
  nextNode: number;

  constructor(
    x: number,
    y: number,
    r: number,
    name: string,
    controller: SimulationController
  ) {
    super(controller.scene, x, y, r, r, 0xf1c40f, 1);

    this.radius = r;
    //this.setScale(this.radius / 50); //image sizes is 100x100 and we weant pixel density 2

    this.normalizedRadius = normalFactor(
      this.radius,
      CONSTANTS.MEAN_DUDE_RADIUS
    );
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

    controller.scene.matter.add.gameObject(this, {
      label: "Agent",
      shape: "circle",
      chamfer: null,

      isStatic: false,
      isSensor: false,
      isSleeping: false,
      ignoreGravity: false,
      ignorePointer: false,

      sleepThreshold: 60,
      density: 50,
      restitution: 0,
      friction: 0.3,
      frictionStatic: 0.5,
      frictionAir: 0.01,

      force: { x: 0, y: 0 },
      angle: 0,
      torque: 0,

      slop: 0.05,

      timeScale: 1
    });

    this.setCollisionCategory(controller.agentGroup);
    this.setCollidesWith([
      controller.agentGroup,
      controller.wallGroup,
      controller.tableGroup,
      controller.attractiveTargetGroup,
      controller.despawnZoneGroup
    ]);
  }

  getBody = () => {
    //@ts-ignore
    const body: MatterBody = this.body;
    return body;
  };

  getVelocity = () => {
    const v = this.getBody().velocity;
    return new Phaser.Math.Vector2(v.x, v.y);
  };

  getPosition = () => {
    return new Phaser.Math.Vector2(this.x, this.y);
  };
}

export default Agent;
