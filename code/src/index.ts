import * as Phaser from "phaser";

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type CreateSceneFromObjectConfig = Phaser.Types.Scenes.CreateSceneFromObjectConfig;
type GameConfig = Phaser.Types.Core.GameConfig;

const preload: ScenePreloadCallback = function(this: Phaser.Scene) {
  //load images if needed
};

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  this.add.circle(100, 100, 100, 0xff0000, 0.8);
};

const scene: CreateSceneFromObjectConfig = {
  preload: preload,
  create: create
};

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "burning-man",
  width: 800,
  height: 600,
  scene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 }
    }
  }
};

const game = new Phaser.Game(config);
