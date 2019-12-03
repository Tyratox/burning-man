import * as Phaser from "phaser";
import PhaserNavMeshPlugin from "phaser-navmesh";

import { CONSTANTS, simulationFinished } from "./controls";
import Dude from "./Dude";
import { dist2,pointRectNormal } from "./utilities/math";
import { onDOMReadyControlSetup } from "./controls";
import Fire from "./Fire";
import AttractiveTarget from "./AttractiveTarget";

const Names = require("../assets/names.json");

interface Traceable {
  position: {
    x: number;
    y: number;
  };
  type: string;
}

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type CreateSceneFromObjectConfig = Phaser.Types.Scenes.CreateSceneFromObjectConfig;
type GameConfig = Phaser.Types.Core.GameConfig;

export const getBody = (
  obj: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Body =>
  //@ts-ignore
  obj.body;

// ----- Declaring Constants -----

interface TraceableAttractiveTarget extends Traceable {
  type: string;
  index: number;
  position: {
    x: number;
    y: number;
  };
  orientation?: {
    x: number;
    y: number;
  };
}

interface TraceableRepulsiveTarget extends Traceable {
  type: string;
  position: {
    x: number;
    y: number;
  };
}

const attractiveTargets: TraceableAttractiveTarget[] = [];
const repulsiveTargets: TraceableRepulsiveTarget[] = [];

const wallShape: Phaser.Geom.Rectangle[] = [];

const ACCELERATION_THRESHOLD = 0;
const ACCELERATION_VALUE = 500;
const FIRE_REPULSION = 5000;

const DUDE_WALKING_FRICTION = 0.995;

const SPEED_THRESHOLD = 7;

export let totalNumberOfDudes = 0;
export let numberOfDeadDudes = 0;
export let numberOfSurvivorDudes = 0;

let currentStartTime: number = 0;
export let previousElapsedTime: number = 0;
export let currentElapsedTime: number = 0;

//globals
let dudeGroup: Phaser.GameObjects.Group;
let navmesh: any;
let timeLabel: Phaser.GameObjects.Text;
let despawnZones: Phaser.Physics.Arcade.StaticGroup;
let walls: Phaser.Physics.Arcade.StaticGroup;
let tablesGroup: Phaser.Physics.Arcade.StaticGroup;
let doorGroup: Phaser.GameObjects.Group;
let attractiveTargetGroup: Phaser.Physics.Arcade.StaticGroup;

export const setCurrentStartTime = (time: number) => {
  currentStartTime = time;
};
export const setPreviousElapsedTime = (time: number) => {
  previousElapsedTime += (time - currentStartTime) / 1000;
};
export const toggleDebugObjectsVisibility = () => {
  despawnZones.toggleVisible();
  walls.toggleVisible();
  doorGroup.toggleVisible();
  attractiveTargetGroup.toggleVisible();
  tablesGroup.toggleVisible();
};
export const toggleNavmeshDebugVisibility = () => {
  if (navmesh.isDebugEnabled()) {
    navmesh.disableDebug();
  } else {
    navmesh.enableDebug();
  }
};

// ----- Phaser initialization functions -----

const preload: (map: string) => ScenePreloadCallback = map =>
  function(this: Phaser.Scene) {
    //load images if needed
    this.load.image("skull", "assets/skull.png");
    this.load.image("fire", "assets/fire.png");
    this.load.tilemapTiledJSON("map", `assets/${map}/default.json`);
    this.load.image("tiles", "assets/map/minimal-tileset.png");
  };

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  //generate map, yehei
  //https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/
  const tilemap = this.make.tilemap({ key: "map" });
  this.game.scale.setGameSize(tilemap.widthInPixels, tilemap.heightInPixels);
  this.physics.world.setBounds(
    0,
    0,
    tilemap.widthInPixels,
    tilemap.heightInPixels,
    true,
    true,
    true,
    true
  );

  const tileset = tilemap.addTilesetImage("minimal-tileset", "tiles");
  const floorLayer = tilemap.createStaticLayer("floor", [tileset], 0, 0);
  const wallLayer = tilemap.createStaticLayer("walls", [tileset], 0, 0);
  const tablesLayer = tilemap.createStaticLayer("tables", [tileset], 0, 0);

  //@ts-ignore
  navmesh = this.navMeshPlugin.buildMeshFromTiled(
    "mesh",
    tilemap.getObjectLayer("navmesh"),
    16
  );
  navmesh.enableDebug();
  navmesh.debugDrawMesh({
    drawCentroid: true,
    drawBounds: true,
    drawNeighbors: true,
    drawPortals: false
  });
  navmesh.disableDebug();

  //additional layer for raytracing
  walls = this.physics.add.staticGroup();
  tilemap.getObjectLayer("physical-walls")["objects"].forEach(rect => {
    wallShape.push(
      new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height)
    );
    walls.add(
      this.add.rectangle(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width,
        rect.height,
        0x00ff00,
        0.3
      )
    );
  });

  // ----- Create Physiscs Group -----

  dudeGroup = this.add.group();
  tilemap
    .getObjectLayer("dudes")
    ["objects"].slice(0, CONSTANTS.DUDE_COUNT_CAP)
    .forEach(dude =>
      dudeGroup.add(
        new Dude(
          dude.x,
          dude.y,
          Names[Math.floor(Math.random() * Names.length)],
          this
        )
      )
    );

  const somkeGroup = this.add.group();
  const fireGroup = this.add.group();

  tablesGroup = this.physics.add.staticGroup();
  tilemap
    .getObjectLayer("obstacles")
    ["objects"].forEach(obstacle =>
      tablesGroup.add(
        this.add.rectangle(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width,
          obstacle.height,
          0x8e44ad,
          0.3
        )
      )
    );
  /*map.tables.forEach(([from, to]) => {
    const rect = this.add.rectangle(
      from.x + (to.x - from.x) / 2,
      from.y + (to.y - from.y) / 2,
      to.x - from.x + halfThickness,
      to.y - from.y + halfThickness,
      0x000000
    );

    tables.add(rect);
  });*/

  despawnZones = this.physics.add.staticGroup();
  tilemap.getObjectLayer("despawn-zones")["objects"].forEach(zone => {
    const rect = this.add.rectangle(
      zone.x + zone.width / 2,
      zone.y + zone.height / 2,
      zone.width,
      zone.height,
      0xffeaa7
    );

    despawnZones.add(rect);
  });

  attractiveTargetGroup = this.physics.add.staticGroup();

  const signCount = tilemap.getObjectLayer("signs")["objects"].length;

  const killDude = (dude: Dude) => {
    console.log("Dude " + dude.name + " unfortunately perished in the fire!");
    this.add.sprite(dude.x, dude.y, "skull");
    numberOfDeadDudes++;
    dude.destroy();
  };

  tilemap.getObjectLayer("signs")["objects"].forEach((sign, index) => {
    let orientationX =
      sign.properties && sign.properties.find(p => p.name === "orientationX");

    orientationX = orientationX ? orientationX.value : null;

    let orientationY =
      sign.properties && sign.properties.find(p => p.name === "orientationY");

    orientationY = orientationY ? orientationY.value : null;

    const radius =
      sign.properties && sign.properties.find(p => p.name === "radius");

    if (orientationX !== null && orientationY !== null) {
      const triangle = this.add.isotriangle(
        sign.x,
        sign.y,
        CONSTANTS.TRIANGLE_SIZE,
        CONSTANTS.TRIANGLE_HEIGHT,
        false,
        0x237f52,
        0x2ecc71,
        0x27ae60
      );
      const orientationNorm = Math.sqrt(
        orientationX * orientationX + orientationY * orientationY
      );

      triangle.rotation =
        (orientationX < 0 ? 1 : -1) * Math.acos(orientationY / orientationNorm);

      attractiveTargets.push({
        type: "sign",
        index,
        position: { x: sign.x, y: sign.y },
        orientation: { x: orientationX, y: orientationY }
      });
    } else {
      const circle = this.add.circle(
        sign.x,
        sign.y,
        CONSTANTS.TRIANGLE_SIZE,
        0x237f52
      );

      attractiveTargets.push({
        type: "sign",
        index,
        position: { x: sign.x, y: sign.y }
      });
    }

    attractiveTargetGroup.add(
      new AttractiveTarget(
        index,
        sign.x,
        sign.y,
        this,
        radius ? radius.value : undefined
      )
    );
  });

  doorGroup = this.add.group();
  tilemap.getObjectLayer("doors")["objects"].forEach((door, index) => {
    const orientationX: number = door.properties.find(
      p => p.name === "orientationX"
    ).value;
    const orientationY: number = door.properties.find(
      p => p.name === "orientationY"
    ).value;

    const triangle = this.add.isotriangle(
      door.x,
      door.y,
      CONSTANTS.TRIANGLE_SIZE,
      CONSTANTS.TRIANGLE_HEIGHT,
      false,
      0x3498db,
      0x3498db,
      0x2980b9
    );

    doorGroup.add(triangle);

    const directionNorm = Math.sqrt(
      orientationX * orientationX + orientationY * orientationY
    );

    triangle.rotation =
      (orientationX < 0 ? 1 : -1) * Math.acos(orientationY / directionNorm);

    attractiveTargets.push({
      type: "door",
      index: signCount + index,
      position: { x: door.x, y: door.y },
      orientation: { x: orientationX, y: orientationY }
    });

    attractiveTargetGroup.add(
      new AttractiveTarget(signCount + index, door.x, door.y, this)
    );
  });

  totalNumberOfDudes = dudeGroup.getLength();

  // Create Fire class instances
  if (tilemap.getObjectLayer("fires")) {
    tilemap
      .getObjectLayer("fires")
      ["objects"].forEach(fire =>
        fireGroup.add(new Fire(this, fire.x, fire.y, somkeGroup))
      );
  }

  // ----- Adding Groups to the Physics Collider Engine -----

  this.physics.add.overlap(
    dudeGroup,
    fireGroup,
    (dude: Dude, fire: Phaser.GameObjects.Arc) => {
      killDude(dude);
    }
  );

  this.physics.add.collider(somkeGroup, walls);
  this.physics.add.overlap(
    dudeGroup,
    somkeGroup,
    (dude: Dude, smoke: Phaser.GameObjects.Arc) => {
      dude.health -= smoke.alpha;
      if (dude.health <= 0) {
        killDude(dude);
      }
    }
  );
  this.physics.add.collider(dudeGroup, dudeGroup);
  this.physics.add.collider(dudeGroup, walls);
  this.physics.add.collider(dudeGroup, tablesGroup);
  this.physics.add.collider(dudeGroup, despawnZones, (dude: Dude, zone) => {
    console.log("Dude " + dude.name + " is a survivor!");
    numberOfSurvivorDudes++;
    dude.destroy();
  });

  this.physics.add.overlap(
    dudeGroup,
    attractiveTargetGroup,
    (dude: Dude, target: AttractiveTarget) => {
      dude.visitedTargets.push(target.index);
      dude.path = null;
    }
  );
  // ----- Initialize Timer -----
  timeLabel = this.add.text(150, 105, "00:00", {
    font: "100px Arial",
    fill: "#000"
  });
  timeLabel.setOrigin(0.5);
  timeLabel.setAlign("center");

  this.scene.pause();
};

// ----- Orientation and Force Algorithms -----

const rayTrace = <T extends Traceable>(
  dude: Dude,
  traceables: T[],
  scene: Phaser.Scene
) => {
  const { x: dudeX, y: dudeY } = dude;

  const visible = traceables.filter(element => {
    const { position } = element;

    const currentDist = Math.sqrt(
      (position.x - dudeX) * (position.x - dudeX) +
        (position.y - dudeY) * (position.y - dudeY)
    );

    //always remember the door
    if (element.type !== "door" && currentDist > dude.visualRange) {
      return false;
    }

    const ray = new Phaser.Geom.Line(dudeX, dudeY, position.x, position.y);

    const intersect = wallShape.find(wall =>
      Phaser.Geom.Intersects.LineToRectangle(ray, wall)
    );

    //if the sight isn't intersected and the distance is shorter return the new one
    return intersect === undefined;
  });

  return visible;
};

const findClosestAttractiveTarget = (dude: Dude, scene: Phaser.Scene) => {
  const { x: dudeX, y: dudeY } = dude;

  // feedback when stuck. potential field
  const visible = rayTrace(dude, attractiveTargets, scene);

  //find the closest door/sign thats oriented in a way such that it's visible to the dude
  const closestOriented = visible.reduce(
    (best, element) => {
      const { position, orientation } = element;

      //check orientation
      if (
        orientation //if no orientation propety the sign / door is visible for all sides
          ? orientation.x * (position.x - dudeX) +
              orientation.y * (position.y - dudeY) <
            0
          : true
      ) {
        const currentDist = Math.sqrt(
          (position.x - dudeX) * (position.x - dudeX) +
            (position.y - dudeY) * (position.y - dudeY)
        );

        //if the sight isn't intersected, the distance is shorter and it wasn't visited before return the new one
        return !dude.visitedTargets.includes(element.index) &&
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
        dudeX,
        dudeY,
        closestOriented.x,
        closestOriented.y,
        0xff0000,
        0.1
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

const calculateForces = (scene: Phaser.Scene) => {
  //@ts-ignore
  const dudes: Dude[] = dudeGroup.children.getArray();
  const now = Date.now();

  const accelerations = new Array(dudes.length)
    .fill(null)
    .map(_ => new Phaser.Math.Vector2({ x: 0, y: 0 }));

  for (let i = 0; i < dudes.length; i++) {
    //calculate push force on every agent from the nearest piece of wall

    const dudePosition = { x: dudes[i].x, y: dudes[i].y };

    //* ---- begin section wall repulsion ---
    const {
      distance: closestWallDistance,
      wall: closestWall
    } = wallShape.reduce(
      (bestResult, wall) => {
        const distance = pointRectNormal(
          dudePosition,
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
      dudePosition,
      closestWall,
      closestWall.width,
      closestWall.height
    );

    if(CONSTANTS.RENDER_DEBUG_OBJECTS) {// draw lines that represent the normal vector to the closest wall
      const pushdirwall = scene.add
      .line(
        0,
        0,
        dudePosition.x,
        dudePosition.y,
        dudePosition.x-pushDirection.x,
        dudePosition.y-pushDirection.y,
        0x0000ff,
        0.1
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
 
    pushDirection.normalize(); console.log("push dir", pushDirection.length());
    const wallpushingForce =
        CONSTANTS.WALL_REPULSION_LINEAR *
        Math.exp(-closestWallDistance / CONSTANTS.WALL_REPULSION_EXPONENTIAL);
    accelerations[i].add(pushDirection.scale(wallpushingForce));
    //---- end of section wall repulsion ----*/
    
    //---- begin section calculate directioncorrecting force ----
    const desiredVelocity = dudes[i].maxVelocity;

    if (CONSTANTS.PATHFINDACTIVE) {
      //check if the dude isn't already tracking a path or hasn't recalculated it's path for half a second
      if (dudes[i].path === null || dudes[i].nextNode >= dudes[i].path.length) {
        //check if he see's a sign
        const sign = findClosestAttractiveTarget(dudes[i], scene);

        //calculate here the desired velocity from the target value only if we have a target
        if (sign.x > 0) {
          const path = navmesh.findPath({ x: dudes[i].x, y: dudes[i].y }, sign);
          dudes[i].path = path;
          dudes[i].nextNode = 0;
        } else {
          //do random stuff / generate a random path
          dudes[i].visitedTargets = [];
        }
      }

      if (dudes[i].path !== null) {
        //follow the path that is just an array of points, find the two closest and take the one with the higher index
        if (
          dist2(dudePosition, dudes[i].path[dudes[i].nextNode]) <
            Math.pow(25, 2) &&
          dudes[i].nextNode + 1 < dudes[i].path.length
        ) {
          dudes[i].nextNode++;
        }

        let nextPoint = dudes[i].path[dudes[i].nextNode];

        //check if we already overshot
        if (dudes[i].nextNode + 1 < dudes[i].path.length) {
          const successor = dudes[i].path[dudes[i].nextNode + 1];
          if (dist2(dudePosition, successor) < dist2(dudePosition, nextPoint)) {
            dudes[i].nextNode++;
            nextPoint = successor;
          }
        }

        if (CONSTANTS.RENDER_DEBUG_OBJECTS) {
          const ray = scene.add
            .line(
              0,
              0,
              dudePosition.x,
              dudePosition.y,
              nextPoint.x,
              nextPoint.y,
              0x00ff00,
              0.1
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
            .subtract(dudes[i].getPosition())
            .normalize()
            .scale(desiredVelocity)
            .subtract(dudes[i].getBody().velocity) // subtract current velocity
            .scale(dudes[i].normalizedFitness / dudes[i].normalizedWeight) //reaction time
        );
      }
    } else {
      
      // if Pathfinding is deactivated
      const sign = findClosestAttractiveTarget(dudes[i], scene);
      //calculate here the desired velocity from the target value only if we have a target
      if (sign.x > 0) {
        //apply direction correcting force
        accelerations[i].add(
          new Phaser.Math.Vector2(sign.x, sign.y)
            .subtract(dudes[i].getPosition())
            .normalize()
            .scale(desiredVelocity)
            .subtract(dudes[i].getBody().velocity) // subtract current velocity
            .scale(dudes[i].normalizedFitness / dudes[i].normalizedWeight) //reaction time
        );
      }
    }
    // ---- end section directioncorrecting force ----

    //calculate repulison between dudes and all visible fires
    // let visibleFires = rayTrace(dudes[i], repulsiveTargets, scene);
    // let repulsionSum = new Phaser.Math.Vector2(0, 0);
    // let repulsion = new Phaser.Math.Vector2(0, 0);

    // visibleFires.forEach(fire => {
    //   repulsion.x = dudeBody.x - fire.position.x;
    //   repulsion.y = dudeBody.y - fire.position.y;
    //   let len = repulsion.length();
    //   repulsion.normalize().scale(FIRE_REPULSION * (Math.exp(1 / len) - 1));
    //   repulsionSum.add(repulsion);
    // });
    // accelerations[i].add(repulsionSum);

    dudes[i].getBody().velocity.scale(DUDE_WALKING_FRICTION);

    //calculate repulsion and attraction between dudes, start at j=i+1 to prevent doing it twice
    for (let j = i + 1; j < dudes.length; j++) {
      const dude1 = dudes[i],
        dude2 = dudes[j];

      const distance = Math.max(
        dude1.getPosition().distance(dude2.getPosition()) -
          dude1.radius -
          dude2.radius,
        dude1.radius + dude2.radius
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

      const directionForDude1 = dude1
        .getPosition()
        .clone()
        .subtract(dude2.getPosition())
        .normalize();
/*
      accelerations[i].add(
        directionForDude1.clone().scale(force / dude1.normalizedWeight)
      );
      accelerations[j].add(
        directionForDude1.negate().scale(force / dude2.normalizedWeight)
      );
      */
    }
  }

  accelerations.forEach((acceleration, index) =>
    dudes[index].getBody().setAcceleration(acceleration.x, acceleration.y)
  );
};

const updateTimer = function() {
  currentElapsedTime = (game.getTime() - currentStartTime) / 1000;
  let totalElapsedTime = previousElapsedTime + currentElapsedTime;

  let minutes = Math.floor(totalElapsedTime / 60);
  let seconds = Math.floor(totalElapsedTime) - 60 * minutes;
  //Display minutes, add a 0 to the start if less than 10
  let result = minutes < 10 ? "0" + minutes : minutes;

  //Display seconds, add a 0 to the start if less than 10
  result += seconds < 10 ? ":0" + seconds : ":" + seconds;

  timeLabel.text = result.toString();
};

// ----- Phaser initialization functions -----

const update = function(this: Phaser.Scene) {
  if (totalNumberOfDudes == numberOfDeadDudes + numberOfSurvivorDudes) {
    this.scene.pause();
    simulationFinished();
  }
  calculateForces(this);
  //unstuckDudes();
  updateTimer();
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
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        fps: 30
      }
    },
    backgroundColor: 0xffffff
  };

  game = new Phaser.Game(config);
};

document.addEventListener("DOMContentLoaded", onDOMReadyControlSetup);
