export const CONSTANTS = {
  TRIANGLE_HEIGHT: 20,
  TRIANGLE_SIZE: 10,

  DUDE_REPULSION_LINEAR: 1 / 1000,
  DUDE_REPULSION_EXPONENTIAL: 205,
  DUDE_GROUP_ATTRACTION: 5000,
  ACCEPTABLE_WALL_DISTANCE: 30,
  WALL_REPULSION_FORCE: 500,
  DEFAULT_REACTION_TIME: 1,
  DEFAULT_DESIRED_VELOCITY: 100,

  MAX_SMOKE_RADIUS: 20,
  MIN_SMOKE_RADIUS: 10,

  SMOKE_VELOCITY: 30,
  FIRE_RADIUS: 20,

  SMOKE_EMISSION_RATE: 800,
  MAX_SMOKE_PARTICLES_PER_FIRE: 20
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
  const rangeSliderContainers = document.querySelectorAll("#sliders > div");
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
};
