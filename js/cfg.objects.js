
CFG.Objects = {

  perspective: {
    type: 'camera',
    cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
    // pos:             new THREE.Vector3(4, 0, 0),                            // Äq
    // pos:             new THREE.Vector3().add({x: 4.0, y: 0.0, z: 0.0}),
    // pos:             new THREE.Vector3().add({x: 2, y: 2.413, z: -0.0}), // Europe
    pos:             new THREE.Vector3().add({x: 0.9228848653425755, y: 1.0474566483142982, z: -0.07338449517434145}), // cloud test
  },

  ambient: {
    visible:        true,
    title:          'ambient light',
    type:           'light',
    color:          0xffffff,
    intensity:      0.3,
    light:          (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
  },

  spot:    {
    visible:   true,
    title:          'spot light',
    type:           'light',
    color:          0xffffff, 
    intensity:      0.9, // no 0 here
    distance:       0.0, 
    angle:          0.3, 
    penumbra:       0.1, 
    decay:          0.0,
    light:          (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
    pos:            new THREE.Vector3(0, 4, 0)
  },

  sun: {
    visible:        true,
    title:          'directional light',
    type:           'light',
    skycolor:       0xffddaa, // reddish
    grdcolor:       0x8989c3, // blueish
    intensity:      0.4, 
    light:          (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
    pos:            new THREE.Vector3(2, 2, 2)
  },


  atmosphere: {
    visible:        false,
    title:          'spot light',
    type:           'mesh-calculate',
    radius:         RADIUS + 0.002,
    rotation:       [0, Math.PI * 0.5, 0],
    intensity:      0.5,
    color:          0x3333ff,
  },

  axes: {
    visible:        false,
    title:          '3D axes',
    type:           'mesh',
    mesh:           new THREE.AxisHelper( RADIUS * 4 ),
  },
 
  // lat lon pointer of click marker
  arrowHelper: {
    visible:        false,
    title:          'arrow helper',
    type:           'mesh',
    mesh:           new THREE.ArrowHelper( 
                    new THREE.Vector3( 1, 1,  1), 
                    new THREE.Vector3( 0, 0,  0), 
                    RADIUS + 0.08, 
                    0xffff00
    )
  },

  background: {
    visible:        false,
    title:          'dynamic background',
    type:           'mesh-calculate',
    size:           4.0,
    colors: [
      0x666666,
      0x666666,
      0x222222,
      0x222222,
    ]
  },

  sunPointer: {
    // sun dir pointer
    visible:        false,
    title:          'sun pointer',
    type:           'mesh',
    mesh:           new THREE.ArrowHelper( 
                      new THREE.Vector3( 1, 1,  1), 
                      new THREE.Vector3( 0,  0,  0), 
                      RADIUS + 0.2, 
                      0xff0000
    )
  },

  pointer: {
    // raycaster
    visible:        true,
    title:          'pointer',
    type:           'mesh',
    mesh:           new THREE.Mesh(
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
    title:          'graticule',
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
    title:          '3000 cities',
    type:           'mesh-calculate',
    altitude:       0.001,
    opacity:        0.8,
    radius:         1.0,
    ucolor:         new THREE.Color(0xffffff),
  },

  sector: {
    visible:        false,
    title:          'sector marker',
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

  land: {
    visible:        false,
    title:          'geojson land',
    radius:         RADIUS + 0.0008,
    type:           'geo.json',
    rotation:       [0, Math.PI / 2, 0],
    json:           'data/json/countries_states.geojson',
    color:          new THREE.Color('#888888'),
  },

  rivers: {
    visible:        false,
    title:          'geojson rivers',
    radius:         RADIUS + 0.01,
    type:           'geo.json',
    rotation:       [0, Math.PI / 2, 0],
    json:           'data/json/rivers.geojson',
    color:          new THREE.Color('#888888'),
  },

  test: {
    visible:        false,
    title:          'test mesh',
    type:           'mesh.textured',
    texture:        'images/spheres/world.oceanmask.4096x2048.png',
    mesh:           new THREE.Mesh(
                      new THREE.SphereGeometry(RADIUS - 0.005, 64, 64),                  
                      new THREE.MeshLambertMaterial({
                        transparent: true,
                        opacity: 0.8,
                      })
                    ),
  },

  data: {
    visible:         true,
    title:          'simple surface layer',
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

  rtopo2: {
    visible:         false,
    title:          'RTOPO2 surface layer',
    type:            'cube.textured',
    rotation:        [0, Math.PI / 2, 0],
    cube: {
      type:          'globe',
      radius:        RADIUS, 
      texture:       'images/rtopo2/globe.rtopo2.FACE.4096.png', 
      material: {
        transparent: true, 
        opacity:     0.99,              // removes crazy seaice effeckt
        side:        THREE.DoubleSide,
      }
    }
  },

  gmlc: {
    visible:         false,
    title:          'GLCNMO - vegetation layer',
    type:            'cube.textured',
    rotation:        [0, Math.PI / 2, 0],
    cube: {
      type:          'globe',
      radius:        RADIUS, 
      texture:       'images/gmlc/globe.gmlc.FACE.4096.png', 
      material: {
        transparent: true, 
        opacity:     0.99,              // removes crazy seaice effeckt
        side:        THREE.DoubleSide,
      }
    }
  },

  snpp: {
    visible:         false,
    title:           'spot light',
    type:            'SNPP - satellite surface layer',
    rotation:        [0, Math.PI / 2, 0],
    cube: {
      type:          'globe',
      radius:        RADIUS - 0.002,
      texture:       'data/snpp/2017-06-13.globe.snpp.FACE.2048.jpg', 
      material: {
        transparent: true, 
        opacity:     0.99,              // removes crazy seaice effeckt
        side:        THREE.DoubleSide,
      }
    }
  },

  sst: {
    visible:        false,
    title:          'sea surface temperature',
    type:           'cube.textured',
    rotation:       [0, Math.PI / 2, 0],
    cube: {
      type:         'globe',
      radius:       RADIUS + 0.001, 
      texture:      'data/sst/2017-06-13.globe.sst.FACE.1024.png', 
      material: {
        transparent: true, 
        opacity:     0.50,              // removes crazy seaice effeckt
        side:        THREE.DoubleSide,
      }
    }
  },

  seaice: {
    visible:         false,
    title:           'AMSR2 sea ice concentration',
    type:            'cube.textured',
    rotation:        [0, Math.PI * 0.5, 0],
    cube: {
      type:          'polar',
      radius:        RADIUS + 0.002, 
      texture:       'data/amsr2/2017-06-13.polar.amsr2.FACE.1024.grey.trans.png', 
      material: {
        transparent: true, 
        opacity:     0.99,              // removes crazy seaice effeckt
        side:        THREE.DoubleSide,
      }
    }
  },

  wind: {
    visible:        false,
    title:          'GFS - wind 10m',
    type:           'simulation',
    subtype:        'multiline',
    rotation:       [0, Math.PI, 0],
    radius:         RADIUS + 0.001, 
    color:          new THREE.Color('#ff0000'),
    opacity:        0.5,
    lineWidth:      RADIUS * Math.PI / 180 * 0.2,
    section:        33 * 1/60,
    length:         60,
    amount:         512,
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
    visible:        false,
    title:          'GFS - jetstream at 300hpa',
    type:           'simulation',
    subtype:        'multiline',
    rotation:       [0, Math.PI, 0],
    radius:         RADIUS + 0.005, 
    color:          new THREE.Color('#ff0000'),
    opacity:        0.8,
    lineWidth:      RADIUS * Math.PI / 180 * 0.1,
    section:        33 * 1/60,
    length:         60,
    amount:         512,
    hue:            220,
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
    visible:        true,
    title:          'GFS - total cloud cover',
    type:           'simulation',
    rotation:       [0, Math.PI, 0],
    radius:         RADIUS + 0.005, 
    amount:         20000,
    size:           8.0,
    sim: {
      dataroot:     'data/gfs/tcdcclm/',
      patterns: [
        'YYYY-MM-DD-HH[.tcdcclm.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
      ],
      data: [
        'data/gfs/tcdcclm/2017-06-13-12.tcdcclm.10.dods',
      ],
      sectors: [
        [ 89.99, -180.0,  -89.99,  180.0 ], // all
      ],
    }
  },


};
