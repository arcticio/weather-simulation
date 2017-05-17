
const 
  RADIUS = 1.0,
  DISTANCE_OVERLAY  = 0.01,
  DISTANCE_TRAILS = 0.03
;

var CFG = {

  Faces: ['right', 'left', 'top', 'bottom', 'front', 'back'],

  earth: {

    radius: RADIUS,
    radiusOverlay: RADIUS + 0.1,

    surface: {

      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 128, 128),                  
        new THREE.MeshPhongMaterial({
          bumpScale: 0.02,
        })
      ),
      textures: {
        map:           'images/earth.bathy.grey.jpg',
        bumpMap:       'images/srtm_ramp2.world.4096x2048.jpg',
        // specularMap:   'images/earthspec1k.jpg'
      }
    },

    overlay:  {
      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + DISTANCE_OVERLAY, 128, 128), 
        new THREE.MeshPhongMaterial({
          side:        THREE.FrontSide, //THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        })
      ),
      textures: {
        map:      'images/earthcloudmap.jpg', 
        alphaMap: 'images/earthcloudmaptrans.jpg'
      }
    },

    seaice: {

    }

  },

  Galaxy: {
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(100, 32, 32),                  // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
      new THREE.MeshBasicMaterial({side: THREE.BackSide})
    ),
    textures: {
      map: 'images/starfield.png'
    },
  },

  orbitControls: {
    enableDamping:       true,
    dampingFactor:       0.88,
    constraint: {
      smoothZoom:        true,
      smoothZoomSpeed:   5.0,
      zoomDampingFactor: 0.2,
      minDistance:       1,
      maxDistance:       8
    }
  },

  Markers: [{
      label:          'North Pole',
      latitude:        90,
      longitude:       0,
      radius:          0.5,
      height:          0,
      size:            0.01,
      color:           0xff0000
    }
  ],

  Lights: {
    ambient:           new THREE.AmbientLight( 0xffffff, 0.4 ),
    spot:    {
      light:           new THREE.SpotLight(0xffffff, 0.5, 0, 0.6, 0.1),
      pos:             new THREE.Vector3(0, 2, 0)
    } 
  },

  Cameras: {
    perspective: {
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      pos:             new THREE.Vector3(0.5, 3.4, 0.5), // Greenland centered
    } 
  },

  axes: new THREE.AxisHelper( RADIUS * 4 ),

  arrowHelper: new THREE.ArrowHelper( 
    new THREE.Vector3( 1, 1,  1), 
    new THREE.Vector3( 0,  0,  0), 
    RADIUS + 0.08, 
    0xffff00
  ),

  preset: {

  },


  'gui.dat' : {
    Loading: 0,
    Render: true,
    Camera: {
      isFolder: true,
      reset: function () {console.log('click.reset')},
    },
    Ambient: {
      isFolder: true,
      toggle: true,
      intensity: {val: 0.5, min: 0, max: 1},
      color: '#ffffff'
    },
    Directional: {
      isFolder: true,
      toggle: false,
      intensity: {val: 0.5, min: 0, max: 1},
      color: '#ffffff'
    },
    Spot: {
      isFolder: true,
      toggle: true,
      intensity: {val: 0.5, min: 0, max: 1},
      color: '#ffffff'
    },
    Layers: {
      isFolder: true,
      'SNPP':   true,
      'DATA':   true,
      'SST':    true,
      'SEAICE': true,
    },
    DateTime : {
      isFolder: true,
      choose: {val: 0.5, min: 0, max: 1},
    }
  }

};

/*

SpotLight( color, intensity, distance, angle, penumbra, decay )

  color - (optional) hexadecimal color of the light. Default is 0xffffff (white).
  intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

  distance - Maximum distance from origin where light will shine whose intensity is attenuated linearly based on distance from origin.
  angle - Maximum angle of light dispersion from its direction whose upper bound is Math.PI/2.
  penumbra - Percent of the spotlight cone that is attenuated due to penumbra. Takes values between zero and 1. Default is zero.
  decay - The amount the light dims along the distance of the light.


AmbientLight( color, intensity )

  color — Numeric value of the RGB component of the color.
  intensity -- Numeric value of the light's strength/intensity.



*/