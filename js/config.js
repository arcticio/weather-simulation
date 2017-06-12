/*

  fix       => values no changing at all, think earth radius, PI, TAU
  options   => values changeable by user, some of them are also in => 
  preset    => vales managed by gui.dat 
  config    => all of above combined

*/

const 
  PI = Math.PI,
  TAU = 2 * PI,
  PI2 = PI / 2,
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

  earth: {
    radius:        RADIUS,
    radiusOverlay: RADIUS + 0.1,
  },

  minDistance:     RADIUS + 0.2,
  maxDistance:     8,

  sprites : {

    hamburger: {
      visible:  true,
      type:     'toggle',
      toggled:  false,
      position: {
        top:     14,
        left:    18,
        width:   48,
        height:  48,
      },
      material: {
        opacity: 0.5,
        image: 'images/hud/hamburger.png'
      },
      onclick: (sprite) => {
        IFC.Hud.toggle();
        console.log('sprite.click', sprite.name);
      },
    },

    fullscreen: {
      visible:  true,
      type:     'toggle',
      toggled:  false,
      position: {
        top:     74,
        left:    18,
        width:   48,
        height:  48,
      },
      material: {
        opacity: 0.5,
        image: 'images/hud/fullscreen.png'
      },
      onclick: (sprite) => {
        screenfull.enabled && screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
        console.log('sprite.clicked', sprite.name);
      },
    },

    movie: {
      visible:  true,
      position: {
        top:     134,
        left:     18,
        width:    48,
        height:   48,
      },
      material: {
        opacity: 0.5,
        image: 'images/hud/movie.png'
      },
      onclick: (sprite) => {
        console.log('sprite.click', sprite.name);
      },
    },

    graticule: {
      visible:  true,
      type:     'toggle',
      toggled:  false,
      position: {
        top:     194,
        left:     18,
        width:    48,
        height:   48,
      },
      material: {
        opacity: 0.5,
        image: 'images/hud/graticule.png'
      },
      onclick: (sprite) => {
        SCN.toggle(SCN.objects.graticule);
        console.log('sprite.clicked', sprite.name);
      },
    },

    performance: {
      visible:  true,
      type:     'toggle',
      canvas:   document.createElement('CANVAS'),
      position: {
        bottom:   18,
        left:     18,
        width:    96,
        height:   48,
      },
      material: {
        opacity: 0.9,
        image: 'images/hud/performance.png'
      },
      onclick: (sprite) => {
        console.log('sprite.clicked', sprite.name);
      },
    }

  },

  objects: {

    perspective: {
      type: 'camera',
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      pos:             new THREE.Vector3(4, 0, 0),                // Äq
    },

    ambient: {
      visible:    true,
      type:       'light',
      color:      0xffffff,
      intensity:  0.3,
      light: (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
    },

    spot:    {
      visible:   true,
      type:      'light',
      color:     0xffffff, 
      intensity: 1.0, 
      distance:  0.0, 
      angle:     0.3, 
      penumbra:  0.1, 
      decay:     0.0,
      light: (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
      pos:   new THREE.Vector3(0, 4, 0)
    },

    sun: {
      visible:      false,
      type:         'light',
      skycolor:     0xffddaa, // reddish
      grdcolor:     0x8989c3, // blueish
      intensity:    0.6, 
      light:        (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
      pos:          new THREE.Vector3(2, 2, 2)
    },

    axes: {
      visible: false,
      type: 'mesh',
      mesh: new THREE.AxisHelper( RADIUS * 4 ),
    },

    // lat lon pointer of click marker
    arrowHelper: {
      visible: false,
      type: 'mesh',
      mesh: new THREE.ArrowHelper( 
        new THREE.Vector3( 1, 1,  1), 
        new THREE.Vector3( 0,  0,  0), 
        RADIUS + 0.08, 
        0xffff00
      )
    },

    background: {
      visible:      true,
      type:         'mesh-calculate',
      size:         4.0,
      colors: [
        new THREE.Color(0xff0000),
        new THREE.Color(0x00ff00),
        new THREE.Color(0x0000ff),
        new THREE.Color(0xff00ff),
      ]
    },

    sunPointer: {
      // sun dir pointer
      visible: false,
      type: 'mesh',
      mesh: new THREE.ArrowHelper( 
        new THREE.Vector3( 1, 1,  1), 
        new THREE.Vector3( 0,  0,  0), 
        RADIUS + 0.2, 
        0xff0000
      )
    },

    pointer: {
      // raycaster
      visible: true,
      type: 'mesh',
      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS - 0.01, 64, 64),                  
        new THREE.MeshBasicMaterial({
          color:     0x330000,
          wireframe: true,
          transparent: true,
          opacity: 0.1
        })
      ),
    },

    graticule: {
      visible:      false,
      type:         'mesh-calculate',
      altitude:     0.01,
      resolution:   10,
      material: {
        transparent:  true,
        opacity:      0.2,
        color:        0x000000,
        linewidth:    1.1,
        vertexColors: THREE.NoColors,
      }
    },

    population: {
      visible:      true,
      type:         'mesh-calculate',
      altitude:     0.001,
      opacity:      0.8,
      radius:       1.0,
      ucolor:       new THREE.Color(0xffffff),
    },

    sector: {
      visible:      false,
      type:         'mesh-calculate',
      altitude:     0.01,
      resolution:   1,
      sector:       [15, -15, -15, 15],
      material: {
        transparent:  true,
        opacity:      0.8,
        color:        0xff00ff,
        linewidth:    1.1,
        vertexColors: THREE.NoColors,
      }
    },

    randomizer: {
      visible: false,
      type: 'custom',
      amount: 100000,
      color:     0xeeeeee,
      opacity: 0.1,
      radius: RADIUS + 0.3,
      size: 0.01,
    },

    land: {
      visible: false,
      radius: RADIUS + 0.0008,
      type: 'geo.json',
      rotation: [0, Math.PI / 2, 0],
      json: 'data/json/countries_states.geojson',
      color: new THREE.Color('#888888'),
    },

    rivers: {
      visible: false,
      radius: RADIUS + 0.01,
      type: 'geo.json',
      rotation: [0, Math.PI / 2, 0],
      json: 'data/json/rivers.geojson',
      color: new THREE.Color('#888888'),
    },

    test: {
      visible: false,
      type: 'mesh.textured',
      texture: 'images/spheres/world.oceanmask.4096x2048.png',
      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS - 0.005, 64, 64),                  
        // new THREE.MeshBasicMaterial({
        new THREE.MeshLambertMaterial({
          // color:     0xff0000,
          // wireframe: true,
          transparent: true,
          opacity: 0.8,
        })
      ),
    },

    data: {
      visible:         true,
      type:            'cube.textured',
      rotation:        [0, Math.PI / 2, 0],
      cube: {
        type:          'globe',
        radius:        RADIUS, 
        texture:       'images/data/globe.data.FACE.4096.comp.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    snpp: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'globe',
        radius: RADIUS - 0.002,
        texture: 'data/snpp/2017-05-30.globe.snpp.FACE.2048.jpg', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    sst: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'globe',
        radius: RADIUS + 0.001, 
        texture: 'data/sst/2017-05-30.globe.sst.FACE.1024.png', 
        material: {
          transparent: true, 
          opacity:     0.50,              // removes crazy seaice effeckt
          side:        THREE.SingleSide,
        }
      }
    },

    seaice: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI * 0.5, 0],
      cube: {
        type: 'polar',
        radius: RADIUS + 0.002, 
        texture: 'data/seaice/2017-05-30.polar.amsr2.FACE.1024.grey.trans.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    wind: {
      visible:    false,
      type:       'simulation',
      subtype:    'multiline',
      rotation:   [0, Math.PI, 0],
      radius:     RADIUS + 0.001, 
      color:      new THREE.Color('#ff0000'),
      opacity:    0.5,
      lineWidth:  RADIUS * Math.PI / 180 * 0.2,
      section:    33 * 1/60,
      length:     60,
      amount:    512,
      sim: {
        data: [
          'data/gfs/permanent.landsfc.05.dods',
          'data/gfs/2017-05-30-12.tmp2m.05.dods',
          'data/gfs/2017-05-30-12.ugrd10m.05.dods',
          'data/gfs/2017-05-30-12.vgrd10m.05.dods',
        ],
        sectors: [
          [ 89.9, -180,  45.0,  180 ], // top
          [-45.0, -180, -89.9,  180 ], // bottom
          [ 45.0, -180, -45.0,  -90 ], // left back
          [ 45.0,  -90, -45.0,    0 ], // left front
          [ 45.0,    0, -45.0,   90 ], // right front
          [ 45.0,   90, -45.0,  180 ], // right back
        ],
      }
    },

    jetstream: {
      visible:    true,
      type:       'simulation',
      subtype:    'multiline',
      rotation:   [0, Math.PI, 0],
      radius:     RADIUS + 0.005, 
      color:      new THREE.Color('#ff0000'),
      opacity:    0.8,
      lineWidth:  RADIUS * Math.PI / 180 * 0.1,
      section:    33 * 1/60,
      length:     60,
      amount:    512,
      sim: {
        data: [
          'data/gfs/2017-05-30-12.ugrdprs.10.dods',
          'data/gfs/2017-05-30-12.vgrdprs.10.dods',
        ],
        sectors: [
          [ 89.9, -180,  45.0,  180 ], // top
          [-45.0, -180, -89.9,  180 ], // bottom
          [ 45.0, -180, -45.0,  -90 ], // left back
          [ 45.0,  -90, -45.0,    0 ], // left front
          [ 45.0,    0, -45.0,   90 ], // right front
          [ 45.0,   90, -45.0,  180 ], // right back
        ],
      }
    },

    clouds: {
      visible:  false,
      type:     'simulation',
      rotation: [0, Math.PI, 0],
      radius:   RADIUS + 0.005, 
      amount:   10000,
      size:     4.0,
      sim: {
        data: [
          'data/gfs/2017-05-30-12.tcdcclm.05.dods',
        ],
        sectors: [
          [ 89.9, -180,  -89.9,  180 ], // all
        ],
      }
    },


  },

};

const PRESET = {
  Loading:        '',
  SimTime:        '',
  Render:         true,
  Animate:        true,
  Simulate:       true,
  Reload:         () => location.reload(),
  Camera: {
    isFolder:     true,
    reset:        () => {},
  },

  Ambient: { isFolder: true,
    toggle:       true,
    intensity:    {val: CFG.objects.ambient.intensity, min: 0, max: 1},
    color:        '#ffffff'
  },

  Spot: { isFolder: true,
    toggle:       true,
    angle:        {val: 0.26, min: 0, max: 0.5},
    intensity:    {val: CFG.objects.spot.intensity, min: 0, max: 1},
    color:        '#ffffff'
  },

  Sun: { isFolder: true,
    toggle:       true,
    intensity:    {val: CFG.objects.sun.intensity, min: 0, max: 1},
    skycolor:     CFG.objects.sun.skycolor,
    grdcolor:     CFG.objects.sun.grdcolor,
  },

  Layers: { isFolder: true,
    'BACKGROUND': CFG.objects.background.visible,
    'POPULATION': CFG.objects.population.visible,
    'SNPP':       CFG.objects.snpp.visible,
    'DATA':       CFG.objects.data.visible,
    'SST':        CFG.objects.sst.visible,
    'SEAICE':     CFG.objects.seaice.visible,
    'WIND':       CFG.objects.wind.visible,
    'JETSTREAM':  CFG.objects.jetstream.visible,
    'LAND':       CFG.objects.land.visible,
    'RIVERS':     CFG.objects.rivers.visible,
    'CLOUDS':     CFG.objects.clouds.visible,
    'GRATICULE':  CFG.objects.graticule.visible,
    'SECTOR':     CFG.objects.sector.visible,
    // 'TEST':       CFG.objects.test.visible,
    // 'RANDOM':     CFG.objects.randomizer.visible,
  },

  DateTime : { isFolder:    true,
    choose:     {val: 3, min: 0, max: 365 * 24, step: 1},
    hour1:      () => {},
    hourn1:     () => {},
    hour24:     () => {},
    hourn24:    () => {},
    day30:      () => {},
    dayn30:     () => {},
  },

  Extras: { isFolder:   true,
    Axes:       CFG.objects.axes.visible,
    Rotate:     () => {},
    ZoomOut:    () => {},
  },

  Simulation: { isFolder:   true,
    start:      () => {},
    stop:       () => {},
    pause:      () => {},
  },

};

