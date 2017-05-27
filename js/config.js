/*

  fix       => values no changing at all, think earth radius, PI, TAU
  options   => values changeable by user, some of them are also in => 
  preset    => vales managed by gui.dat 
  config    => all of above combined

*/

const 
  RADIUS = 1.0,
  DISTANCE_OVERLAY  = 0.01,
  DISTANCE_TRAILS = 0.03
;

const FIX = {

} 

const timerange = [
  '2017-05-21',
  '2017-05-22',
  '2017-05-23',
  '2017-05-24',
  '2017-05-25',
];


var CFG = {

  Faces: ['right', 'left', 'top', 'bottom', 'front', 'back'],

  earth: {
    radius: RADIUS,
    radiusOverlay: RADIUS + 0.1,
  },

  objects: {

    perspective: {
      type: 'camera',
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      // pos:             new THREE.Vector3(0.5, 3.4, 0.5),       // Greenland centered
      // pos:             new THREE.Vector3(0.05, 2.3, -0.08),    // North Pole
      // pos:             new THREE.Vector3(0.5, -2.2, -3),          // Low near AA
      pos:             new THREE.Vector3(4, 0, 0),                // 0,0
    },

    ambient: {
      visible: true,
      type: 'light',
      color: 0xffffff,
      intensity: 0.3,
      light: (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
    },

    spot:    {
      visible: true,
      type: 'light',
      color: 0xffffff, 
      intensity: 0.2, 
      distance: 0, 
      angle: 0.6, 
      penumbra: 0.1, 
      decay: 0,
      light: (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
      pos:   new THREE.Vector3(0, 2, 0)
    },

    sun: {
      visible:      true,
      type:         'light',
      skycolor:     0xffd5a6,
      grdcolor:     0x161661,
      intensity:    0.2, 
      light:        (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
      pos:          new THREE.Vector3(2, 2, 2)
    },

    axes: {
      visible: true,
      type: 'mesh',
      mesh: new THREE.AxisHelper( RADIUS * 4 ),
    },

    arrowHelper: {
      // latlon-pointer
      visible: true,
      type: 'mesh',
      mesh: new THREE.ArrowHelper( 
        new THREE.Vector3( 1, 1,  1), 
        new THREE.Vector3( 0,  0,  0), 
        RADIUS + 0.08, 
        0xffff00
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
      visible: true,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'globe',
        radius: RADIUS, 
        texture: 'images/mask/earth.FACE.2048.jpg', 
        bump:    'images/topo/earth.FACE.topo.2048.jpg',
      }
    },

    snpp: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'globe',
        radius: RADIUS - 0.002,
        texture: 'data/snpp/2017-05-23.globe.snpp.FACE.2048.jpg', 
      }
    },

    sst: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'globe',
        radius: RADIUS + 0.001, 
        texture: 'data/sst/2017-05-22.globe.sst.FACE.1024.png', 
      }
    },

    seaice: {
      visible: false,
      type: 'cube.textured',
      rotation: [0, Math.PI / 2, 0],
      cube: {
        type: 'polar',
        radius: RADIUS + 0.002, 
        texture: 'data/seaice/2017-05-22.polar.amsr2.FACE.1024.png', 
      }
    },

    wind: {
      visible: true,
      type: 'simulation',
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

  // Galaxy: {
  //   mesh: new THREE.Mesh(
  //     new THREE.SphereGeometry(100, 32, 32),                  // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
  //     new THREE.MeshBasicMaterial({side: THREE.BackSide})
  //   ),
  //   textures: {
  //     map: 'images/starfield.png'
  //   },
  // },

  // orbitControls: {
  //   enableDamping:       true,
  //   dampingFactor:       0.88,
  //   constraint: {
  //     smoothZoom:        true,
  //     smoothZoomSpeed:   5.0,
  //     zoomDampingFactor: 0.2,
  //     minDistance:       1,
  //     maxDistance:       8
  //   }
  // },

  // Markers: [{
  //     label:          'North Pole',
  //     latitude:        90,
  //     longitude:       0,
  //     radius:          0.5,
  //     height:          0,
  //     size:            0.01,
  //     color:           0xff0000
  //   }
  // ],


  // Cameras: {

  // },

  // preset: {

  // },


  'gui.dat' : {
    Loading: 0,
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
      intensity: {val: 0.5, min: 0, max: 1},
      color: '#ffffff'
    },
    Spot: {
      isFolder: true,
      toggle: true,
      intensity: {val: 0.5, min: 0, max: 1},
      color: '#ffffff'
    },
    Sun: {
      isFolder:  true,
      toggle:    true,
      intensity: {val: 0.5, min: 0, max: 1},
      skycolor: '#ffd5a6',
      grdcolor: '#161661',
    },
    Layers: {
      isFolder: true,
      'SNPP':   true,
      'DATA':   true,
      'SST':    true,
      'SEAICE': true,
      'WIND':   true,
      'TEST':   true,
    },
    DateTime : {
      isFolder: true,
      choose: {val: 3, min: 0, max: timerange.length -1},
    },
    Extras: {
      isFolder: true,
      Axes:     true,
      Rotate:   () => {},
    },
    Simulation: {
      isFolder: true,
      start:     () => {},
      stop:      () => {},
      pause:     () => {},
    }
  }

};

