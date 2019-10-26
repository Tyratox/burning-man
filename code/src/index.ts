import * as Phaser from "phaser";
import { throttle } from "lodash";

import Dude from "./Dude";

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type CreateSceneFromObjectConfig = Phaser.Types.Scenes.CreateSceneFromObjectConfig;
type GameConfig = Phaser.Types.Core.GameConfig;

const WIDTH = 800;
const HEIGHT = 600;

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
  const dudeGroup = this.add.group();

  for (let i = 0; i < 5; i++) {
    const dude = new Dude(Math.random(), Math.random(), Math.random());
    dudeGroup.add(dude.generateSprite(this));
    dudes.push(dude);
  }

  this.physics.add.collider(dudeGroup, dudeGroup, (p1, p2) => {
    //collision callback
  });
};

const calculateForces = throttle(() => {
  const accelerations = new Array(dudes.length)
    .fill(null)
    .map(_ => ({ x: 0, y: 0 }));

  for (let i = 0; i < dudes.length; i++) {
    for (let j = i + 1; j < dudes.length; j++) {
      const dude1 = dudes[i],
        dude2 = dudes[j];

      const diffX = dude1.getBody().x - dude2.getBody().x;
      const diffY = dude1.getBody().y - dude2.getBody().y;

      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      const pushingForce =
        0.5 *
        Math.exp(
          (distance - (dude1.getBody().radius + dude2.getBody().radius)) / 10e15
        );

      const pullingForce = distance / 10e1;

      const force = pushingForce + pullingForce * -1;

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
  console.log("accelerations after", accelerations);
}, 1000);

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
  width: WIDTH,
  height: HEIGHT,
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
