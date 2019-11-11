export let TRIANGLE_HEIGHT = 20;
export let TRIANGLE_SIZE = 10;

export let DUDE_REPULSION_LINEAR = 1 / 1000;
export let DUDE_REPULSION_EXPONENTIAL = 205;
export let DUDE_GROUP_ATTRACTION = 5000;
export let ACCEPTABLE_WALL_DISTANCE = 30;
export let WALL_REPULSION = 500;
export let DEFAULT_REACTION_TIME = 5;
export let DEFAULT_DESIRED_VELOCITY = 100;

const onSliderChange = (e: InputEvent) => {
  //@ts-ignore, i (think) know what i'm doing
  const slider: HTMLInputElement = e.currentTarget;
  const valueField: HTMLInputElement = slider.parentElement.querySelector(
    "input[type=text]"
  );

  valueField.value = slider.value;
  const value = parseInt(slider.value);

  switch (slider.id) {
    case "dude-repulsion-linear":
      DUDE_REPULSION_LINEAR = value;
      console.log(DUDE_REPULSION_LINEAR);

      break;
    case "dude-repulsion-exponential":
      DUDE_REPULSION_EXPONENTIAL = value;
      break;
    case "dude-group-attraction":
      DUDE_GROUP_ATTRACTION = value;
      break;
    case "acceptable-wall-distance":
      ACCEPTABLE_WALL_DISTANCE = value;
      break;
    case "wall-repulsion-force":
      WALL_REPULSION = value;
      break;
    case "default-reaction-time":
      DEFAULT_REACTION_TIME = value;
      break;
    case "default-desired-velocity":
      DEFAULT_DESIRED_VELOCITY = value;
      break;
    default:
      break;
  }
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
