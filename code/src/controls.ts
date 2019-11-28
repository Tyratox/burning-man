import { game, initGame, setCurrentStartTime, setPreviousElapsedTime } from ".";

export const CONSTANTS = {
  TRIANGLE_HEIGHT: 20,
  TRIANGLE_SIZE: 10,

  DUDE_REPULSION_LINEAR: 1 / 1000,
  DUDE_REPULSION_EXPONENTIAL: 500,
  DUDE_GROUP_ATTRACTION: 500,
  ACCEPTABLE_WALL_DISTANCE: 30,
  WALL_REPULSION_FORCE: 50,
  DEFAULT_DESIRED_VELOCITY: 100,

  MAX_SMOKE_RADIUS: 20,
  MIN_SMOKE_RADIUS: 10,

  SMOKE_VELOCITY: 30,
  FIRE_RADIUS: 20,

  SMOKE_EMISSION_RATE: 200,
  MAX_SMOKE_PARTICLES_PER_FIRE: 100,

  MEAN_DUDE_MAX_VELOCITY: 125,
  DUDE_MAX_VELOCITY_STD_DEV: 50,

  MEAN_DUDE_MAX_ACCELERATION: 50,
  DUDE_MAX_ACCELERATION_STD_DEV: 10,

  MEAN_DUDE_RADIUS: 12,
  DUDE_RADIUS_STD_DEV: 2,

  MEAN_DUDE_VISUAL_RANGE: 2000,
  DUDE_VISUAL_RANGE_STD_DEV: 500,

  MEAN_DUDE_AGE: 40,
  DUDE_AGE_STD_DEV: 20,

  MEAN_DUDE_WEIGHT: 70,
  DUDE_WEIGHT_STD_DEV: 20,

  MEAN_DUDE_FITNESS: 0.5,
  DUDE_FITNESS_STD_DEV: 0.4
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
  const overlay: HTMLDivElement = document.querySelector(".wrapper .overlay");

  initButton.addEventListener("click", () => {
    staticSliders.style.display = "none";
    gameCanvas.style.display = "block";
    dynamicSliders.style.display = "block";
    startButton.style.display = "block";

    initGame();
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

  startButton.addEventListener("click", () => {
    overlay.style.display = "none";
    startButton.style.display = "none";

    setCurrentStartTime(game.getTime());
    game.scene.resume("default");
  });
};
