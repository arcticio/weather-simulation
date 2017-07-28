
/*

  debuggable => appears as toggle in gui.dat
  essential  => always in scene, regardless of URL
  toggleable => sprite appears

*/

CFG.Activated = {
  pointer:    true,
  background: true,
  ambient:    true,
  atmosphere: true,
  basemaps:   7,       // 7,8,9 == 'mask', 'topo', 'gmlc'
};

CFG.Assets = {

    // click mesh for raycaster, no debug gui, always in scene
    pointer: {
      title:           'pointer',
      essential:       true,
      type:            'mesh',
      mesh:            new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS - 0.005, 32, 32),                  
        new THREE.MeshBasicMaterial({
          color:       0xff0000,
          wireframe:   false,
          transparent: true,
          opacity:     0.0
        })
      ),
    },

    background: {
      title:          'dynamic background',
      essential:      true,
      type:           'mesh.module',
      size:           4.0,
      colors: [
        0x666670,
        0x666670,
        0x222230,
        0x222230,
      ]
    },

  // LIGHTS ( 1 - 3 )

    ambient: {
      title:          'ambient light',
      essential:      true,  // TODO remove from sea ice, snpp
      debuggable:     true,
      type:           'light',
      color:          0xffffff,
      intensity:      0.1,
      light:          (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
    },

    spot:    {
      title:          'spot light',
      // essential:      true,
      debuggable:     true,
      type:           'light',
      color:          0xffffff, 
      intensity:      0.9, // no 0 here
      // distance:       0.0, 
      angle:          0.3, 
      penumbra:       0.1, 
      decay:          0.0,
      light:          (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
      pos:            new THREE.Vector3(0, 4, 0),
    },

    sun: {
      title:          'directional light',
      // essential:      true,
      debuggable:     true,
      type:           'light',
      skycolor:       0xffddaa, // reddish
      grdcolor:       0x8989c3, // blueish
      intensity:      0.4, 
      light:          (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
      pos:            new THREE.Vector3(2, 2, 2),
    },

    mask: {
      title:          'basic surface mask',
      type:           'mesh.module',
      essential:      true,                 // not in prod
      debuggable:     true,
      toggleable:     true,
      rotation:        [0, PI2, 0],
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
      index:           5,
      debuggable:      true,
      toggleable:      true,
      title:           'graticule',
      type:            'mesh.calculated',
      radius:          RADIUS + LEVEL_6,
      resolution:      10,
      material: {
        transparent:   true,
        opacity:       0.2,
        color:         0xdddddd,
        // depthWrite:    false
      }
    },

    atmosphere: {
      index:           6,
      debuggable:      true,
      toggleable:      true,
      title:           'atmosphere',
      type:            'mesh.module',
      radius:          RADIUS + LEVEL_8,
      rotation:        [0, PI2, 0],
      opacity:         0.5,
      material: {
        transparent:   true,
        opacity:       0.2,
        // depthWrite:    true
      }
    },


  // BASEMAPS ( 9 - 11 )

    basemaps: {
      ids:             [ 7,      8,      9],
      maps:            ['mask', 'topo', 'gmlc'],
      title:           'generic base maps',
      type:            'basemaps',
      debuggable:      true,
      toggleable:      true,
      rotation:        [0, PI2, 0],
      radius:          RADIUS,
      resolution:      CFG.Basemaps.resolution,
      textures:        'globe.MAP.FACE.RESO.png',
      geometry:        new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
      material: {
        transparent:   true, 
        opacity:       0.99,              // removes crazy seaice effeckt
        // side:          THREE.DoubleSide,
      },
    },

    rtopo2: {
      index:           10,
      title:           'RTOPO2 surface layer',
      type:            'cube.textured',
      debuggable:      true,
      toggleable:      true,
      rotation:        [0, PI2, 0],
      lightset:        'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + LEVEL_1, 
        texture:       'images/rtopo2/globe.rtopo2.FACE.4096.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    gmlc: {
      index:           11,
      title:           'GLCNMO - vegetation layer',
      type:            'cube.textured',
      debuggable:      true,
      toggleable:      true,
      rotation:        [0, PI2, 0],
      lightset:        'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + LEVEL_1, 
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
      index:          14,
      toggleable:     true,
      debuggable:     true,
      type:           'cube.textured',
      title:            'SNPP - satellite surface layer',
      rotation:        [0, PI2, 0],
      lightset:       'snpp',
      cube: {
        type:          'globe',
        radius:        RADIUS + LEVEL_1, 
        texture:       'data/snpp/2017-06-20.globe.snpp.FACE.2048.jpg', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },


    sst: {
      index:          15,
      title:          'sea surface temperature',
      type:           'cube.textured',
      debuggable:      true,
      toggleable:      true,
      rotation:       [0, PI2, 0],
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
      index:           16,
      debuggable:      true,
      toggleable:      true,
      title:           'AMSR2 sea ice concentration',
      type:            'cube.textured',
      rotation:        [0, PI2, 0],
      radius:          RADIUS + LEVEL_3, 
      cube: {
        type:          'polar',
        texture:       'data/amsr2/2017-06-13.polar.amsr2.FACE.1024.grey.trans.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    wind: {
      index:          17,
      debuggable:      true,
      toggleable:      true,
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
      index:          18,
      debuggable:      true,
      toggleable:      true,
      title:          'GFS - jetstream at 300hpa',
      type:           'simulation.parallel',
      worker:         'js/sim.worker.jetstream.js',
      subtype:        'multiline',
      rotation:       [0, PI, 0],
      radius:         RADIUS + LEVEL_6, 
      // color:          new THREE.Color('#ff0000'),
      opacity:        0.8,
      lineWidth:      RADIUS * PI / 180 * 0.1,
      factor:         0.0003,  // TODO: proper Math, also sync with wind10m
      section:        33 * 1/60,
      length:         60,
      amount:         512,
      hue:            220 / 255,
      material: {
                      transparent: true,
      },
      sim: {
        dataroot:     'data/gfs/',
        variable:     'ugrdprs',
        step:         [6, 'hours'],
        scaler:       d => d,        
        patterns: [
          '[ugrdprs/]YYYY-MM-DD-HH[.ugrdprs.10.dods]',
          '[vgrdprs/]YYYY-MM-DD-HH[.vgrdprs.10.dods]',
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

    // jetstreamX: {
    //   index:          18,
    //   debuggable:      true,
    //   toggleable:      true,
    //   title:          'GFS - jetstream at 300hpa',
    //   type:           'simulation',
    //   subtype:        'multiline',
    //   rotation:       [0, PI, 0],
    //   radius:         RADIUS + LEVEL_6, 
    //   // color:          new THREE.Color('#ff0000'),
    //   opacity:        0.8,
    //   lineWidth:      RADIUS * PI / 180 * 0.1,
    //   factor:         0.0003,  // TODO: proper Math, also sync with wind10m
    //   section:        33 * 1/60,
    //   length:         60,
    //   amount:         512,
    //   hue:            220 / 255,
    //   material: {
    //                   transparent: true,
    //   },
    //   sim: {
    //     dataroot:     'data/gfs/',
    //     variable:     'ugrdprs',
    //     step:         [6, 'hours'],
    //     scaler:       d => d,        
    //     patterns: [
    //       '[ugrdprs/]YYYY-MM-DD-HH[.ugrdprs.10.dods]',
    //       '[vgrdprs/]YYYY-MM-DD-HH[.vgrdprs.10.dods]',
    //     ],
    //     sectors: [
    //       [ 89.9, -180,  45.0,  180 ], // top
    //       [-45.0, -180, -89.9,  180 ], // bottom
    //       [ 45.0, -180, -45.0,  -90 ], // left back
    //       [ 45.0,  -90, -45.0,    0 ], // left front
    //       [ 45.0,    0, -45.0,   90 ], // right front
    //       [ 45.0,   90, -45.0,  180 ], // right back
    //     ],
    //   }
    // },

    clouds: {
      index:          19,
      debuggable:      true,
      toggleable:      true,
      title:          'GFS - total cloud cover',
      type:           'simulation',
      rotation:       [0, PI, 0],
      radius:         RADIUS + LEVEL_5, 
      amount:         1e5,
      factor:         1.0,
      opacity:        0.8,
      sim: {
        variable:     'tcdcclm',
        step:         [6, 'hours'],
        scaler:       d => d,
        dataroot:     'data/gfs/tcdcclm/',
        patterns: [
          'YYYY-MM-DD-HH[.tcdcclm.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
        ],
        sectors: [
          [ 89.99, -180.0,  -89.99,  180.0 ], // all
        ],
      }
    },

    tmp2m: {
      index:          20,
      debuggable:      true,
      toggleable:      true,
      title:          'GFS - air temperature at 2m',
      type:           'simulation',
      geometry:       new THREE.SphereBufferGeometry(RADIUS + LEVEL_4, 64, 32),
      rotation:       [0, PI, 0],
      radius:         RADIUS + LEVEL_4, 
      opacity:        0.5,
      sim: {
        variable:     'tmp2m',
        step:         [6, 'hours'],
        scaler:       d => H.clampScale(d, 243.15, 313.75, 0, 255),
        dataroot:     'data/gfs/tmp2m/',
        patterns: [
          'YYYY-MM-DD-HH[.tmp2m.10.dods]', 
        ],
        palette: {
          '-30' : new THREE.Color(0xaa66aa), // violet dark,
          '-20' : new THREE.Color(0xce9be5), // violet,
          '-10' : new THREE.Color(0x76cee2), // blue,
          '  0' : new THREE.Color(0x6cef6c), // green,
          '+10' : new THREE.Color(0xedf96c), // yellow,
          '+20' : new THREE.Color(0xffbb55), // orange,
          '+30' : new THREE.Color(0xfb654e), // red,
          '+40' : new THREE.Color(0xcc4040), // dark red,
          '999' : new THREE.Color(0xbb20ff), // very dark red,
        }
      }
    },

    pratesfc: {
      index:           21,
      debuggable:      true,
      toggleable:      true,
      title:           'GFS - urface precipitation rate',
      comment:         'units of kg/m^2/s, which is equivalent to mm/s.  To get 6-hourly then, you would 6*60*60*PRATEsfc which would be 6hrs*60mins*60secs.',
      type:            'simulation',
      geometry:        new THREE.SphereBufferGeometry(RADIUS + LEVEL_4, 64, 32),
      rotation:        [0, PI, 0],
      radius:          RADIUS + LEVEL_4, 
      opacity:         0.99,
      sim: {
        variable:      'pratesfc',
        scaler:        d => H.clampScale(d, 0, 0.001, 0, 255),
        step:          [6, 'hours'],
        dataroot:      'data/gfs/pratesfc/',
        patterns: [
          'YYYY-MM-DD-HH[.pratesfc.10.dods]', 
        ],
        paletteXX: {
          '0.0001' : new THREE.Color(0xaa66aa), // violet dark,
          '0.0002' : new THREE.Color(0xce9be5), // violet,
          '0.0003' : new THREE.Color(0x76cee2), // blue,
          '0.0004' : new THREE.Color(0x6cef6c), // green,
          '0.0005' : new THREE.Color(0xedf96c), // yellow,
          '0.0006' : new THREE.Color(0xffbb55), // orange,
          '0.0007' : new THREE.Color(0xfb654e), // red,
          '0.0008' : new THREE.Color(0xcc4040), // dark red,
          '0.0010' : new THREE.Color(0xbb20ff), // very dark red,
        },
        palette: {
          '0.0001' : new THREE.Color(0x000033), // violet dark,
          '0.0002' : new THREE.Color(0x111155), // violet,
          '0.0003' : new THREE.Color(0x333377), // blue,
          '0.0004' : new THREE.Color(0x555599), // green,
          '0.0005' : new THREE.Color(0x7777bb), // yellow,
          '0.0006' : new THREE.Color(0x9999dd), // orange,
          '0.0007' : new THREE.Color(0xbbbbff), // red,
          '0.0008' : new THREE.Color(0xddddff), // dark red,
          '0.0010' : new THREE.Color(0xffffff), // very dark red,
        }
      }
    },


  // FEATURES ( 23 - 25 )

    population: {
      index:           23,
      debuggable:      true,
      toggleable:      true,  
      title:           '3000 major cities',
      type:            'mesh.module',
      radius:          RADIUS + LEVEL_0,
      color:           new THREE.Color(0xff00ff),
      opacity:         0.8,
      material: {
        transparent:   true,
        blending:      THREE.AdditiveBlending,
      }
    },

    land: {
      index:           24,
      debuggable:      true,
      toggleable:      false,
      title:          'geojson land',
      radius:         RADIUS + LEVEL_3,
      type:           'geo.json',
      rotation:       [0, PI2, 0],
      json:           'data/json/countries_states.geojson',
      color:          new THREE.Color('#888888'),
    },

    rivers: {
      index:           25,
      debuggable:      true,
      toggleable:      false,
      title:          'geojson rivers',
      type:           'geo.json',
      radius:         RADIUS + LEVEL_3,
      rotation:       [0, PI2, 0],
      json:           'data/json/rivers.geojson',
      color:          new THREE.Color('#888888'),
    },



  // OPTIONAL / DEV ( 26 - 28 )

    sector: {
      index:          27,
      title:          'sector marker',
      debuggable:      false,
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
      index:           28,
      debuggable:      true,
      title:          '3D axes',
      type:           'mesh',
      mesh:           new THREE.AxisHelper( RADIUS * 4 ),
    },

    // pixels: {
    //   index:           30,
    //   visible:        false,
    //   type:            'mesh.module',
    //   title:           'experiment',
    //   texture:         'tex7.jpg',
    // }
    
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
