
'use strict'

CFG.Objects = {

// MANDATORY => (no id)

    // click mesh for raycaster
    pointer: {
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

    background: {
      title:          'dynamic background',
      type:           'mesh.module',
      size:           4.0,
      colors: [
        0x666666,
        0x666666,
        0x222222,
        0x222222,
      ]
    },

  // LIGHTS ( 1 - 3 )

    ambient: {
      title:          'ambient light',
      type:           'light',
      color:          0xffffff,
      intensity:      0.1,
      light:          (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
    },

    spot:    {
      title:          'spot light',
      type:           'light',
      color:          0xffffff, 
      intensity:      0.9, // no 0 here
      distance:       0.0, 
      angle:          0.3, 
      penumbra:       0.1, 
      decay:          0.0,
      light:          (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
      pos:            new THREE.Vector3(0, 4, 0),
    },

    sun: {
      title:          'directional light',
      type:           'light',
      skycolor:       0xffddaa, // reddish
      grdcolor:       0x8989c3, // blueish
      intensity:      0.4, 
      light:          (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
      pos:            new THREE.Vector3(2, 2, 2),
    },

    basemaps: {
      title:          'basic surface mask',
      type:           'mesh.module',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS, 
        // texture:       'images/data/globe.data.FACE.4096.comp.png', 
        texture:       'images/data/globe.data.FACE.512.comp.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

// OPTIONALS

  // VISUALS ( 5 - 6 )

    graticule: {
      id:             5,
      visible:        false,
      title:          'graticule',
      type:           'mesh.calculated',
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

    atmosphere: {
      id:             6,
      visible:        false,
      title:          'atmosphere',
      type:           'mesh.module',
      radius:         RADIUS + LEVEL_7,
      rotation:       [0, Math.PI * 0.5, 0],
      opacity:        0.5,
    },


  // BASEMAPS ( 9 - 11 )

    basecopy: {
      id:              9,
      visible:         false,
      title:          'simple surface layer',
      type:           'mesh.module',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/gmlc/globe.gmlc.FACE.512.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    rtopo2: {
      id:              10,
      visible:         false,
      title:          'RTOPO2 surface layer',
      type:            'cube.textured',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/rtopo2/globe.rtopo2.FACE.4096.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    gmlc: {
      id:             11,
      visible:         false,
      title:          'GLCNMO - vegetation layer',
      type:            'cube.textured',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/gmlc/globe.gmlc.FACE.4096.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },


  // OBSERVATIONS ( 14 - 20 )

    snpp: {
      id:             14,
      visible:         false,
      type:           'cube.textured',
      title:            'SNPP - satellite surface layer',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'snpp',
      cube: {
        type:          'globe',
        radius:        RADIUS + LEVEL_1, 
        texture:       'data/snpp/2017-06-15.globe.snpp.FACE.2048.jpg', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },


    sst: {
      id:             15,
      visible:        false,
      title:          'sea surface temperature',
      type:           'cube.textured',
      rotation:       [0, Math.PI / 2, 0],
      cube: {
        type:         'globe',
        radius:       RADIUS + LEVEL_2, 
        texture:      'data/sst/2017-06-13.globe.sst.FACE.1024.png', 
        material: {
          transparent: true, 
          opacity:     0.50,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    seaice: {
      id:              16,
      visible:         false,
      title:           'AMSR2 sea ice concentration',
      type:            'cube.textured',
      rotation:        [0, Math.PI * 0.5, 0],
      cube: {
        type:          'polar',
        radius:        RADIUS + LEVEL_3, 
        texture:       'data/amsr2/2017-06-13.polar.amsr2.FACE.1024.grey.trans.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    wind: {
      id:             17,
      visible:        false,
      title:          'GFS - wind 10m',
      type:           'simulation',
      subtype:        'multiline',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_4, 
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
      id:             18,
      visible:        false,
      title:          'GFS - jetstream at 300hpa',
      type:           'simulation',
      subtype:        'multiline',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_6, 
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
      id:             19,
      visible:        false,
      title:          'GFS - total cloud cover',
      type:           'simulation',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_5, 
      amount:         1e5,
      size:           8.0,
      sim: {
        dataroot:     'data/gfs/tcdcclm/',
        patterns: [
          'YYYY-MM-DD-HH[.tcdcclm.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
        ],
        sectors: [
          [ 89.99, -180.0,  -89.99,  180.0 ], // all
        ],
      }
    },

    variables: {
      id:             20,
      visible:        false,
      title:          'GFS - generic layer',
      type:           'simulation',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_4, 
      sim: {
        dataroot:     'data/gfs/tmp2m/',
        patterns: [
          'YYYY-MM-DD-HH[.tmp2m.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
        ],
      }
    },


  // FEATURES ( 23 - 25 )

    land: {
      id:             23,
      visible:        false,
      title:          'geojson land',
      radius:         RADIUS + LEVEL_3,
      type:           'geo.json',
      rotation:       [0, Math.PI / 2, 0],
      json:           'data/json/countries_states.geojson',
      color:          new THREE.Color('#888888'),
    },

    rivers: {
      id:             24,
      visible:        false,
      title:          'geojson rivers',
      type:           'geo.json',
      radius:         RADIUS + LEVEL_3,
      rotation:       [0, Math.PI / 2, 0],
      json:           'data/json/rivers.geojson',
      color:          new THREE.Color('#888888'),
    },

    population: {
      id:             25,
      visible:        false,
      title:          '3000 cities',
      type:           'mesh.module',
      altitude:       LEVEL_0,
      opacity:        0.8,
      radius:         RADIUS,
      ucolor:         new THREE.Color(0xffffff),
    },


  // OPTIONAL / DEV ( 26 - 28 )

    sector: {
      id:             27,
      visible:        false,
      title:          'sector marker',
      type:           'mesh.calculated',
      altitude:       LEVEL_6,
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

    axes: {
      id:             28,
      visible:        false,
      title:          '3D axes',
      type:           'mesh',
      mesh:           new THREE.AxisHelper( RADIUS * 4 ),
    },

    pixels: {
      id:              30,
      visible:        false,
      type:            'mesh.module',
      title:           'experiment',
      texture:         'tex7.jpg',
    }
    
    // // lat lon pointer of click marker
    // arrowHelper: {
    //   visible:        false,
    //   title:          'arrow helper',
    //   type:           'mesh',
    //   mesh:           new THREE.ArrowHelper( 
    //                   new THREE.Vector3( 1, 1,  1), 
    //                   new THREE.Vector3( 0, 0,  0), 
    //                   RADIUS + 0.08, 
    //                   0xffff00
    //   )
    // },

    // sunPointer: {
    //   // sun dir pointer
    //   visible:        false,
    //   title:          'sun pointer',
    //   type:           'mesh',
    //   mesh:           new THREE.ArrowHelper( 
    //                     new THREE.Vector3( 1, 1,  1), 
    //                     new THREE.Vector3( 0,  0,  0), 
    //                     RADIUS + 0.2, 
    //                     0xff0000
    //   )
    // },

};
