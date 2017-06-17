/*

  fix       => values no changing at all, think earth radius, PI, TAU
  options   => values changeable by user, some of them are also in => 
  preset    => vales managed by gui.dat 
  config    => all of above combined

*/

/* GLOBAL */

const 
  PI     = Math.PI,
  TAU    = 2 * PI,
  PI2    = PI / 2,
  RADIUS = 1.0,
  DISTANCE_OVERLAY = 0.01,
  DISTANCE_TRAILS  = 0.03
;

const FIX = {

} 

const timerange = [
  '2017-05-21',
  '2017-05-22',
  '2017-05-23',
  '2017-05-24',
  '2017-05-25',
  '2017-05-26',
  '2017-05-27',
  '2017-05-28',
  '2017-05-29',
  '2017-05-30',
];


var CFG = {

  Faces: ['right', 'left', 'top', 'bottom', 'front', 'back'],

  Textures: {
    
    'line.alpha.32.png':        'images/line.alpha.32.png',
    'line.alpha.16.png':        'images/line.alpha.16.png',
    'line.alpha.16.png':        'images/line.alpha.16.png',
    'transparent.face.512.png': 'images/transparent.face.512.png',

    'hud/hamburger.png':        'images/hud/hamburger.png',
    'hud/fullscreen.png':       'images/hud/fullscreen.png',
    'hud/movie.png':            'images/hud/movie.png',
    'hud/graticule.png':        'images/hud/graticule.png',
    'hud/info.png':             'images/hud/info.png',
    'hud/performance.png':      'images/hud/performance.png',
    'hud/performance.png':      'images/hud/performance.png',

  },

  lightsets: {
    data: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    snpp: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    neutral: {
      sun:        {intensity: 0.0},
      spot:       {intensity: 0.0},
      ambient:    {intensity: 1.0},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
  },

  earth: {
    factor:        6371,
    radius:        RADIUS,
    radiusOverlay: RADIUS + 0.1,
  },

  minDistance:     RADIUS + 0.2,
  maxDistance:     8,

};
