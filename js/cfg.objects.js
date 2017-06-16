
CFG.Objects = {

  perspective: {
    type: 'camera',
    cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
    // pos:             new THREE.Vector3(4, 0, 0),                // Äq
    pos:             new THREE.Vector3().add({x: 2.555, y: 1.111, z: 1.144}),
  },

  ambient: {
    visible:    true,
    type:       'light',
    color:      0xffffff,
    intensity:  1.0,
    light: (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
  },

  spot:    {
    visible:   true,
    type:      'light',
    color:     0xffffff, 
    intensity: 0.0, 
    distance:  0.0, 
    angle:     0.3, 
    penumbra:  0.1, 
    decay:     0.0,
    light:     (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
    pos:       new THREE.Vector3(0, 4, 0)
  },

  sun: {
    visible:      true,
    type:         'light',
    skycolor:     0xffddaa, // reddish
    grdcolor:     0x8989c3, // blueish
    intensity:    0.0, 
    light:        (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
    pos:          new THREE.Vector3(2, 2, 2)
  },

  axes: {
    visible:     false,
    type:        'mesh',
    mesh:        new THREE.AxisHelper( RADIUS * 4 ),
  },
 
  // lat lon pointer of click marker
  arrowHelper: {
    visible:     false,
    type:       'mesh',
    mesh:       new THREE.ArrowHelper( 
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
      0x666666,
      0x666666,
      0x222222,
      0x222222,
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
    visible:        false,
    type:           'mesh-calculate',
    altitude:       0.01,
    resolution:     10,
    material: {
      transparent:  true,
      opacity:      0.2,
      color:        0x000000,
      linewidth:    1.1,
      vertexColors: THREE.NoColors,
    }
  },

  population: {
    visible:        false,
    type:           'mesh-calculate',
    altitude:       0.001,
    opacity:        0.8,
    radius:         1.0,
    ucolor:         new THREE.Color(0xffffff),
  },

  sector: {
    visible:        false,
    type:           'mesh-calculate',
    altitude:       0.01,
    resolution:     1,
    sector:         [15, -15, -15, 15],
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
      // texture:       'images/data/globe.data.FACE.4096.comp.png', 
      texture:       'images/rtopo2/globe.rtopo2.FACE.4096.png', 
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
      texture: 'data/snpp/2017-06-13.globe.snpp.FACE.2048.jpg', 
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
      texture: 'data/amsr2/2017-06-13.polar.amsr2.FACE.1024.grey.trans.png', 
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
        'data/gfs/tmp2m/2017-06-13-12.tmp2m.10.dods',
        'data/gfs/ugrd10m/2017-06-13-12.ugrd10m.10.dods',
        'data/gfs/vgrd10m/2017-06-13-12.vgrd10m.10.dods',
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
    hue:       220,
    sim: {
      data: [
        'data/gfs/ugrdprs/2017-06-13-12.ugrdprs.10.dods',
        'data/gfs/vgrdprs/2017-06-13-12.vgrdprs.10.dods',
        // 'data/gfs/DATETIME.ugrdprs.10.dods',
        // 'data/gfs/DATETIME.vgrdprs.10.dods',
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
        'data/gfs/tcdcclm/2017-06-13-12.tcdcclm.10.dods',
      ],
      sectors: [
        [ 89.9, -180,  -89.9,  180 ], // all
      ],
    }
  },


};
