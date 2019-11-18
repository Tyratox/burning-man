import * as Phaser from "phaser";
import { throttle } from "lodash";

import {
  TRIANGLE_HEIGHT,
  TRIANGLE_SIZE,
  DUDE_REPULSION_LINEAR,
  DUDE_REPULSION_EXPONENTIAL,
  DUDE_GROUP_ATTRACTION,
  ACCEPTABLE_WALL_DISTANCE,
  WALL_REPULSION,
  DEFAULT_REACTION_TIME,
  DEFAULT_DESIRED_VELOCITY
} from "./controls";
import Dude from "./Dude";
import map from "./map";
import { isLeftOfLine, distanceToLineSegment } from "./utilities/math";
import { onDOMReadyControlSetup } from "./controls";
import Fire from "./Fire";

type ScenePreloadCallback = Phaser.Types.Scenes.ScenePreloadCallback;
type SceneCreateCallback = Phaser.Types.Scenes.SceneCreateCallback;
type CreateSceneFromObjectConfig = Phaser.Types.Scenes.CreateSceneFromObjectConfig;
type GameConfig = Phaser.Types.Core.GameConfig;

export const getBody = (
  obj: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Body =>
  //@ts-ignore
  obj.body;

const traceable = [...map.signs, ...map.doors];

let dudeGroup: Phaser.GameObjects.Group;

const fire: Fire[] = [];
//let fireGrid = new Array(map.fireGridHeigth).fill(0).map(() => new Array(map.fireGridWidth).fill(false));

// const fireRadius = 13;
// const fireOffset = 30;
// const fireSpreadRate = 0.05;

const accelerationThreshold = 0;
const accelerationValue = 1000;

const speedThreshold = 7;

const preload: ScenePreloadCallback = function(this: Phaser.Scene) {
  //load images if needed
  this.load.image("fire", "assets/logo.png");
  this.load.image("smokePNG", "assets/logo.png");
};

const create: SceneCreateCallback = function(this: Phaser.Scene) {
  //generate map, yehei

  // fire.forEach((f: Fire) =>{
  //   f.emmiter.start();
  // })
  const halfThickness = map.wallThickness / 2;

  const walls = this.physics.add.staticGroup();
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
      TRIANGLE_SIZE,
      TRIANGLE_HEIGHT,
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
      TRIANGLE_SIZE,
      TRIANGLE_HEIGHT,
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

  dudeGroup = this.add.group();

  // To do: Add to physics engine
  const fireGroup = this.add.group();

  map.spawnPoints.forEach(point => {
    const dude = new Dude(
      point.x,
      point.y,
      Math.random(),
      0.3 + Math.random() * 0.7,
      Math.random(),
      "Peter",
      this
    );
    dudeGroup.add(dude);
  });

  // Test fire emitter
  map.fireSpawnPoints.forEach(point => {
    let f = new Fire(this, point.x, point.y, 20, fireGroup);
    fire.push(f);
  });
  
  this.physics.add.collider(fireGroup, walls);
  this.physics.add.collider(dudeGroup, dudeGroup, (p1, p2) => {
    //collision callback
  });

  this.physics.add.collider(dudeGroup, walls);
  this.physics.add.collider(dudeGroup, tables);
  this.physics.add.collider(walls, fireGroup);
  this.physics.add.collider(dudeGroup, despawn_zones, (dude: Dude, zone) => {
    console.log("Dude " + dude.name + " is a survivor!");
    dude.destroy();
  });
};

const rayTrace = (dude: Dude, scene: Phaser.Scene) => {
  const trackingRays = scene.add.group();
  const { x: dudeX, y: dudeY } = dude.getBody();

  const res = traceable.reduce(
    (best, element) => {
      const { position, orientation } = element;

      if (
        orientation.x * (position.x - dudeX) +
          orientation.y * (position.y - dudeY) <
        0
      ) {
        const signToAgent = new Phaser.Geom.Line(
          dudeX,
          dudeY,
          position.x,
          position.y
        );
        const currentDist = Math.sqrt(
          (position.x - dudeX) * (position.x - dudeX) +
            (position.y - dudeY) * (position.y - dudeY)
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
        return intersect === undefined && best.distance > currentDist
          ? { distance: currentDist, sign: position }
          : best;
      }

      return best;
    },
    { distance: Number.MAX_VALUE, sign: { x: -1, y: -1 } }
  ).sign;

  if (res.x > 0) {
    const offset = dude.getRadius();
    trackingRays.add(
      scene.add
        .line(0, 0, dudeX + offset, dudeY + offset, res.x, res.y, 0xff0000, 0.1)
        .setOrigin(0, 0)
    );
  }

  setTimeout(() => {
    trackingRays.destroy(true);
  }, 100);

  return new Phaser.Math.Vector2({ x: res.x, y: res.y });
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
      closestWallDistance < ACCEPTABLE_WALL_DISTANCE &&
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
        wallRepulsion.scale(WALL_REPULSION / closestWallDistance)
      ); //how strong is the repulsion
    }

    /*setTimeout(() => {
      wallDebuggingLines.destroy(true);
    }, 100);*/

    //calculate directioncorrecting force
    const reactionTime = DEFAULT_REACTION_TIME; //depends on dude
    const desiredVelocity = DEFAULT_DESIRED_VELOCITY;

    // CorrectingForce = Mass*(Vdesired-Vcurr)/reactionTime
    const sign = rayTrace(dudes[i], scene);
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
              DUDE_REPULSION_LINEAR *
                Math.exp(DUDE_REPULSION_EXPONENTIAL / distance),
              100
            );

      //the bigger the distance the smaller the pulling force
      const pullingForce = 1 / (distance * DUDE_GROUP_ATTRACTION);

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
      curr.speed < speedThreshold &&
      accelerationVector.length() > accelerationThreshold
    ) {
      let changeDirection = new Phaser.Math.Vector2(
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
      changeDirection.scale(accelerationValue);
      // Help dude out of stuckness
      curr.acceleration.add(changeDirection);
    }
  });
};

const update = function(this: Phaser.Scene) {
  calculateForces(this);
  fire.forEach((f) => {
    f.spawn(this);
  });
  //fireExpansion(this);
  unstuckDudes();
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
      gravity: { x: 0, y: 0 }
    }
  },

  backgroundColor: 0xffffff
};

const game = new Phaser.Game(config);

document.addEventListener("DOMContentLoaded", onDOMReadyControlSetup);
