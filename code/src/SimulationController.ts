import * as Phaser from "phaser";
import { TraceableAttractiveTarget, TraceableRepulsiveTarget } from "./types";
import Names from "../assets/names.json";
import Agent, { strictNormal } from "./Agent";
import { CONSTANTS, updateSurvivorPhrase } from "./controls";
import AttractiveTarget from "./AttractiveTarget";
import Fire from "./Fire";
import { timer } from ".";

class SimulationController {
  //targets for raytracing
  attractiveTargets: TraceableAttractiveTarget[];
  repulsiveTargets: TraceableRepulsiveTarget[];
  //array of wall shapes, seeing through them is not possible
  wallShape: Phaser.Geom.Rectangle[];

  agents: Agent[];
  escapeTimestamps: number[];

  //dynamic object groups
  agentGroup: number;
  somkeGroup: number;
  despawnZoneGroup: number;
  wallGroup: number;
  tableGroup: number;
  doorGroup: number;
  attractiveTargetGroup: number;
  fireGroup: number;

  //counters
  totalNumberOfAgents: number;
  numberOfDeadAgents: number;
  numberOfEscapedAgents: number;

  //pathfinding
  navmesh: any;

  //scene relation
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.attractiveTargets = [];
    this.repulsiveTargets = [];
    this.wallShape = [];
    this.agents = [];
    this.escapeTimestamps = [];

    this.totalNumberOfAgents = 0;
    this.numberOfDeadAgents = 0;
    this.numberOfEscapedAgents = 0;

    this.scene = scene;
    this.agentGroup = scene.matter.world.nextCategory();
    this.somkeGroup = scene.matter.world.nextCategory();

    this.wallGroup = scene.matter.world.nextCategory();
    this.tableGroup = scene.matter.world.nextCategory();
    this.despawnZoneGroup = scene.matter.world.nextCategory();
    this.doorGroup = scene.matter.world.nextCategory();
    this.attractiveTargetGroup = scene.matter.world.nextCategory();
    this.fireGroup = scene.matter.world.nextCategory();
  }

  toggleDebugObjectsVisibility = () => {
    // this.despawnZoneGroup.toggleVisible();
    // this.wallGroup.toggleVisible();
    // this.doorGroup.toggleVisible();
    // this.attractiveTargetGroup.toggleVisible();
    // this.tableGroup.toggleVisible();
  };
  toggleNavmeshDebugVisibility = () => {
    if (this.navmesh.isDebugEnabled()) {
      this.navmesh.disableDebug();
    } else {
      this.navmesh.enableDebug();
    }
  };

  generateVisualMap = () => {
    const tilemap = this.scene.make.tilemap({ key: "map" });
    this.scene.game.scale.setGameSize(
      tilemap.widthInPixels,
      tilemap.heightInPixels
    );
    this.scene.matter.world.setBounds(
      0,
      0,
      tilemap.widthInPixels,
      tilemap.heightInPixels
    );

    const tileset = tilemap.addTilesetImage("minimal-tileset", "tiles");
    const floorLayer = tilemap.createStaticLayer("floor", [tileset], 0, 0);
    const wallLayer = tilemap.createStaticLayer("walls", [tileset], 0, 0);
    const tablesLayer = tilemap.createStaticLayer("tables", [tileset], 0, 0);

    return tilemap;
  };

  initializePathfinding(tilemap: Phaser.Tilemaps.Tilemap) {
    //@ts-ignore
    const navmesh = this.scene.navMeshPlugin.buildMeshFromTiled(
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

    this.navmesh = navmesh;
  }

  addWall = (rect: Phaser.Types.Tilemaps.TiledObject) => {
    this.wallShape.push(
      new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height)
    );
    this.scene.matter.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      {
        isStatic: true,
        collisionFilter: {
          group: 1,
          category: this.wallGroup,
          mask: this.agentGroup
        }
      }
    );
  };

  addAgent = (agentLocation: Phaser.Types.Tilemaps.TiledObject) => {
    const r = strictNormal(
      CONSTANTS.MEAN_DUDE_RADIUS,
      CONSTANTS.DUDE_RADIUS_STD_DEV
    );
    const agent = new Agent(
      agentLocation.x,
      agentLocation.y,
      r,
      Names[Math.floor(Math.random() * Names.length)],
      this
    );
    this.scene.children.add(agent); //add the the scene
    this.agents.push(agent);
  };

  addObstacle = (obstacle: Phaser.Types.Tilemaps.TiledObject) => {
    if (obstacle.ellipse) {
      this.scene.matter.add.circle(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.width,
        {
          isStatic: true,
          collisionFilter: {
            group: 2,
            category: this.tableGroup,
            mask: this.agentGroup
          }
        }
      );
    } else {
      this.scene.matter.add.rectangle(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.width,
        obstacle.height,
        {
          isStatic: true,
          collisionFilter: {
            group: 2,
            category: this.tableGroup,
            mask: this.agentGroup
          }
        }
      );
    }
  };

  addDespawnZone = (zone: Phaser.Types.Tilemaps.TiledObject) => {
    this.scene.matter.add.rectangle(
      zone.x + zone.width / 2,
      zone.y + zone.height / 2,
      zone.width,
      zone.height,
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          group: 2,
          category: this.despawnZoneGroup,
          mask: this.agentGroup
        }
      }
    );
  };

  addSign = (sign: Phaser.Types.Tilemaps.TiledObject, index: number) => {
    let orientationX =
      sign.properties &&
      sign.properties.find(
        (p: { name: string; value: number }) => p.name === "orientationX"
      );

    orientationX = orientationX ? orientationX.value : null;

    let orientationY =
      sign.properties &&
      sign.properties.find(
        (p: { name: string; value: number }) => p.name === "orientationY"
      );

    orientationY = orientationY ? orientationY.value : null;

    const radius =
      sign.properties &&
      sign.properties.find(
        (p: { name: string; value: number }) => p.name === "radius"
      );

    if (orientationX !== null && orientationY !== null) {
      const triangle = this.scene.add.isotriangle(
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

      this.attractiveTargets.push({
        type: "sign",
        index,
        position: { x: sign.x, y: sign.y },
        orientation: { x: orientationX, y: orientationY }
      });
    } else {
      const circle = this.scene.add.circle(
        sign.x,
        sign.y,
        CONSTANTS.TRIANGLE_SIZE,
        0x237f52
      );

      this.attractiveTargets.push({
        type: "sign",
        index,
        position: { x: sign.x, y: sign.y }
      });
    }

    this.scene.matter.add.gameObject(
      new AttractiveTarget(
        index,
        sign.x,
        sign.y,
        this.scene,
        radius ? radius : undefined
      ),
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          group: 2,
          category: this.attractiveTargetGroup,
          mask: this.agentGroup
        }
      }
    );
  };

  addDoor = (door: Phaser.Types.Tilemaps.TiledObject, index: number) => {
    const orientationX: number = door.properties.find(
      (p: { name: string; value: number }) => p.name === "orientationX"
    ).value;
    const orientationY: number = door.properties.find(
      (p: { name: string; value: number }) => p.name === "orientationY"
    ).value;

    const triangle = this.scene.add.isotriangle(
      door.x,
      door.y,
      CONSTANTS.TRIANGLE_SIZE,
      CONSTANTS.TRIANGLE_HEIGHT,
      false,
      0x3498db,
      0x3498db,
      0x2980b9
    );

    const directionNorm = Math.sqrt(
      orientationX * orientationX + orientationY * orientationY
    );

    triangle.rotation =
      (orientationX < 0 ? 1 : -1) * Math.acos(orientationY / directionNorm);

    this.attractiveTargets.push({
      type: "door",
      index: index,
      position: { x: door.x, y: door.y },
      orientation: { x: orientationX, y: orientationY }
    });

    this.scene.matter.add.gameObject(
      new AttractiveTarget(index, door.x, door.y, this.scene),
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          group: 2,
          category: this.attractiveTargetGroup,
          mask: this.agentGroup
        }
      }
    );
  };

  addFire = (fire: Phaser.Types.Tilemaps.TiledObject) => {
    //this.fireGroup.add(new Fire(this.scene, fire.x, fire.y, this.somkeGroup));
  };

  onAgentDeath = (agent: Agent) => {
    console.log("Dude " + agent.name + " unfortunately perished in the fire!");
    this.scene.add.sprite(agent.x, agent.y, "skull");

    this.numberOfDeadAgents++;
    agent.destroy();
  };

  onSmokeContact = (agent: Agent, smoke: Phaser.GameObjects.Arc) => {
    agent.health -= smoke.alpha * 10;

    if (agent.health <= 0) {
      this.onAgentDeath(agent);
    }
  };

  onDespawn = (agent: Agent) => {
    updateSurvivorPhrase("Dude " + agent.name + " is a survivor!");

    console.log("Dude " + agent.name + " is a survivor!");
    this.numberOfEscapedAgents++;

    agent.destroy();
    this.agents.splice(this.agents.indexOf(agent), 1);
    this.escapeTimestamps.push(timer.getTotalElapsedTime());
  };

  onHitTarget = (agent: Agent, target: AttractiveTarget) => {
    agent.visitedTargets.push(target.index);
    agent.path = null;
  };

  resetAgentCount = () => {
    this.totalNumberOfAgents = this.agents.length;
  };
}

export default SimulationController;
