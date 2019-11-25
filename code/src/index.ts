import * as Phaser from "phaser";
import { throttle } from "lodash";

import { CONSTANTS } from "./controls";
import Dude from "./Dude";
import map from "./map";
import { isLeftOfLine, distanceToLineSegment } from "./utilities/math";
import { onDOMReadyControlSetup } from "./controls";
import Fire from "./Fire";

interface Traceable {
  position: {
    x: number;
    y: number;
  };
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

const attractiveTargets = [...map.signs, ...map.doors];
const repulsiveTargets: Traceable[] = [...map.fires];

const ACCELERATION_THRESHOLD = 0;
const ACCELERATION_VALUE = 500;
const FIRE_REPULSION = 5000;

const DUDE_WALKING_FRICTION = 0.98;

const SPEED_THRESHOLD = 7;

let totalNumberOfDudes = 0;
let numberOfDeadDudes = 0;
let ThisVariableCountsTheNumberOfDudesWhoMadeItToTheDespawningZoneAndThereforeSurvived = 0;

let currentStartTime: number = 0;
let previousElapsedTime: number = 0;
let currentElapsedTime: number = 0;
let timeLabel: Phaser.GameObjects.Text;

export const setCurrentStartTime = (time: number) => {
  currentStartTime = time;
};

let dudeGroup: Phaser.GameObjects.Group;

// ----- Phaser initialization functions -----

const preload: ScenePreloadCallback = function(this: Phaser.Scene) {
  //load images if needed
  this.load.image("skull", "assets/skull.png");
  this.load.image("fire", "assets/fire.png");
};

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  //generate map, yehei
  const halfThickness = map.wallThickness / 2;

  // ----- Create Physiscs Group -----

  const walls = this.physics.add.staticGroup();

  dudeGroup = this.add.group();
  const somkeGroup = this.add.group();
  const fireGroup = this.add.group();



  // ----- Initialize all Groups -----

  map.walls.forEach(([from, to]) => {
    const rect = this.add.rectangle(
      from.x + (to.x - from.x) / 2,
      from.y + (to.y - from.y) / 2,
      to.x - from.x + halfThickness,
      to.y - from.y + halfThickness,
      0x000000
    );

    walls.add(rect);
  });

  const tables = this.physics.add.staticGroup();
  map.tables.forEach(([from, to]) => {
    const rect = this.add.rectangle(
      from.x + (to.x - from.x) / 2,
      from.y + (to.y - from.y) / 2,
      to.x - from.x + halfThickness,
      to.y - from.y + halfThickness,
      0x000000
    );

    tables.add(rect);
  });

  const despawn_zones = this.physics.add.staticGroup();
  map.despawn_zone.forEach(([from, to]) => {
    const rect = this.add.rectangle(
      from.x + (to.x - from.x) / 2,
      from.y + (to.y - from.y) / 2,
      to.x - from.x + halfThickness,
      to.y - from.y + halfThickness,
      0xffeaa7
    );

    despawn_zones.add(rect);
  });

  map.signs.forEach(({ position, direction }) => {
    const triangle = this.add.isotriangle(
      position.x,
      position.y,
      CONSTANTS.TRIANGLE_SIZE,
      CONSTANTS.TRIANGLE_HEIGHT,
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

  map.doors.forEach(({ position, direction }) => {
    const triangle = this.add.isotriangle(
      position.x,
      position.y,
      CONSTANTS.TRIANGLE_SIZE,
      CONSTANTS.TRIANGLE_HEIGHT,
      false,
      0x3498db,
      0x3498db,
      0x2980b9
    );
    const directionNorm = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

    triangle.rotation =
      (direction.x > 0 ? 1 : -1) * Math.acos(-direction.y / directionNorm);
  });

  map.spawnPoints.forEach(point =>
    dudeGroup.add(
      new Dude(
        point.x,
        point.y,
        Math.random(),
        0.6 + Math.random() * 0.4,
        Math.random(),
        "Peter",
        this
      )
    ),
    totalNumberOfDudes++
  );

  // Create Fire class instances
  map.fires.forEach(point =>
    fireGroup.add(
      new Fire(this, point.position.x, point.position.y, somkeGroup)
    )
  );

  // ----- Adding Groups to the Physics Collider Engine -----

  this.physics.add.collider(dudeGroup, fireGroup, (dude: Dude, fire) => {
    console.log("Dude " + dude.name + " unfortunately perished in the fire!");
    this.add.sprite(dude.x, dude.y, "skull");
    numberOfDeadDudes++;
    dude.destroy();
  });

  this.physics.add.collider(somkeGroup, walls);
  this.physics.add.overlap(dudeGroup, somkeGroup, (dude: Dude, smoke:Phaser.GameObjects.Arc ) => {
    dude.health -= smoke.alpha;
    if (dude.health <= 0) {
      console.log("Dude " + dude.name + " unfortunately perished in the fire!");
      this.add.sprite(dude.x, dude.y, "skull");
      numberOfDeadDudes++;
      dude.destroy();
    }
  });
  this.physics.add.collider(dudeGroup, dudeGroup, (p1, p2) => {
    //collision callback
  });

  this.physics.add.collider(dudeGroup, walls);
  this.physics.add.collider(dudeGroup, tables);
  this.physics.add.collider(dudeGroup, despawn_zones, (dude: Dude, zone) => {
    console.log("Dude " + dude.name + " is a survivor!");
    ThisVariableCountsTheNumberOfDudesWhoMadeItToTheDespawningZoneAndThereforeSurvived++;
    dude.destroy();
  });

  // ----- Initialize Timer -----	
  timeLabel = this.add.text(map.width/2, 100, "00:00", {font: "100px Arial", fill: "#000"});
  timeLabel.setOrigin(0.5);
  timeLabel.setAlign('center');
  timeLabel.setShadow(0, 0, '#000', 0, true, true);

  this.scene.pause();
};

// ----- Orientation and Force Algorithms -----

const rayTrace = <T extends Traceable>(
  dude: Dude,
  traceables: T[],
  scene: Phaser.Scene
) => {
  const { x: dudeX, y: dudeY } = dude.getBody();

  const visible = traceables.filter(element => {
    const { position } = element;

    const signToAgent = new Phaser.Geom.Line(
      dudeX,
      dudeY,
      position.x,
      position.y
    );

    const intersect = map.walls.find(coordinates => {
      const [from, to] = coordinates;
      const wall = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
      if (Phaser.Geom.Intersects.LineToLine(wall, signToAgent)) {
        return true;
      }

      return false;
    });

    //if the sight isn't intersected and the distance is shorter return the new one
    return intersect === undefined;
  });

  return visible;
};

const findClosestAttractiveTarget = (dude: Dude, scene: Phaser.Scene) => {
  const { x: dudeX, y: dudeY } = dude.getBody();

  // feedback when stuck. potential field
  const visible = rayTrace(dude, attractiveTargets, scene);

  //find the closest door/sign thats oriented in a way such that it's visible to the dude
  const closestOriented = visible.reduce(
    (best, element) => {
      const { position, orientation } = element;

      //check orientation
      if (
        orientation.x * (position.x - dudeX) +
          orientation.y * (position.y - dudeY) <
        0
      ) {
        const currentDist = Math.sqrt(
          (position.x - dudeX) * (position.x - dudeX) +
            (position.y - dudeY) * (position.y - dudeY)
        );

        //if the sight isn't intersected and the distance is shorter return the new one
        return best.distance > currentDist
          ? { distance: currentDist, position }
          : best;
      }

      return best;
    },
    { distance: Number.MAX_VALUE, position: { x: -1, y: -1 } }
  ).position;

  const offset = dude.getRadius();
  const ray = scene.add
    .line(
      0,
      0,
      dudeX + offset,
      dudeY + offset,
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

  return new Phaser.Math.Vector2({
    x: closestOriented.x,
    y: closestOriented.y
  });
};

const calculateForces = (scene: Phaser.Scene) => {
  //@ts-ignore
  const dudes: Dude[] = dudeGroup.children.getArray();

  const accelerations = new Array(dudes.length)
    .fill(null)
    .map(_ => new Phaser.Math.Vector2({ x: 0, y: 0 }));

  for (let i = 0; i < dudes.length; i++) {
    //calculate push force on every agent from the nearest piece of wall

    const dudeBody = dudes[i].getBody();
    //const wallDebuggingLines = scene.add.group();

    const {
      distance: closestWallDistance,
      wall: closestWall
    } = map.walls.reduce(
      (bestResult, wall) => {
        const distance = distanceToLineSegment(
          { x: dudeBody.x, y: dudeBody.y },
          wall[0],
          wall[1]
        );

        if (distance < bestResult.distance) {
          return { distance, wall };
        }

        return bestResult;
      },
      {
        distance: Number.MAX_VALUE,
        wall: [
          { x: 0, y: 0 },
          { x: 0, y: 0 }
        ]
      }
    );

    //if the wall is far away, that's okay. ALSO CHECK WHETHER THE DUDE IS IN FRONT OF THE WALL (easy for rectangular walls)
    if (
      closestWallDistance < CONSTANTS.ACCEPTABLE_WALL_DISTANCE &&
      ((closestWall[0].x <= dudeBody.x && closestWall[1].x >= dudeBody.x) ||
        (closestWall[0].y <= dudeBody.y && closestWall[1].y >= dudeBody.y))
    ) {
      //vector perpendicular to the wall
      const wallRepulsion = new Phaser.Math.Vector2({
        y: closestWall[1].x - closestWall[0].x,
        x: -(closestWall[1].y - closestWall[0].y)
      }).normalize();

      if (!isLeftOfLine(dudeBody.position, closestWall[0], closestWall[1])) {
        wallRepulsion.negate();
      }

      /*wallDebuggingLines.add(
        scene.add.line(
          0,
          0,
          dudeBody.x,
          dudeBody.y,
          dudeBody.x + wallRepulsion.x * 10,
          dudeBody.y + wallRepulsion.y * 10,
          0xff0000
        )
      );*/

      accelerations[i].add(
        wallRepulsion.scale(
          CONSTANTS.WALL_REPULSION_FORCE / closestWallDistance
        )
      );
    }

    /*setTimeout(() => {
      wallDebuggingLines.destroy(true);
    }, 100);*/

    //calculate directioncorrecting force
    const reactionTime = CONSTANTS.DEFAULT_REACTION_TIME; //depends on dude
    const desiredVelocity = CONSTANTS.DEFAULT_DESIRED_VELOCITY;

    // CorrectingForce = Mass*(Vdesired-Vcurr)/reactionTime
    const sign = findClosestAttractiveTarget(dudes[i], scene);
    dudes[i].setSign(sign.x, sign.y);

    //calculate here the desired velocity from the target value only if we have a target
    if (sign.x > 0) {
      accelerations[i].add(
        sign
          .subtract(dudes[i].getBody().position)
          .normalize()
          .scale(desiredVelocity)
          .subtract(dudes[i].getBody().velocity) // subtract current velocity
          .scale(dudes[i].weight / reactionTime)
      );
    }

    //calculate repulison between dudes and all visible fires
    let visibleFires = rayTrace(dudes[i], repulsiveTargets, scene);
    let repulsionSum = new Phaser.Math.Vector2(0, 0);
    let repulsion = new Phaser.Math.Vector2(0, 0);

    visibleFires.forEach(fire => {
      repulsion.x = dudeBody.x - fire.position.x;
      repulsion.y = dudeBody.y - fire.position.y;
      let len = repulsion.length();
      repulsion.normalize().scale(FIRE_REPULSION * (Math.exp(1 / len) - 1));
      repulsionSum.add(repulsion);
    });
    accelerations[i].add(repulsionSum);

    dudeBody.velocity.scale(DUDE_WALKING_FRICTION);

    //calculate repulsion and attraction between dudes, start at j=i+1 to prevent doing it twice
    for (let j = i + 1; j < dudes.length; j++) {
      const dude1 = dudes[i],
        dude2 = dudes[j];

      const distance = dude1
        .getBody()
        .position.distance(dude2.getBody().position);

      //the smaller the distance the bigger the force
      //the bigger the distance the smaller the force
      //force ~ e^{-distance} = 1/(e^{distance}) (exponentially falling with distance)
      //OR => force ~ e^{1/distance} => exponentially increasing with small distances

      const pushingForce =
        distance > 50
          ? 0
          : Math.min(
              CONSTANTS.DUDE_REPULSION_LINEAR *
                Math.exp(CONSTANTS.DUDE_REPULSION_EXPONENTIAL / distance),
              100
            );

      //the bigger the distance the smaller the pulling force
      const pullingForce = 1 / (distance * CONSTANTS.DUDE_GROUP_ATTRACTION);

      const force = pushingForce - pullingForce;

      const directionForDude1 = dude1
        .getBody()
        .position.clone()
        .subtract(dude2.getBody().position)
        .normalize();

      accelerations[i].add(
        directionForDude1.clone().scale(force / dude1.weight)
      );
      accelerations[j].add(
        directionForDude1.negate().scale(force / dude2.weight)
      );
    }
  }

  accelerations.forEach((acceleration, index) =>
    dudes[index].getBody().setAcceleration(acceleration.x, acceleration.y)
  );
};

// If a dude gets stuck this function helps out
const unstuckDudes = () => {
  dudeGroup.children.getArray().forEach((dude: Dude) => {
    const curr = dude.getBody();
    const sign = dude.getSign();
    let accelerationVector = curr.acceleration;
    // Check if dude is currently too slow and he observes a force, e.g. she/he/it is stuck
    if (
      curr.speed < SPEED_THRESHOLD &&
      accelerationVector.length() > ACCELERATION_THRESHOLD
    ) {
      const changeDirection = new Phaser.Math.Vector2(
        accelerationVector.y,
        -accelerationVector.x
      ).normalize();
      // Check for the direction of the acceleration vector
      if (Math.abs(accelerationVector.x) < Math.abs(accelerationVector.y)) {
        // Negate the acceleration vector if it is in the 1. or 3. quadrant of the coordinate system
        if (
          (curr.x < sign.x && curr.y < sign.y) ||
          (curr.x > sign.x && curr.y > sign.y)
        ) {
          changeDirection.negate();
        }
      } else {
        // Negate the acceleration vector if it is in the 2. or 4. quadrant of the coordinate system
        if (
          (curr.x > sign.x && curr.y < sign.y) ||
          (curr.x > sign.x && curr.y < sign.y)
        ) {
          changeDirection.negate();
        }
      }
      changeDirection.scale(ACCELERATION_VALUE);
      // Help dude out of stuckness
      //curr.velocity.add(changeDirection);
      curr.acceleration.add(changeDirection);
    }
  });
};

const createTimer = function(scene: Phaser.Scene) {
  // timeLabel.align = 'center';
}


const updateTimer = function() {

  currentElapsedTime = (game.getTime() - currentStartTime)/1000;
  let totalElapsedTime = previousElapsedTime + currentElapsedTime;

  
  let minutes = Math.floor(totalElapsedTime / 60);
  let seconds = Math.floor(totalElapsedTime) - (60 * minutes);
  //Display minutes, add a 0 to the start if less than 10
  let result = (minutes < 10) ? "0" + minutes : minutes; 

  //Display seconds, add a 0 to the start if less than 10
  result += (seconds < 10) ? ":0" + seconds : ":" + seconds;

  timeLabel.text = result.toString();
}

// ----- Phaser initialization functions -----

const update = function(this: Phaser.Scene) {
  calculateForces(this);
  unstuckDudes();
  updateTimer();
};

const scene: CreateSceneFromObjectConfig = {
  preload: preload,
  create: create,
  update: update
};

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: map.width,
  height: map.height,
  scene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      fps: 30
    }
  },
  backgroundColor: 0xffffff
};

export let game: Phaser.Game = null;

export const initGame = () => {
  game = new Phaser.Game(config);
};

document.addEventListener("DOMContentLoaded", onDOMReadyControlSetup);
