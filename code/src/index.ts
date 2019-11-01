import * as Phaser from "phaser";
import { throttle } from "lodash";

import Dude from "./Dude";
import map from "./map";
import { sign } from "crypto";

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
      0xff0000
    );

    walls.add(rect);
  }

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

const rayTrace = (dude) => {
  let target;
  let targetDist;
  let currentDist;
  let [sign, vec];
  let [from, to];
  let signToAgent;
  let wall;
  
  for (let i = 0; i < map.signs.length; i++) {
    const [sign, vec] = map.signs[i];
    if ((vec.x * (dude.x + sign.x) + vec.y * (dude.y + sign.y)) < 0) {
      let set = true;
      signToAgent = new Phaser.Geom.Line(dude.x, dude.y, sign.x, sign.y);
      currentDist = Math.sqrt((sign.x - dude.x) * (sign.x - dude.x) + (sign.y - dude.y) * (sign.y - dude.y));

      for (let k = 0; k < map.walls.length; k++) {
        [from, to] = map.walls[k]; // faster when outside loops??
        wall = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
        if (Phaser.Geom.Intersects.LineToLine(wall, signToAgent)) {
          set = false;
          break
        } 
      }
      if (set) {
        targetDist = Math.min(targetDist, currentDist)
        }
      }
    }
  }
}

const calculateForces = () => {
  const accelerations = new Array(dudes.length)
    .fill(null)
    .map(_ => ({ x: 0, y: 0 }));

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
      const pushingForce = (1 / 1000) * Math.exp(205 / distance);

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

const update = () => {
  calculateForces();
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
      gravity: { x: 0, y: 0 },
      fps: 30
    }
  }
};

const game = new Phaser.Game(config);
