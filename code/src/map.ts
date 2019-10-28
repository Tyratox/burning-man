const doorWidth = 30;
const doorIndicatorWidth = 15;

export default {
  width: 900,
  height: 350,
  wallThickness: 10,
  walls: [
    //upper part
    [{ x: 0, y: 0 }, { x: 0, y: 100 }],
    [{ x: 0, y: 0 }, { x: 775, y: 0 }],
    [{ x: 625, y: 0 }, { x: 625, y: 100 }],
    [{ x: 700, y: 0 }, { x: 700, y: 100 }],
    [{ x: 625, y: 100 }, { x: 775, y: 100 }],
    [{ x: 0, y: 100 }, { x: 625, y: 100 }],
    [{ x: 775, y: 100 - doorWidth }, { x: 775, y: 100 }],
    [{ x: 775, y: 0 }, { x: 775, y: 0 + doorWidth }],
    [{ x: 0, y: 175 }, { x: 100 + doorIndicatorWidth, y: 175 }],
    //lower part
    [{ x: 100, y: 175 }, { x: 100, y: 350 }], //back to wall
    [{ x: 100, y: 350 }, { x: 775, y: 350 }], //wall all the way
    [{ x: 200, y: 175 }, { x: 200, y: 350 }], //back up
    [{ x: 200, y: 175 }, { x: 200 - doorIndicatorWidth, y: 175 }], //small door line
    [{ x: 200, y: 175 }, { x: 500 - (doorIndicatorWidth + doorWidth), y: 175 }],
    [{ x: 500, y: 175 }, { x: 500, y: 350 }],
    [{ x: 500, y: 175 }, { x: 500 - doorIndicatorWidth, y: 175 }],
    [{ x: 500, y: 175 }, { x: 500 + doorIndicatorWidth, y: 175 }],
    [{ x: 550, y: 175 }, { x: 550, y: 350 }],
    [{ x: 550, y: 175 }, { x: 550 - doorIndicatorWidth, y: 175 }],
    [{ x: 550, y: 175 }, { x: 550 + doorIndicatorWidth, y: 175 }],
    [{ x: 600, y: 175 }, { x: 600, y: 350 }],
    [{ x: 600, y: 175 }, { x: 600 - doorIndicatorWidth, y: 175 }],
    [{ x: 600, y: 175 }, { x: 600 + doorIndicatorWidth, y: 175 }],
    [{ x: 650, y: 175 }, { x: 650, y: 350 }],
    [{ x: 650, y: 175 }, { x: 650 - doorIndicatorWidth, y: 175 }],
    [{ x: 650, y: 175 }, { x: 650 + doorIndicatorWidth, y: 175 }],
    [{ x: 775, y: 175 }, { x: 775, y: 350 }],
    [{ x: 775, y: 175 }, { x: 650 + doorIndicatorWidth + doorWidth, y: 175 }]
  ]
};
