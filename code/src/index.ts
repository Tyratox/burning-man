import * as Phaser from "phaser";
import PhaserNavMeshPlugin from "phaser-navmesh";

import { CONSTANTS, simulationFinished, updateStatistics } from "./controls";
import Agent from "./Agent";
import { dist2, pointRectNormal } from "./utilities/math";
import { onDOMReadyControlSetup } from "./controls";
import Fire from "./Fire";
import AttractiveTarget from "./AttractiveTarget";
import { Traceable } from "./types";
import Timer from "./Timer";
import SimulationController from "./SimulationController";
import { findClosestAttractiveTarget, rayTrace } from "./raytracing";

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type GameConfig = Phaser.Types.Core.GameConfig;

// ----- Declaring Globals -----

export let timer = new Timer();
export let controller: SimulationController;

// ----- Phaser initialization functions -----

const preload: (map: string) => ScenePreloadCallback = map =>
  function(this: Phaser.Scene) {
    //load images if needed
    this.load.image("agent", "assets/agent.png");
    this.load.image("skull", "assets/skull.png");
    this.load.image("fire", "assets/fire.png");
    this.load.tilemapTiledJSON("map", `assets/maps/${map}.json`);
    this.load.image("tiles", "assets/maps/minimal-tileset.png");

    controller = new SimulationController(this);
  };

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  //generate map, yehei
  //https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/
  const tilemap = controller.generateVisualMap();
  controller.initializePathfinding(tilemap);

  //create the walls, add them to the collision group and to the array of rectangles used for raytracing
  tilemap
    .getObjectLayer("physical-walls")
    ["objects"].forEach(wall => controller.addWall(wall));

  // ----- Create Physiscs Group -----

  tilemap
    .getObjectLayer("dudes")
    ["objects"].slice(0, CONSTANTS.DUDE_COUNT_CAP)
    .forEach(agent => controller.addAgent(agent));

  tilemap
    .getObjectLayer("obstacles")
    ["objects"].forEach(obstacle => controller.addObstacle(obstacle));

  tilemap
    .getObjectLayer("despawn-zones")
    ["objects"].forEach(zone => controller.addDespawnZone(zone));

  const signCount = tilemap.getObjectLayer("signs")["objects"].length;

  tilemap
    .getObjectLayer("signs")
    ["objects"].forEach((sign, index) => controller.addSign(sign, index));

  tilemap
    .getObjectLayer("doors")
    ["objects"].forEach((door, index) =>
      controller.addDoor(door, signCount + index)
    );

  controller.resetAgentCount();

  // Create Fire class instances
  if (tilemap.getObjectLayer("fires")) {
    tilemap
      .getObjectLayer("fires")
      ["objects"].forEach(fire => controller.addFire(fire));
  }

  // ----- Adding Groups to the Physics Collider Engine -----
  this.matter.world.on(
    "collisionactive",
    (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
        if (
          bodyA.collisionFilter.category === controller.agentGroup ||
          bodyB.collisionFilter.category === controller.agentGroup
        ) {
          const a =
            bodyA.collisionFilter.category === controller.agentGroup
              ? bodyA
              : bodyB;
          const b = a === bodyA ? bodyB : bodyA;

          const agent: Agent = a.gameObject;

          //maybe the agent was just destroyed in collisionstart
          if (!agent) {
            return;
          }

          if (b.collisionFilter.category === controller.attractiveTargetGroup) {
            const target: AttractiveTarget = b.gameObject;
            controller.onHitTarget(agent, target);
            /*const c = this.add.circle(agent.x, agent.y, 5, 0xff0000, 1);
            this.tweens.add({
              targets: c,
              alpha: { from: 1, to: 0 },
              ease: "Linear",
              duration: 100,
              repeat: 0,
              yoyo: false,
              onComplete: () => c.destroy()
            });*/
          } else if (
            b.collisionFilter.category === controller.wallGroup ||
            b.collisionFilter.category === controller.tableGroup
          ) {
            if (b.speed === 0) {
              //if stuck recalculate path
              agent.path = null;
            }
          }
        }
      });
    }
  );
  this.matter.world.on(
    "collisionstart",
    (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
        if (
          bodyA.collisionFilter.category === controller.agentGroup ||
          bodyB.collisionFilter.category === controller.agentGroup
        ) {
          const a =
            bodyA.collisionFilter.category === controller.agentGroup
              ? bodyA
              : bodyB;
          const b = a === bodyA ? bodyB : bodyA;

          const agent: Agent = a.gameObject;

          if (b.collisionFilter.category === controller.attractiveTargetGroup) {
            const target: AttractiveTarget = b.gameObject;
            controller.onHitTarget(agent, target);
          } else if (
            b.collisionFilter.category === controller.despawnZoneGroup
          ) {
            controller.onDespawn(agent);
          } else if (b.collisionFilter.category === controller.fireGroup) {
            controller.onAgentDeath(agent);
          } else if (b.collisionFilter.category === controller.somkeGroup) {
            //
          }
        }
      });
    }
  );
  // ----- Initialize Timer -----
  timer.timeLabel = this.add.text(150, 75, "00:00", {
    font: "100px Arial",
    fill: "#000"
  });
  timer.timeLabel.setOrigin(0.5);
  timer.timeLabel.setAlign("center");

  this.scene.pause();
};

const calculateForces = (scene: Phaser.Scene) => {
  //@ts-ignore
  const agents: Agent[] = controller.agents;

  const accelerations = new Array(agents.length)
    .fill(null)
    .map(_ => new Phaser.Math.Vector2({ x: 0, y: 0 }));

  for (let i = 0; i < agents.length; i++) {
    //calculate push force on every agent from the nearest piece of wall

    const agentPosition = agents[i].getPosition();

    //* ---- begin section wall repulsion ---
    const {
      distance: closestWallDistance,
      wall: closestWall
    } = controller.wallShape.reduce(
      (bestResult, wall) => {
        const distance = pointRectNormal(
          agentPosition,
          wall,
          wall.width,
          wall.height
        ).length();

        if (distance < bestResult.distance) {
          return { distance, wall };
        }

        return bestResult;
      },
      {
        distance: Number.MAX_VALUE,
        wall: new Phaser.Geom.Rectangle(-1, -1, 0, 0)
      }
    );

    const pushDirection = pointRectNormal(
      agentPosition,
      closestWall,
      closestWall.width,
      closestWall.height
    );

    if (CONSTANTS.RENDER_DEBUG_OBJECTS) {
      // draw lines that represent the normal vector to the closest wall
      const pushdirwall = scene.add
        .line(
          0,
          0,
          agentPosition.x,
          agentPosition.y,
          agentPosition.x - pushDirection.x,
          agentPosition.y - pushDirection.y,
          0x0000ff,
          1
        )
        .setOrigin(0, 0);

      scene.tweens.add({
        targets: pushdirwall,
        alpha: { from: 1, to: 0 },
        ease: "Linear",
        duration: 100,
        repeat: 0,
        yoyo: false,
        onComplete: () => pushdirwall.destroy()
      });
    }

    pushDirection.normalize();
    const wallpushingForce =
      CONSTANTS.WALL_REPULSION_LINEAR *
      Math.exp(-closestWallDistance / CONSTANTS.WALL_REPULSION_EXPONENTIAL);
    accelerations[i].add(pushDirection.scale(wallpushingForce));
    //---- end of section wall repulsion ----*/

    //---- begin section calculate directioncorrecting force ----
    if (CONSTANTS.PATHFINDACTIVE) {
      //check if the dude isn't already tracking a path or hasn't recalculated it's path for half a second
      if (
        agents[i].path === null ||
        agents[i].nextNode >= agents[i].path.length
      ) {
        //check if he see's a sign
        const sign = findClosestAttractiveTarget(agents[i], scene);

        //calculate here the desired velocity from the target value only if we have a target
        if (sign.x > 0) {
          const path = controller.navmesh.findPath(
            { x: agents[i].x, y: agents[i].y },
            sign
          );
          agents[i].path = path;
          agents[i].nextNode = 0;
        } else {
          //do random stuff / generate a random path
          agents[i].visitedTargets = [];
        }
      }

      if (agents[i].path !== null) {
        //follow the path that is just an array of points, find the two closest and take the one with the higher index
        if (
          dist2(agentPosition, agents[i].path[agents[i].nextNode]) <
            Math.pow(25, 2) &&
          agents[i].nextNode + 1 < agents[i].path.length
        ) {
          agents[i].nextNode++;
        }

        let nextPoint = agents[i].path[agents[i].nextNode];

        //check if we already overshot
        if (agents[i].nextNode + 1 < agents[i].path.length) {
          const successor = agents[i].path[agents[i].nextNode + 1];
          if (
            dist2(agentPosition, successor) < dist2(agentPosition, nextPoint)
          ) {
            agents[i].nextNode++;
            nextPoint = successor;
          }
        }

        if (CONSTANTS.RENDER_DEBUG_OBJECTS) {
          const ray = scene.add
            .line(
              0,
              0,
              agentPosition.x,
              agentPosition.y,
              nextPoint.x,
              nextPoint.y,
              0x00ff00,
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
        //apply direction correcting force
        accelerations[i].add(
          new Phaser.Math.Vector2(nextPoint.x, nextPoint.y)
            .subtract(agents[i].getPosition())
            .normalize()
            .scale(agents[i].desiredVelocity)
            .subtract(agents[i].getVelocity()) // subtract current velocity
            .scale(1 / agents[i].reactionTime)
        );
      }
    } else {
      // if Pathfinding is deactivated
      const sign = findClosestAttractiveTarget(agents[i], scene);
      //calculate here the desired velocity from the target value only if we have a target
      if (sign.x > 0) {
        //apply direction correcting force
        accelerations[i].add(
          new Phaser.Math.Vector2(sign.x, sign.y)
            .subtract(agents[i].getPosition())
            .normalize()
            .scale(agents[i].desiredVelocity)
            .subtract(agents[i].getVelocity()) // subtract current velocity
            .scale(1 / agents[i].reactionTime)
        );
      }
    }
    // ---- end section directioncorrecting force ----

    // calculate repulison between dudes and all visible fires
    const visibleFires = rayTrace(
      agents[i],
      controller.repulsiveTargets,
      scene
    );
    const repulsionSum = new Phaser.Math.Vector2(0, 0);
    const repulsion = new Phaser.Math.Vector2(0, 0);

    visibleFires.forEach(fire => {
      repulsion.x = agentPosition.x - fire.position.x;
      repulsion.y = agentPosition.y - fire.position.y;

      const len = repulsion.length();
      repulsion
        .normalize()
        .scale(CONSTANTS.FIRE_REPULSION * (Math.exp(1 / len) - 1));
      repulsionSum.add(repulsion);
    });
    accelerations[i].add(repulsionSum);

    //calculate repulsion and attraction between dudes, start at j=i+1 to prevent doing it twice
    for (let j = i + 1; j < agents.length; j++) {
      const agent1 = agents[i],
        agent2 = agents[j];

      const distance = Math.max(
        agent1.getPosition().distance(agent2.getPosition()) -
          agent1.radius -
          agent2.radius,
        agent1.radius + agent2.radius
      );

      //the smaller the distance the bigger the force
      //the bigger the distance the smaller the force
      //force ~ e^{-distance} = 1/(e^{distance}) (exponentially falling with distance)
      //OR => force ~ e^{1/distance} => exponentially increasing with small distances

      const pushingForce =
        CONSTANTS.DUDE_REPULSION_LINEAR *
        Math.exp(-distance / CONSTANTS.DUDE_REPULSION_EXPONENTIAL);

      //the bigger the distance the smaller the pulling force
      const pullingForce = CONSTANTS.DUDE_GROUP_ATTRACTION / distance;

      const force = pushingForce - pullingForce;

      const directionForAgent1 = agent1
        .getPosition()
        .clone()
        .subtract(agent2.getPosition())
        .normalize();

      accelerations[i].add(
        directionForAgent1.clone().scale(force / agent1.normalizedRadius)
      );
      accelerations[j].add(
        directionForAgent1.negate().scale(force / agent2.normalizedRadius)
      );
    }
  }

  accelerations.forEach((acceleration, index) => {
    agents[index].body.force = acceleration;
  });
};

const updateTimer = function() {
  timer.setCurrentElapsedTime((game.getTime() - timer.currentStartTime) / 1000);
  let totalElapsedTime = timer.getTotalElapsedTime();

  let minutes = Math.floor(totalElapsedTime / 60);
  let seconds = Math.floor(totalElapsedTime) - 60 * minutes;
  //Display minutes, add a 0 to the start if less than 10
  let result = minutes < 10 ? "0" + minutes : minutes;

  //Display seconds, add a 0 to the start if less than 10
  result += seconds < 10 ? ":0" + seconds : ":" + seconds;

  timer.timeLabel.text = result.toString();
};

// ----- Phaser initialization functions -----

const update = function(this: Phaser.Scene) {
  if (
    controller.totalNumberOfAgents ===
    controller.numberOfDeadAgents + controller.numberOfEscapedAgents
  ) {
    this.scene.pause();
    simulationFinished();
  }
  calculateForces(this);
  //unstuckDudes();
  updateTimer();
  updateStatistics(); // only when dude escapes or dies
};

export let game: Phaser.Game = null;

export const initGame = (map = "map") => {
  const config: GameConfig = {
    type: Phaser.AUTO,
    parent: "game",
    width: 1,
    height: 1,
    scene: {
      preload: preload(map),
      create: create,
      update: update
    },
    plugins: {
      scene: [
        {
          key: "NavMeshPlugin",
          plugin: PhaserNavMeshPlugin,
          mapping: "navMeshPlugin",
          start: true
        }
      ]
    },
    physics: {
      default: "matter",
      matter: {
        gravity: { x: 0, y: 0 }
      }
    },
    backgroundColor: 0xffffff
  };

  game = new Phaser.Game(config);
};

document.addEventListener("DOMContentLoaded", onDOMReadyControlSetup);
