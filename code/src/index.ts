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
  dudes.forEach(dude1 => {
    dudes.forEach(dude2 => {
      if (dude1 === dude2) {
        return;
      }

      const diffX = dude1.getBody().x - dude2.getBody().x;
      const diffY = dude1.getBody().y - dude2.getBody().y;

      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      const force =
        5 *
        Math.exp(
          (dude1.getBody().radius + dude2.getBody().radius - distance) * 10e5
        );

      const directionX = (dude1.getBody().x - dude2.getBody().x) / distance;
      const directionY = (dude1.getBody().y - dude2.getBody().y) / distance;

      console.log(force, directionX, (force * directionX) / dude1.weight);
      dude1.getBody().setAccelerationX((force * directionX) / dude1.weight);
      dude1.getBody().setAccelerationY((force * directionY) / dude1.weight);
    });
  });
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
      gravity: { x: 0, y: 0 }
    }
  }
};

const game = new Phaser.Game(config);
