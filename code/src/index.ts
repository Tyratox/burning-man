import * as Phaser from "phaser";
import LogoImg from "./assets/logo.png";

const preload: Phaser.Types.Scenes.ScenePreloadCallback = function(
  this: Phaser.Scene
) {
  this.load.image("logo", LogoImg);
};

const create: Phaser.Types.Scenes.SceneCreateCallback = function(
  this: Phaser.Scene
) {
  const logo = this.add.image(400, 150, "logo");

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });
};

const scene: Phaser.Types.Scenes.CreateSceneFromObjectConfig = {
  preload: preload,
  create: create
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scene
};

const game = new Phaser.Game(config);
