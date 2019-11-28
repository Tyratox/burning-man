class AttractiveTarget extends Phaser.GameObjects.Arc {
  index: number;
  constructor(
    index: number,
    x: number,
    y: number,
    scene: Phaser.Scene,
    radius = 25
  ) {
    super(scene, x, y, radius, 0, 360, true, 0xff0000, 0.5);
    scene.children.add(this);
    this.index = index;
  }
}

export default AttractiveTarget;
