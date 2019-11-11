const doorWidth = 30;
const doorIndicatorWidth = 15;

export default {
  width: 900,
  height: 350,
  wallThickness: 10,
  spawnPoints: [
    // freddy
    { x: 15, y: 130 },
    // freddy 2.0
    { x: 300, y: 130 },
    //table of 6
    { x: 15, y: 15 },
    { x: 15, y: 30 },
    { x: 15, y: 45 },
    { x: 45, y: 15 },
    { x: 45, y: 30 },
    { x: 45, y: 45 },
    //table of 4
    { x: 15, y: 75 },
    { x: 15, y: 90 },
    { x: 45, y: 75 },
    { x: 45, y: 90 },

    //table of 6(4)
    { x: 100, y: 15 },
    //{ x: 100, y: 30 },
    { x: 100, y: 45 },
    { x: 130, y: 15 },
    { x: 130, y: 30 },
    //{ x: 130, y: 45 },

    //table of 4(0) | Exit
    //{ x: 100, y: 75 },
    //{ x: 100, y: 90 },
    //{ x: 130, y: 75 },
    //{ x: 130, y: 90 },

    //table of 6(4)
    { x: 185, y: 15 },
    { x: 185, y: 30 },
    { x: 185, y: 45 },
    { x: 215, y: 15 },
    //{ x: 215, y: 30 },
    //{ x: 215, y: 45 },

    //table of 4(2)
    //{ x: 185, y: 75 },
    //{ x: 185, y: 90 },
    { x: 215, y: 75 },
    { x: 215, y: 90 },

    //table of 6
    { x: 270, y: 15 },
    { x: 270, y: 30 },
    { x: 270, y: 45 },
    { x: 300, y: 15 },
    { x: 300, y: 30 },
    { x: 300, y: 45 },
    //table of 4
    { x: 270, y: 75 },
    { x: 270, y: 90 },
    { x: 300, y: 75 },
    { x: 300, y: 90 },

    //queue
    { x: 380, y: 90 },
    { x: 395, y: 90 },
    { x: 410, y: 90 },
    { x: 425, y: 90 },
    { x: 440, y: 90 },
    { x: 455, y: 90 },
    { x: 470, y: 90 },
    { x: 485, y: 90 },
    { x: 500, y: 90 },
    { x: 515, y: 90 },
    { x: 530, y: 90 },
    { x: 545, y: 90 },
    { x: 560, y: 90 },
    { x: 570, y: 80 },
    { x: 580, y: 70 },
    { x: 580, y: 55 },
    { x: 580, y: 40 },
    { x: 570, y: 30 },
    { x: 545, y: 20 },
    { x: 520, y: 35 },

    // room 1 bottom left / toilet
    { x: 75, y: 245 },
    { x: 75, y: 275 },
    { x: 20, y: 305 },
    { x: 75, y: 305 },

    // room 2 bottom
    { x: 150, y: 300 },

    // room 3 bottom
    { x: 350, y: 330 }, //TA
    { x: 235, y: 218 },
    { x: 255, y: 218 },
    { x: 255, y: 273 },
    { x: 325, y: 273 },
    { x: 375, y: 273 },
    { x: 395, y: 218 }
    // room 7 bottom (empty)
  ],
  // p_1 = Center of sign, p_2 = alignment vector
  signs: [
    // Floor Rescue Sign. orientation: visibility, direction: forces
    {
      position: { x: 250, y: 137 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 770, y: 137 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    }
    /*{
      position: { x: 770, y: 50 },
      orientation: { x: 1, y: 0 },
      direction: { x: -1, y: 0 }
    },
    {
      position: { x: 113, y: 110 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    },
    {
      position: { x: 315, y: 110 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    }*/
  ],
  walls: [
    //upper part
    [{ x: 0, y: 0 }, { x: 0, y: 100 }],
    [{ x: 0, y: 0 }, { x: 775, y: 0 }],
    [{ x: 625, y: 0 }, { x: 625, y: 100 }],
    [{ x: 700, y: 0 }, { x: 700, y: 100 }],
    [{ x: 625, y: 100 }, { x: 775, y: 100 }],
    [{ x: 0, y: 100 }, { x: 100, y: 100 }],
    [{ x: 100 + doorWidth, y: 100 }, { x: 300, y: 100 }],
    [{ x: 300 + doorWidth, y: 100 }, { x: 625, y: 100 }],
    [{ x: 775, y: 100 - doorWidth }, { x: 775, y: 100 }],
    [{ x: 775, y: 0 }, { x: 775, y: 0 + doorWidth }],
    //pizza bar
    [{ x: 595, y: 0 }, { x: 595, y: 100 }],
    //checkout
    [{ x: 450, y: 25 }, { x: 500, y: 25 }],
    [{ x: 450, y: 25 }, { x: 450, y: 50 }],
    [{ x: 500, y: 25 }, { x: 500, y: 50 }],
    [{ x: 450, y: 50 }, { x: 500, y: 50 }],
    //tables
    [{ x: 28, y: 10 }, { x: 32, y: 45 }], //big / top
    [{ x: 28, y: 75 }, { x: 32, y: 100 }], //small / bottom
    [{ x: 113, y: 10 }, { x: 117, y: 45 }], //big / top
    [{ x: 198, y: 10 }, { x: 202, y: 45 }], //big / top
    [{ x: 198, y: 75 }, { x: 202, y: 100 }], //small / bottom
    [{ x: 283, y: 10 }, { x: 287, y: 45 }], //big / top
    [{ x: 283, y: 75 }, { x: 287, y: 100 }], //small / bottom
    //lower part
    [{ x: 30, y: 175 }, { x: 100 + doorIndicatorWidth, y: 175 }],
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
    [{ x: 775, y: 175 }, { x: 650 + doorIndicatorWidth + doorWidth, y: 175 }],
    //toilets
    [{ x: 0, y: 230 }, { x: 30, y: 230 }],
    [{ x: 0, y: 260 }, { x: 30, y: 260 }],
    [{ x: 0, y: 290 }, { x: 30, y: 290 }],
    [{ x: 0, y: 320 }, { x: 30, y: 320 }],
    //pissoirs
    [{ x: 85, y: 230 }, { x: 100, y: 230 }],
    [{ x: 85, y: 260 }, { x: 100, y: 260 }],
    [{ x: 85, y: 290 }, { x: 100, y: 290 }],
    [{ x: 85, y: 320 }, { x: 100, y: 320 }],
    //room 3
    //row 1
    [{ x: 230, y: 230 }, { x: 260, y: 245 }],
    [{ x: 300, y: 230 }, { x: 330, y: 245 }],
    [{ x: 370, y: 230 }, { x: 400, y: 245 }],
    [{ x: 440, y: 230 }, { x: 470, y: 245 }],
    //row 2
    [{ x: 230, y: 285 }, { x: 260, y: 300 }],
    [{ x: 300, y: 285 }, { x: 330, y: 300 }],
    [{ x: 370, y: 285 }, { x: 400, y: 300 }],
    [{ x: 440, y: 285 }, { x: 470, y: 300 }],

    //room 7
    [{ x: 670, y: 230 }, { x: 700, y: 245 }],
    [{ x: 720, y: 230 }, { x: 750, y: 245 }],
    [{ x: 670, y: 265 }, { x: 700, y: 280 }],
    [{ x: 720, y: 265 }, { x: 750, y: 280 }],
    [{ x: 670, y: 300 }, { x: 700, y: 315 }],
    [{ x: 720, y: 300 }, { x: 750, y: 315 }]
  ]
};