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

  objects: {

    perspective: {
      type: 'camera',
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      // pos:             new THREE.Vector3(0.5, 3.4, 0.5),       // Greenland centered
      // pos:             new THREE.Vector3(0.05, 2.3, -0.08),    // North Pole
      // pos:             new THREE.Vector3(0.5, -2.2, -3),          // Low near AA
      // pos:             new THREE.Vector3(0.8, 3.9, 0.0),                // 0,0
      pos:             new THREE.Vector3(4, 0, 0),                // Äq
    },

    ambient: {
      visible:    true,
      type:       'light',
      color:      0xffffff,
      intensity:  0.1,
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
      visible:      true,
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
      visible: true,
      type: 'mesh',
      mesh: new THREE.ArrowHelper( 
        new THREE.Vector3( 1, 1,  1), 
        new THREE.Vector3( 0,  0,  0), 
        RADIUS + 0.08, 
        0xffff00
      )
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
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.SingleSide,
        }
      }
    },

    seaice: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI * 1.5, 0],
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
      visible: true,
      type: 'simulation',
      rotation: [0, Math.PI, 0],
      sim: {
        data: [
          'data/gfs/2017-05-23.tmp2m.dods',
          'data/gfs/2017-05-23.ugrd10m.dods',
          'data/gfs/2017-05-23.vgrd10m.dods',
        ]
      }
    },

    clouds: {
      visible: false,
      type: 'simulation',
      sim: {
        data: [
          'data/gfs/2017-05-23.tcdcclm.dods',
        ]
      }
    },


  },

};

const PRESET = {
  Loading: '',
  SimTime: '',
  Render: true,
  Animate: true,
  Simulate: true,
  Reload: () => location.reload(),
  Camera: {
    isFolder: true,
    reset: () => {},
  },
  Ambient: {
    isFolder: true,
    toggle: true,
    intensity: {val: CFG.objects.ambient.intensity, min: 0, max: 1},
    color: '#ffffff'
  },
  Spot: {
    isFolder: true,
    toggle: true,
    angle:     {val: 0.5, min: 0, max: Math.PI},
    intensity: {val: CFG.objects.spot.intensity, min: 0, max: 1},
    color: '#ffffff'
  },
  Sun: {
    isFolder:  true,
    toggle:    true,
    intensity: {val: CFG.objects.sun.intensity, min: 0, max: 1},
    skycolor:  CFG.objects.sun.skycolor,
    grdcolor:  CFG.objects.sun.grdcolor,
  },
  Layers: {
    isFolder:   true,
    'SNPP':     CFG.objects.snpp.visible,
    'DATA':     CFG.objects.data.visible,
    'SST':      CFG.objects.sst.visible,
    'SEAICE':   CFG.objects.seaice.visible,
    'WIND':     CFG.objects.wind.visible,
    'TEST':     CFG.objects.test.visible,
    'LAND':     CFG.objects.land.visible,
    'RIVERS':   CFG.objects.rivers.visible,
  },
  DateTime : {
    isFolder:    true,
    choose:     {val: 3, min: 0, max: 365 * 24, step: 1},
    hour1:      () => {},
    hourn1:     () => {},
    hour24:     () => {},
    hourn24:    () => {},
    day30:      () => {},
    dayn30:     () => {},
  },
  Extras: {
    isFolder:   true,
    Axes:       CFG.objects.axes.visible,
    Rotate:     () => {},
    ZoomOut:    () => {},
  },
  Simulation: {
    isFolder:   true,
    start:      () => {},
    stop:       () => {},
    pause:      () => {},
  }
};

