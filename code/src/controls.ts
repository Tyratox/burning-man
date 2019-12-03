import {
  game,
  initGame,
  setCurrentStartTime,
  setPreviousElapsedTime,
  toggleDebugObjectsVisibility,
  toggleNavmeshDebugVisibility,
  previousElapsedTime,
  currentElapsedTime,
  totalNumberOfDudes,
  numberOfDeadDudes,
  numberOfSurvivorDudes
} from ".";

export const CONSTANTS = {
  TRIANGLE_HEIGHT: 20,
  TRIANGLE_SIZE: 10,

  DUDE_COUNT_CAP: 100,

  DUDE_REPULSION_LINEAR: 20,
  DUDE_REPULSION_EXPONENTIAL: 10,
  DUDE_GROUP_ATTRACTION: 0,
  WALL_REPULSION_LINEAR: 20,
  WALL_REPULSION_EXPONENTIAL: 10,
  DEFAULT_DESIRED_VELOCITY: 100, //not used, slider

  MAX_SMOKE_RADIUS: 20,
  MIN_SMOKE_RADIUS: 10,

  SMOKE_VELOCITY: 30,
  FIRE_RADIUS: 20,

  SMOKE_EMISSION_RATE: 200,// not used, slider
  MAX_SMOKE_PARTICLES_PER_FIRE: 100,

  MEAN_DUDE_MAX_VELOCITY: 125,
  DUDE_MAX_VELOCITY_STD_DEV: 50,

  MEAN_DUDE_MAX_ACCELERATION: 50, // not used, slider
  DUDE_MAX_ACCELERATION_STD_DEV: 10, //not used , no slider

  MEAN_DUDE_RADIUS: 12,
  DUDE_RADIUS_STD_DEV: 2,

  MEAN_DUDE_VISUAL_RANGE: 2000,
  DUDE_VISUAL_RANGE_STD_DEV: 500,

  MEAN_DUDE_AGE: 40,// used -> agility
  DUDE_AGE_STD_DEV: 20,

  MEAN_DUDE_WEIGHT: 70,// used -> weight
  DUDE_WEIGHT_STD_DEV: 20,

  MEAN_DUDE_FITNESS: 0.5,// used -> agility
  DUDE_FITNESS_STD_DEV: 0.4,

  RENDER_DEBUG_OBJECTS: true,
  RENDER_NAVMESH_DEBUG: false,
  PATHFINDACTIVE: true
};

const onSliderChange = (e: InputEvent) => {
  //@ts-ignore, i (think) know what i'm doing
  const slider: HTMLInputElement = e.currentTarget;
  const valueField: HTMLInputElement = slider.parentElement.querySelector(
    "input[type=text]"
  );

  valueField.value = slider.value;
  CONSTANTS[slider.id] = parseInt(slider.value);
};

export const onDOMReadyControlSetup = e => {
  const rangeSliderContainers = document.querySelectorAll(
    ".sliders .columns > div"
  );
  for (const sliderContainer of rangeSliderContainers) {
    const slider: HTMLInputElement = sliderContainer.querySelector(
      "input[type=range]"
    );
    const valueField: HTMLInputElement = sliderContainer.querySelector(
      "input[type=text]"
    );

    //set initial value
    valueField.value = slider.value;
    slider.addEventListener("input", onSliderChange);
  }

  const initButton: HTMLButtonElement = document.querySelector(
    "#static-sliders button"
  );
  const gameCanvas: HTMLCanvasElement = document.querySelector("#game");
  const staticSliders = document.getElementById("static-sliders");
  const dynamicSliders = document.getElementById("dynamic-sliders");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const debugButton = document.getElementById("debug");
  const navmeshDebugButton = document.getElementById("navmeshDebug");
  const pathFindButton = document.getElementById("pathFinding");
  const overlay: HTMLDivElement = document.querySelector(".wrapper .overlay");

  initButton.addEventListener("click", () => {
    staticSliders.style.display = "none";
    gameCanvas.style.display = "block";
    dynamicSliders.style.display = "block";
    startButton.style.display = "block";

    const select: HTMLSelectElement = document.querySelector("#map-selector");
    initGame(select.value);
  });

  pauseButton.addEventListener("click", () => {
    if (game.scene.isPaused("default")) {
      setCurrentStartTime(game.getTime());
      game.scene.resume("default");
      pauseButton.innerText = "Pause";
    } else {
      setPreviousElapsedTime(game.getTime());
      game.scene.pause("default");
      pauseButton.innerText = "Resume";
    }
  });

  debugButton.addEventListener("click", () => {
    if (CONSTANTS.RENDER_DEBUG_OBJECTS) {
      debugButton.innerText = "Debug On";
    } else {
      debugButton.innerText = "Debug Off";
    }
    CONSTANTS.RENDER_DEBUG_OBJECTS = !CONSTANTS.RENDER_DEBUG_OBJECTS;
    toggleDebugObjectsVisibility();
  });

  navmeshDebugButton.addEventListener("click", () => {
    if (CONSTANTS.RENDER_NAVMESH_DEBUG) {
      navmeshDebugButton.innerText = "Navmesh Debug On";
    } else {
      navmeshDebugButton.innerText = "Navmesh Debug Off";
    }
    CONSTANTS.RENDER_NAVMESH_DEBUG = !CONSTANTS.RENDER_NAVMESH_DEBUG;
    toggleNavmeshDebugVisibility();
  });

  pathFindButton.addEventListener("click", () => {
    if (CONSTANTS.PATHFINDACTIVE) {
      CONSTANTS.PATHFINDACTIVE = false;
      pathFindButton.innerText = "Pathfinding On";
    } else {
      CONSTANTS.PATHFINDACTIVE = true;
      pathFindButton.innerText = "Pathfinding Off";
    }
  });

  startButton.addEventListener("click", () => {
    overlay.style.display = "none";
    startButton.style.display = "none";

    setCurrentStartTime(game.getTime());
    game.scene.resume("default");
  });
};

export const simulationFinished = () => {
  const pauseButton = document.getElementById("pause");
  pauseButton.setAttribute("disabled", "disabled");
  pauseButton.style.backgroundColor = "grey";

  const dynamicSliders = document.getElementById("dynamic-sliders");
  dynamicSliders.style.display = "none";

  const results = document.getElementById("results");
  results.style.display = "block";
  const textarea: HTMLTextAreaElement = document.querySelector(
    "#results textarea"
  );

  const values = {
    ...CONSTANTS,
    TIME: previousElapsedTime + currentElapsedTime,
    AGENTS_TOTAL: totalNumberOfDudes,
    AGENTS_DEAD: numberOfDeadDudes,
    AGENTS_SAFE: numberOfSurvivorDudes
  };

  const csv = '"' + Object.keys(values).join('", "') + '"\n' + '"' + Object.values(values).join('", "') + '"\n';

  textarea.value = csv;
};

export const updateSurvivorPhrase = (phrase: string) => {
  document.getElementById("survivorPhrase").innerHTML = phrase + '\n';
}

export const updateStatistics = () => {
  // totalNumberOfDudes
  // numberOfDeadDudes
  // numberOfSurvivorDudes
  const nrOfDeaths = document.getElementById("countDeath");
  const nrOfSurvivor = document.getElementById("countSurvivor");
  const deathSurvivorRate = document.getElementById("deathSurvivorRate");
  nrOfDeaths.innerHTML = "Nr. of Deaths: " + numberOfDeadDudes;
  nrOfSurvivor.innerHTML = "Nr. of Survivors: " + numberOfSurvivorDudes;
  deathSurvivorRate.innerHTML = "Rate: " + (numberOfSurvivorDudes / totalNumberOfDudes) * 100 + " %";

};