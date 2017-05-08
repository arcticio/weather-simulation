
var CFG = {

  earth: {
    radius: 0.5,
    surface: {
      size: 0.5,
      material: {
        bumpScale:     0.02,
        specular:      new THREE.Color('grey'),
        shininess:     2
      },
      textures: {
        map:           'images/earth.bathy.grey.jpg',
        bumpMap:       'images/srtm_ramp2.world.4096x2048.jpg',
        specularMap:   'images/earthspec1k.jpg'
      }
    },
    atmosphere: {
      size: 0.003,
      material: {
        opacity: 0.8
      },
      textures: {
        map:           'images/earthcloudmap.jpg',
        alphaMap:      'images/earthcloudmaptrans.jpg'
      },
      glow: {
        size: 0.02,
        intensity: 0.7,
        fade: 7,
        color: 0x93cfef
      }
    }
  },

  Galaxy: {
    texture: 'images/starfield.png',
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(100, 32, 32),                  // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
      new THREE.MeshBasicMaterial({side: THREE.BackSide})
    )
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
    ambient:           new THREE.AmbientLight( 0xffffff, 0.2 ),
    spot:    {
      light:           new THREE.SpotLight(0xffffff, 0.5, 0, 0.18, 1.8),
      pos:             new THREE.Vector3(0, 2, 0)
    } 
  },

  Cameras: {
    perspective: {
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      pos:             new THREE.Vector3(0.5, 1.5, 0.5), // Greenland centered
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