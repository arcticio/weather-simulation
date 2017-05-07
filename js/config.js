
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
    ambient:           new THREE.AmbientLight( 0x606060 ),
    spot:    {
      light:           new THREE.SpotLight(0xffff88, 0.5, 0, 10, 2),
      pos:             new THREE.Vector3(0, 2, 0)
    } 
  },

  Cameras: {
    perspective: {
      cam:             new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
      pos:             new THREE.Vector3(0.5, 2, 0.5)
    } 
  } 

};