import * as Phaser from "phaser";
import { TraceableAttractiveTarget, TraceableRepulsiveTarget } from "./types";
import Names from "../assets/names.json";
import Agent from "./Agent";
import { CONSTANTS, updateSurvivorPhrase } from "./controls";
import AttractiveTarget from "./AttractiveTarget";
import Fire from "./Fire";

class SimulationController {
  //targets for raytracing
  attractiveTargets: TraceableAttractiveTarget[];
  repulsiveTargets: TraceableRepulsiveTarget[];
  //array of wall shapes, seeing through them is not possible
  wallShape: Phaser.Geom.Rectangle[];

  //dynamic object groups
  agentGroup: Phaser.GameObjects.Group;
  somkeGroup: Phaser.GameObjects.Group;

  //static object groups
  despawnZoneGroup: Phaser.Physics.Arcade.StaticGroup;
  wallGroup: Phaser.Physics.Arcade.StaticGroup;
  tableGroup: Phaser.Physics.Arcade.StaticGroup;
  doorGroup: Phaser.Physics.Arcade.StaticGroup;
  attractiveTargetGroup: Phaser.Physics.Arcade.StaticGroup;
  fireGroup: Phaser.Physics.Arcade.StaticGroup;

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

    this.totalNumberOfAgents = 0;
    this.numberOfDeadAgents = 0;
    this.numberOfEscapedAgents = 0;

    this.scene = scene;
    this.agentGroup = scene.add.group();
    this.somkeGroup = scene.add.group();

    this.wallGroup = scene.physics.add.staticGroup();
    this.tableGroup = scene.physics.add.staticGroup();
    this.despawnZoneGroup = scene.physics.add.staticGroup();
    this.doorGroup = scene.physics.add.staticGroup();
    this.attractiveTargetGroup = scene.physics.add.staticGroup();
    this.fireGroup = scene.physics.add.staticGroup();
  }

  addNavmeshObject(navmesh: any) {}

  toggleDebugObjectsVisibility() {
    this.despawnZoneGroup.toggleVisible();
    this.wallGroup.toggleVisible();
    this.doorGroup.toggleVisible();
    this.attractiveTargetGroup.toggleVisible();
    this.tableGroup.toggleVisible();
  }
  toggleNavmeshDebugVisibility() {
    if (this.navmesh.isDebugEnabled()) {
      this.navmesh.disableDebug();
    } else {
      this.navmesh.enableDebug();
    }
  }

  generateVisualMap() {
    const tilemap = this.scene.make.tilemap({ key: "map" });
    this.scene.game.scale.setGameSize(
      tilemap.widthInPixels,
      tilemap.heightInPixels
    );
    this.scene.physics.world.setBounds(
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

    return tilemap;
  }

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

  addWall(rect: Phaser.Types.Tilemaps.TiledObject) {
    this.wallShape.push(
      new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height)
    );
    this.wallGroup.add(
      this.scene.add.rectangle(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width,
        rect.height,
        0x00ff00,
        0.3
      )
    );
  }

  addAgent(agentLocation: Phaser.Types.Tilemaps.TiledObject) {
    const agent = new Agent(
      agentLocation.x,
      agentLocation.y,
      Names[Math.floor(Math.random() * Names.length)],
      this.scene
    );

    this.scene.children.add(agent); //add the the scene
    this.scene.physics.world.enable(agent); //adds body / enables physics
    agent
      .getBody()
      .setCollideWorldBounds(true)
      .setBounce(0, 0)
      .setFriction(0.9, 0.9);

    this.agentGroup.add(agent);
  }

  addObstacle(obstacle: Phaser.Types.Tilemaps.TiledObject) {
    if (obstacle.ellipse) {
      this.tableGroup.add(
        this.scene.add.ellipse(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width,
          obstacle.height,
          0xd35400,
          0.3
        )
      );
    } else {
      this.tableGroup.add(
        this.scene.add.rectangle(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width,
          obstacle.height,
          0x8e44ad,
          0.3
        )
      );
    }
  }

  addDespawnZone(zone: Phaser.Types.Tilemaps.TiledObject) {
    this.despawnZoneGroup.add(
      this.scene.add.rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height,
        0xffeaa7
      )
    );
  }

  addSign(sign: Phaser.Types.Tilemaps.TiledObject, index: number) {
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

    this.attractiveTargetGroup.add(
      new AttractiveTarget(
        index,
        sign.x,
        sign.y,
        this.scene,
        radius ? radius.value : undefined
      )
    );
  }

  addFire(fire: Phaser.Types.Tilemaps.TiledObject) {
    this.fireGroup.add(new Fire(this.scene, fire.x, fire.y, this.somkeGroup));
  }

  onAgentDeath(agent: Agent) {
    console.log("Dude " + agent.name + " unfortunately perished in the fire!");
    this.scene.add.sprite(agent.x, agent.y, "skull");

    this.numberOfDeadAgents++;
    agent.destroy();
  }

  onSmokeContact(agent: Agent, smoke: Phaser.GameObjects.Arc) {
    agent.health -= smoke.alpha * 10;

    if (agent.health <= 0) {
      this.onAgentDeath(agent);
    }
  }

  onDespawn(agent: Agent, zone: Phaser.GameObjects.Rectangle) {
    updateSurvivorPhrase("Dude " + agent.name + " is a survivor!");

    console.log("Dude " + agent.name + " is a survivor!");
    this.numberOfEscapedAgents++;
    agent.destroy();
  }

  onHitTarget(agent: Agent, target: AttractiveTarget) {
    agent.visitedTargets.push(target.index);
    agent.path = null;
  }

  resetAgentCount() {
    this.totalNumberOfAgents = this.agentGroup.getLength();
  }
}

export default SimulationController;
