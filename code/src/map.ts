const doorWidth = 30;
const doorIndicatorWidth = 15;

export default {
  width: 1900,
  height: 1100,
  wallThickness: 10,
  

  walls: [
    // bounding box
    [{ x: 0, y: 0 }, { x: 1900, y: 0 }],
    [{ x: 0, y: 1100 }, { x: 1900, y: 1100 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1100 }],
    [{ x: 1900, y: 0 }, { x: 1900, y: 1100 }],


    // horizontal walls at y=425
    [{ x: 0, y: 425 }, { x: 60, y: 425 }],
    [{ x: 110, y: 425 }, { x: 420, y: 425 }],
    [{ x: 470, y: 425 }, { x: 1000, y: 425 }],
    [{ x: 1050, y: 425 }, { x: 1700, y: 425 }],

    // horizontal walls at y=650
    [{ x: 0, y: 650 }, { x: 70, y: 650 }],
    [{ x: 120, y: 650 }, { x: 610, y: 650 }],
    [{ x: 660, y: 650 }, { x: 800, y: 650 }],
    [{ x: 850, y: 650 }, { x: 980, y: 650 }],
    [{ x: 1030, y: 650 }, { x: 1160, y: 650 }],
    [{ x: 1210, y: 650 }, { x: 1330, y: 650 }],
    [{ x: 1380, y: 650 }, { x: 1700, y: 650 }],

    // vertical walls from y=650 to y=1100
    [{ x: 200, y: 650 }, { x: 200, y: 1100 }],
    [{ x: 720, y: 650 }, { x: 720, y: 1100 }],
    [{ x: 900, y: 650 }, { x: 900, y: 1100 }],
    [{ x: 1090, y: 650 }, { x: 1090, y: 1100 }],
    [{ x: 1270, y: 650 }, { x: 1270, y: 1100 }],
    [{ x: 1700, y: 650 }, { x: 1700, y: 1100 }],

    // other vertical walls
    [{ x: 925, y: 0 }, { x: 925, y: 425 }],

    // despwan/target zone
    [{ x: 1700, y: 0 }, { x: 1700, y: 200 }],
    [{ x: 1700, y: 300 }, { x: 1700, y: 425 }],
    [{ x: 1270, y: 110 }, { x: 1590, y: 110 }],
    [{ x: 1640, y: 110 }, { x: 1700, y: 110 }],
    [{ x: 1270, y: 110 }, { x: 1270, y: 425 }],

    // kitchen
    [{ x: 1090, y: 0 }, { x: 1090, y: 200 }],
    [{ x: 1090, y: 250 }, { x: 1090, y: 260 }],
    [{ x: 1090, y: 260 }, { x: 1125, y: 260 }],
    [{ x: 1125, y: 260 }, { x: 1125, y: 425 }],

    // restroom
    [{ x: 0, y: 750 }, { x: 90, y: 750 }],
    [{ x: 0, y: 802 }, { x: 90, y: 802 }],
    [{ x: 0, y: 854 }, { x: 90, y: 854 }],
    [{ x: 0, y: 906 }, { x: 90, y: 906 }],
    [{ x: 0, y: 960 }, { x: 90, y: 960 }],
    [{ x: 140, y: 750 }, { x: 200, y: 750 }],
    [{ x: 175, y: 802 }, { x: 200, y: 802 }],
    [{ x: 175, y: 854 }, { x: 200, y: 854 }],
    [{ x: 175, y: 906 }, { x: 200, y: 906 }],
    [{ x: 160, y: 960 }, { x: 200, y: 960 }],
    


    /////// tables ///////
    // polysnack
    [{ x: 70, y: 70 }, { x: 110, y: 170 }],
    [{ x: 70, y: 225 }, { x: 110, y: 325 }],
    [{ x: 170, y: 70 }, { x: 210, y: 170 }],
    [{ x: 170, y: 225 }, { x: 210, y: 325 }],
    [{ x: 270, y: 70 }, { x: 310, y: 170 }],
    [{ x: 270, y: 225 }, { x: 310, y: 325 }],
    [{ x: 370, y: 70 }, { x: 410, y: 170 }],
    [{ x: 370, y: 225 }, { x: 410, y: 325 }],
    [{ x: 470, y: 70 }, { x: 510, y: 170 }],
    [{ x: 470, y: 225 }, { x: 510, y: 325 }],

    // exercise room 1
    [{ x: 285, y: 735 }, { x: 310, y: 805 }],
    [{ x: 285, y: 815 }, { x: 310, y: 885 }],
    [{ x: 285, y: 895 }, { x: 310, y: 965 }],
    [{ x: 285, y: 975 }, { x: 310, y: 1045 }],
    [{ x: 350, y: 735 }, { x: 375, y: 805 }],
    [{ x: 350, y: 815 }, { x: 375, y: 885 }],
    [{ x: 350, y: 895 }, { x: 375, y: 965 }],
    [{ x: 350, y: 975 }, { x: 375, y: 1045 }],
    [{ x: 415, y: 735 }, { x: 440, y: 805 }],
    [{ x: 415, y: 815 }, { x: 440, y: 885 }],
    [{ x: 415, y: 895 }, { x: 440, y: 965 }],
    [{ x: 415, y: 975 }, { x: 440, y: 1045 }],
    [{ x: 480, y: 735 }, { x: 505, y: 805 }],
    [{ x: 480, y: 815 }, { x: 505, y: 885 }],
    [{ x: 480, y: 895 }, { x: 505, y: 965 }],
    [{ x: 480, y: 975 }, { x: 505, y: 1045 }],

    [{ x: 640, y: 850 }, { x: 665, y: 920 }],
  ],

  doors: [
    //////// doors //////////
    // doors at y=425
    {
      position: { x: 85, y: 425 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    },
    {
      position: { x: 445, y: 425 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    },
    {
      position: { x: 1025, y: 425 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    },

    // doors at y=650
    {
      position: { x: 95, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 635, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 825, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 1005, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 1185, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 1355, y: 650 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    
    
    // door into despawn/target zone
    {
      position: { x: 1700, y: 250 },
      orientation: { x: 1, y: 0 },
      direction: { x: -1, y: 0 }
    },
    
    
    // doors inside restroom
    {
      position: { x: 115, y: 750 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 90, y: 776 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 90, y: 828 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 90, y: 880 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 90, y: 932 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 125, y: 960 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },

    // doors inside the kitchen
    {
      position: { x: 1090, y: 225 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 1180, y: 110 },
      orientation: { x: 0, y: 1 },
      direction: { x: 0, y: -1 }
    },
    {
      position: { x: 1615, y: 110 },
      orientation: { x: 0, y: -1 },
      direction: { x: 0, y: 1 }
    },
  ],

  signs: [
    {
      position: { x: 550, y: 538 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },
    {
      position: { x: 1700, y: 538 },
      orientation: { x: -1, y: 0 },
      direction: { x: 1, y: 0 }
    },    
  ],

  spawnPoints: [
    // hallway
    { x: 200, y: 538 },
    { x: 900, y: 520 },
    { x: 904, y: 545 },
    { x: 898, y: 570 },

    // restroom
    { x: 20, y: 776 },
    { x: 20, y: 880 },
    { x: 20, y: 932 },
    { x: 53, y: 1038 },

    // polysnack
    //tables
    { x: 55, y: 103 },
    { x: 55, y: 150 },
    { x: 125, y: 98 },
    { x: 125, y: 149 },
    { x: 328, y: 154 },
    { x: 453, y: 83 },
    { x: 526, y: 89 },
    { x: 126, y: 272 },
    { x: 252, y: 244 },
    { x: 450, y: 305 },
    { x: 529, y: 246 },

    // queue
    { x: 642, y: 367 },
    { x: 700, y: 365 },
    { x: 745, y: 365 },
    { x: 805, y: 362 },
    { x: 840, y: 340 },
    { x: 880, y: 280 },
    { x: 880, y: 228 },
    { x: 880, y: 140 },

    // kitchen
    { x: 960, y: 320 },
    { x: 960, y: 140 },

    // exercise room 1
    { x: 675, y: 865 },
  ],

  tables: [
    [{ x:70, y: 70 }, { x:90, y: 750 }],
  ],

  despawn_zone: [
    [{ x: 1270, y: 110 }, { x: 1590, y: 425 }]
  ]

};



/*

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
    }
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
}; */
