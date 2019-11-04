import * as Phaser from "phaser";
import { throttle } from "lodash";

import Dude from "./Dude";
import map from "./map";

const TRIANGLE_HEIGHT = 20;
const TRIANGLE_SIZE = 10;

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type CreateSceneFromObjectConfig = Phaser.Types.Scenes.CreateSceneFromObjectConfig;
type GameConfig = Phaser.Types.Core.GameConfig;

export const getBody = (
  obj: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Body =>
  //@ts-ignore
  obj.body;

const dudes: Dude[] = [];

const preload: ScenePreloadCallback = function(this: Phaser.Scene) {
  //load images if needed
};

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  //generate map, yehei

  const walls = this.physics.add.staticGroup();
  const halfThickness = map.wallThickness / 2;

  for (let i = 0; i < map.walls.length; i++) {
    const [from, to] = map.walls[i];
    const rect = this.add.rectangle(
      from.x + (to.x - from.x) / 2,
      from.y + (to.y - from.y) / 2,
      to.x - from.x + halfThickness,
      to.y - from.y + halfThickness,
      0x000000
    );

    walls.add(rect);
  }

  map.signs.forEach(({ position, direction }) => {
    const triangle = this.add.isotriangle(
      position.x,
      position.y,
      TRIANGLE_SIZE,
      TRIANGLE_HEIGHT,
      false,
      0x237f52,
      0x2ecc71,
      0x27ae60
    );
    const directionNorm = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

    triangle.rotation =
      (direction.x > 0 ? 1 : -1) * Math.acos(-direction.y / directionNorm);
  });

  const dudeGroup = this.add.group();

  map.spawnPoints.forEach(point => {
    const dude = new Dude(
      point.x,
      point.y,
      Math.random(),
      0.3 + Math.random() * 0.7,
      Math.random(),
      this
    );
    dudeGroup.add(dude.object);
    dudes.push(dude);
  });

  this.physics.add.collider(dudeGroup, dudeGroup, (p1, p2) => {
    //collision callback
  });
  this.physics.add.collider(dudeGroup, walls);
};

const rayTrace = (dude: Dude, scene: Phaser.Scene) =>
  map.signs.reduce(
    (best, element) => {
      const { position: sign, orientation: vec } = element;
      const { x: dudeX, y: dudeY } = dude.getBody();

      if (vec.x * (sign.x - dudeX) + vec.y * (sign.y - dudeY) < 0) {
        const signToAgent = new Phaser.Geom.Line(dudeX, dudeY, sign.x, sign.y);
        const currentDist = Math.sqrt(
          (sign.x - dudeX) * (sign.x - dudeX) +
            (sign.y - dudeY) * (sign.y - dudeY)
        );

        const intersect = map.walls.find(coordinates => {
          const [from, to] = coordinates;
          const wall = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
          if (Phaser.Geom.Intersects.LineToLine(wall, signToAgent)) {
            return true;
          }

          return false;
        });

        /*if (intersect === undefined) {
          scene.add
            .line(0, 0, dudeX, dudeY, sign.x, sign.y, 0x000000, 0.1)
            .setOrigin(0, 0);
        }*/

        //if the sight isn't intersected and the distance is shorter return the new one
        return intersect === undefined && best.distance > currentDist
          ? { distance: currentDist, sign }
          : best;
      }

      return best;
    },
    { distance: Number.MAX_VALUE, sign: null }
  ).sign;

const calculateForces = (scene: Phaser.Scene) => {
  const accelerations = new Array(dudes.length)
    .fill(null)
    .map(_ => ({ x: 0, y: 0 }));

  //calculate directioncorrecting force
  const reactionTime = 5;
  const desiredVelocity = 100;
  let vel = new Phaser.Math.Vector2(); //current velocity
  let dVel = new Phaser.Math.Vector2(); //desired Velocity, with |DVel| = desired speed
  for (let i = 0; i < dudes.length; i++) {
    // CorrectingForce = Mass*(Vdesired-Vcurr)/reactionTime
    const sign = rayTrace(dudes[i], scene);
    let signX: number, signY: number;

    if (sign !== null) {
      signX = sign.x;
      signY = sign.y;
    } else {
      continue;
    }

    //calculate here the desired velocity from the target value
    const directionOfSign = new Phaser.Math.Vector2({ x: signX, y: signY });
    directionOfSign.subtract(dudes[i].getBody().position);
    directionOfSign.normalize();
    dVel = directionOfSign.scale(desiredVelocity);
    vel = dudes[i].getBody().velocity;
    const fcorrect = dVel.clone();
    fcorrect.subtract(vel);
    fcorrect.scale(dudes[i].weight / reactionTime);
    accelerations[i].x += fcorrect.x;
    accelerations[i].y += fcorrect.y;
  }

  //calculate push force on every agent from the nearest piece of wall
  /*for (let i = 0; i < dudes.length; i++) {
    let distToWall= Number.MAX_VALUE;
    var Pos = dudes[i].getBody().position;
    for(let j=0; j<map.walls.length;j++){
      map.walls[j].
    }
  }*/

  for (let i = 0; i < dudes.length; i++) {
    for (let j = i + 1; j < dudes.length; j++) {
      const dude1 = dudes[i],
        dude2 = dudes[j];

      const diffX = dude1.getBody().x - dude2.getBody().x;
      const diffY = dude1.getBody().y - dude2.getBody().y;

      const distance =
        Math.sqrt(diffX * diffX + diffY * diffY) -
        (dude1.getBody().radius + dude2.getBody().radius);

      //the smaller the distance the bigger the force
      //the bigger the distance the smaller the force
      //force ~ e^{-distance} = 1/(e^{distance}) (exponentially falling with distance)
      //OR => force ~ e^{1/distance} => exponentially increasing with small distances
      const pushingForce = Math.min((1 / 1000) * Math.exp(205 / distance), 100);

      //the bigger the distance the smaller the pulling force
      const pullingForce = 1 / (distance * 5000);

      const force = pushingForce - pullingForce;

      const directionXForDude1 =
        (dude1.getBody().x - dude2.getBody().x) / distance;
      const directionYForDude1 =
        (dude1.getBody().y - dude2.getBody().y) / distance;

      accelerations[i].x += (force * directionXForDude1) / dude1.weight;
      accelerations[i].y += (force * directionYForDude1) / dude1.weight;

      accelerations[j].x += (force * directionXForDude1 * -1) / dude2.weight;
      accelerations[j].y += (force * directionYForDude1 * -1) / dude2.weight;
    }
  }

  accelerations.forEach((acceleration, index) =>
    dudes[index].getBody().setAcceleration(acceleration.x, acceleration.y)
  );
};

const update = function(this: Phaser.Scene) {
  calculateForces(this);
};

const scene: CreateSceneFromObjectConfig = {
  preload: preload,
  create: create,
  update: update
};

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "burning-man",
  width: map.width,
  height: map.height,
  scene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 }
    }
  },

  backgroundColor: 0xffffff
};

const game = new Phaser.Game(config);
