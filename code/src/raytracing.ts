import * as Phaser from "phaser";
import Agent from "./Agent";
import { Traceable } from "./types";
import { controller } from ".";
import { CONSTANTS } from "./controls";

export const rayTrace = <T extends Traceable>(
  agent: Agent,
  traceables: T[],
  scene: Phaser.Scene
) => {
  const { x: agentX, y: agentY } = agent;

  const visible = traceables.filter(element => {
    const { position } = element;

    const currentDist = Math.sqrt(
      (position.x - agentX) * (position.x - agentX) +
        (position.y - agentY) * (position.y - agentY)
    );

    //always remember the door
    if (element.type !== "door" && currentDist > agent.visualRange) {
      return false;
    }

    const ray = new Phaser.Geom.Line(agentX, agentY, position.x, position.y);

    const intersect = controller.wallShape.find(wall =>
      Phaser.Geom.Intersects.LineToRectangle(ray, wall)
    );

    //if the sight isn't intersected and the distance is shorter return the new one
    return intersect === undefined;
  });

  return visible;
};

export const findClosestAttractiveTarget = (
  agent: Agent,
  scene: Phaser.Scene
) => {
  const { x: agentX, y: agentY } = agent;

  // feedback when stuck. potential field
  const visible = rayTrace(agent, controller.attractiveTargets, scene);

  //find the closest door/sign thats oriented in a way such that it's visible to the dude
  const closestOriented = visible.reduce(
    (best, element) => {
      const { position, orientation } = element;

      //check orientation
      if (
        orientation //if no orientation propety the sign / door is visible for all sides
          ? orientation.x * (position.x - agentX) +
              orientation.y * (position.y - agentY) <
            0
          : true
      ) {
        const currentDist = Math.sqrt(
          (position.x - agentX) * (position.x - agentX) +
            (position.y - agentY) * (position.y - agentY)
        );

        //if the sight isn't intersected, the distance is shorter and it wasn't visited before return the new one
        return !agent.visitedTargets.includes(element.index) &&
          best.distance >= currentDist
          ? { distance: currentDist, position }
          : best;
      }

      return best;
    },
    { distance: Number.MAX_VALUE, position: { x: -1, y: -1 } }
  ).position;

  if (closestOriented.x > 0 && CONSTANTS.RENDER_DEBUG_OBJECTS) {
    const ray = scene.add
      .line(
        0,
        0,
        agentX,
        agentY,
        closestOriented.x,
        closestOriented.y,
        0xff0000,
        1
      )
      .setOrigin(0, 0);

    scene.tweens.add({
      targets: ray,
      alpha: { from: 1, to: 0 },
      ease: "Linear",
      duration: 100,
      repeat: 0,
      yoyo: false,
      onComplete: () => ray.destroy()
    });
  }

  return new Phaser.Math.Vector2({
    x: closestOriented.x,
    y: closestOriented.y
  });
};
