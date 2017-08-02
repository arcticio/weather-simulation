/*

  This is an actively composed configuration: 
    values get possibly overwritten (e.g. texture),
    there are function, eval'd later,
    or event handlers,
    it creates globals (e.g PI, TAU)

*/


/* GLOBALS */

const 
  PI      =   Math.PI,
  TAU     =   2 * PI,
  PI2     =   PI / 2,
  RADIUS  =   1.0,    // surface, population
  LEVEL_0 =   0.000,  // population
  LEVEL_1 =   0.001,  // basemaps, snpp, rtopo2
  LEVEL_2 =   0.002,  // sst
  LEVEL_3 =   0.003,  // seaice
  LEVEL_4 =   0.004,  // wind10, tmp2m
  LEVEL_5 =   0.005,  // clouds
  LEVEL_6 =   0.006,  // jetstream, graticule
  LEVEL_7 =   0.007,  // atmosphere
  LEVEL_8 =   0.008,  // atmosphere

  KELVIN  =   273.15
;

var TIMENOW = moment.utc('2017-06-20 1200', 'YYYY-MM-DD HHmm');

var CFG = {

  isLoaded:         false,

  Title:            'Hypatia - Global Weather',

  User: {
    ip:                        '',
    country_code:              '',
    country_name:              'Unknown',
    region_code:               '',
    region_name:               '',
    city:                      '',
    zip_code:                  '',
    time_zone:                 '',
    latitude:                  0.0,
    longitude:                 0.0,
    metro_code:                0,
    loc_detected:              false,
  },

  Device: {

    // System
    browser:                   'unknown',
    platform:                  navigator.platform,
    vendor_webgl:              'unknown',
    renderer_webgl:            'unknown',
    threads:                   navigator.hardwareConcurrency || 2,
    userAgent:                 navigator.userAgent,
    language:                  navigator.language,

    // display
    screen:                    H.deepClonePrimitives(screen),
    window: {
      width:                   window.innerWidth,
      height:                  window.innerHeight,
    },
    devicePixelRatio:          NaN,

    // latest scroll event handling
    supportsPassive:           false,

    // Interface
    canVibrate:                navigator.vibrate && location.protocol === 'https:',
    canFullScreen:             false,

    // Sensors
    canMotion:                 false,
    canOrientation:            false,
    canUserProximitry:         false,
    canDeviceProximitry:       false,
    canGeoLocation:            navigator.geolocation && navigator.geolocation.getCurrentPosition,

    // WebGL
    maxvertexuniforms:              NaN,
    max_texture_image_units:        NaN,
    max_texture_size:               NaN,
    max_vertex_texture_image_units: NaN,

    oes_texture_float:         false,
    oes_texture_float_linear:  false,
    oes_standard_derivatives:  false,

  },
      
  Connection: {
    secure:                    location.protocol === 'https:',
    bandwidth:                 NaN
  },

  Camera: {
    cam:            new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10),
    pos:            new THREE.Vector3(4, 0, 0),         
    minRadius:      RADIUS + 0.2,
    maxRadius:      8,                 
  },

  Sim: {
    coordspool : {
      amount:                  5e5,
    }
  },

  Hud: {
    opacityLow:                0.5,
    opacityHigh:               0.99,
  },

  Basemaps: {
    resolution:                512,
  },

  Faces:                       ['right', 'left', 'top', 'bottom', 'front', 'back'],

  Textures: {

    // basemaps

    // debug capture
    'globe.mask.bottom.512.png':    'images/basemaps/2048/globe.mask.bottom.2048.png',
    'globe.mask.top.512.png':       'images/basemaps/2048/globe.mask.top.2048.png',
    'globe.mask.left.512.png':      'images/basemaps/2048/globe.mask.left.2048.png',
    'globe.mask.right.512.png':     'images/basemaps/2048/globe.mask.right.2048.png',
    'globe.mask.front.512.png':     'images/basemaps/2048/globe.mask.front.2048.png',
    'globe.mask.back.512.png':      'images/basemaps/2048/globe.mask.back.2048.png',

    // 'globe.mask.bottom.512.png':    'images/basemaps/512/globe.mask.bottom.512.png',
    // 'globe.mask.top.512.png':       'images/basemaps/512/globe.mask.top.512.png',
    // 'globe.mask.left.512.png':      'images/basemaps/512/globe.mask.left.512.png',
    // 'globe.mask.right.512.png':     'images/basemaps/512/globe.mask.right.512.png',
    // 'globe.mask.front.512.png':     'images/basemaps/512/globe.mask.front.512.png',
    // 'globe.mask.back.512.png':      'images/basemaps/512/globe.mask.back.512.png',

    'globe.topo.bottom.512.png':    'images/basemaps/512/globe.topo.bottom.512.png',
    'globe.topo.top.512.png':       'images/basemaps/512/globe.topo.top.512.png',
    'globe.topo.left.512.png':      'images/basemaps/512/globe.topo.left.512.png',
    'globe.topo.right.512.png':     'images/basemaps/512/globe.topo.right.512.png',
    'globe.topo.front.512.png':     'images/basemaps/512/globe.topo.front.512.png',
    'globe.topo.back.512.png':      'images/basemaps/512/globe.topo.back.512.png',

    'globe.gmlc.bottom.512.png':    'images/basemaps/512/globe.gmlc.bottom.512.png',
    'globe.gmlc.top.512.png':       'images/basemaps/512/globe.gmlc.top.512.png',
    'globe.gmlc.left.512.png':      'images/basemaps/512/globe.gmlc.left.512.png',
    'globe.gmlc.right.512.png':     'images/basemaps/512/globe.gmlc.right.512.png',
    'globe.gmlc.front.512.png':     'images/basemaps/512/globe.gmlc.front.512.png',
    'globe.gmlc.back.512.png':      'images/basemaps/512/globe.gmlc.back.512.png',

    'transparent.face.512.png':     'images/transparent.face.512.png',

    'arcticio.logo.512.png':        'images/arcticio.logo.white.512.png',
    'red.dot.png':                  'images/red.dot.png',
    'dot.white.128.png':            'images/dot.white.128.png',
    'logo.128.png':                 'images/logo.128.01.png',

    // Tools
    'hud/fullscreen.png':           'images/hud/fullscreen.png',
    'hud/gear.png':                 'images/hud/gear.1.png',
    'hud/graticule.png':            'images/hud/graticule.3.png',
    'hud/hamburger.png':            'images/hud/hamburger.png',
    'hud/info.png':                 'images/hud/info.png',
    'hud/movie.png':                'images/hud/movie.1.png',
    'hud/reload.png':               'images/hud/reload.png',

    // Assets
    'hud/mask.png':                 'images/hud/mask.png',
    'hud/vegetation.png':           'images/hud/vegetation.png',
    'hud/clouds.png':               'images/hud/clouds.png',
    'hud/satellite.png':            'images/hud/satellite.1.png',
    'hud/seaice.png':               'images/hud/seaice.png',
    'hud/snow.png':                 'images/hud/snow.png',
    'hud/space.png':                'images/hud/space.png',
    'hud/sst.png':                  'images/hud/sst.png',
    'hud/temperature.png':          'images/hud/temperature.01.png',
    'hud/rain.png':                 'images/hud/rain.png',
    'hud/population.png':           'images/hud/population.png',
    'hud/backdrop.png':             'images/hud/backdrop.png',
    'hud/atmosphere.png':           'images/hud/atmosphere.png',
    'hud/jetstream.png':            'images/hud/jetstream.png',

    // 'oceanmask.4096x2048.grey.png': 'images/spheres/oceanmask.4096x2048.grey.png',

  },

  Lightsets: {
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
    normal: {
      sun:        {intensity: 0.0},
      spot:       {intensity: 0.0},
      ambient:    {intensity: 1.0},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
  },

  Sun: {
    radius:            10,
  },

  earth: {
    factor:            6371,
    radius:            RADIUS,
  },

};
