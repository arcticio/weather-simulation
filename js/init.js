'use strict';

var SCENE = (function () {

  var 
    self,
    renderer,
    camera,

    frame

    ;


  return {
    boot: function () {
      return self = this;
    },
    init: function () {
      
    },
    activate: function () {
      window.addEventListener(self.resize);
    },
    resize: function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    render: function () {

    }
  };

}()).boot();



var frame = 0;

// Scene, Camera, Renderer
var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var textureLoader = new THREE.TextureLoader();


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = CFG.Cameras.perspective.cam;
camera.position.copy(CFG.Cameras.perspective.pos);

var orbitControls = new THREE.OOrbitControls(camera, renderer.domElement);
orbitControls.enabled = true; //!cameraAutoRotation;
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.88;
orbitControls.constraint.smoothZoom = true;
orbitControls.constraint.zoomDampingFactor = 0.2;
orbitControls.constraint.smoothZoomSpeed = 5.0;
orbitControls.constraint.minDistance = 1;
orbitControls.constraint.maxDistance = 8;
orbitControls.enabled = true;


// Planet Proto
var planetProto = {
  sphere: function sphere(size) {
    var sphere = new THREE.SphereGeometry(size, 32, 32);

    return sphere;
  },
  material: function material(options) {
    var material = new THREE.MeshPhongMaterial();
    if (options) {
      for (var property in options) {
        material[property] = options[property];
      }
    }

    return material;
  },
  glowMaterial: function glowMaterial(intensity, fade, color) {
    // Custom glow shader from https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
    var glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'c': {
          type: 'f',
          value: intensity
        },
        'p': {
          type: 'f',
          value: fade
        },
        glowColor: {
          type: 'c',
          value: new THREE.Color(color)
        },
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: '\n        uniform vec3 viewVector;\n        uniform float c;\n        uniform float p;\n        varying float intensity;\n        void main() {\n          vec3 vNormal = normalize( normalMatrix * normal );\n          vec3 vNormel = normalize( normalMatrix * viewVector );\n          intensity = pow( c - dot(vNormal, vNormel), p );\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n        }',

      fragmentShader: '\n        uniform vec3 glowColor;\n        varying float intensity;\n        void main() \n        {\n          vec3 glow = glowColor * intensity;\n          gl_FragColor = vec4( glow, 1.0 );\n        }',

      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    return glowMaterial;
  },
  texture: function texture(material, property, uri) {
    var textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = true;
    textureLoader.load(uri, function (texture) {
      material[property] = texture;
      material.needsUpdate = true;
    });
  }
};

var createPlanet = function createPlanet(options) {

  // Create the planet's Surface
  var surfaceGeometry = planetProto.sphere(options.surface.size);
  var surfaceMaterial = planetProto.material(options.surface.material);
  var surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

  // Create the planet's Atmosphere
  var atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
  var atmosphereMaterialDefaults = {
    side: THREE.DoubleSide,
    transparent: true
  };

  var atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  var atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
  var atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  // Create the planet's Atmospheric glow
  var atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  var atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  var atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

  // Nest the planet's Surface and Atmosphere into a planet object
  var planet = new THREE.Object3D();

  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';

  planet.add(surface);
  planet.add(atmosphere);
  // planet.add(atmosphericGlow);

  // Load the Surface's textures
  for (var textureProperty in options.surface.textures) {
    planetProto.texture(surfaceMaterial, textureProperty, options.surface.textures[textureProperty]);
  }

  // Load the Atmosphere's texture
  for (var textureProperty in options.atmosphere.textures) {
    planetProto.texture(atmosphereMaterial, textureProperty, options.atmosphere.textures[textureProperty]);
  }

  return planet;

};

var earth = createPlanet({
  surface: {
    size: 0.5,
    material: {
      bumpScale: 0.02,
      specular: new THREE.Color('grey'),
      // shininess: 10
      shininess: 2
    },
    textures: {
      // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg',
      // bumpMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg',
      // specularMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg'
      // map: 'images/earthmap1k.jpg',
      // map: 'images/bathymetry.4096.jpg',
      map: 'images/earth.bathy.grey.jpg',
      // bumpMap: 'images/earthbump1k.jpg',
      bumpMap: 'images/srtm_ramp2.world.4096x2048.jpg',
      specularMap: 'images/earthspec1k.jpg'
    }
  },
  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.8
    },
    textures: {
      map: 'images/earthcloudmap.jpg',
      alphaMap: 'images/earthcloudmaptrans.jpg'
    },
    glow: {
      size: 0.02,
      intensity: 0.7,
      fade: 7,
      color: 0x93cfef
    }
  }
});


scene.add( CFG.Lights.ambient );
scene.add( CFG.Lights.spot.light );
CFG.Lights.spot.light.position.copy(CFG.Lights.spot.pos); // lon=90

scene.add(camera);
scene.add(earth);


// Galaxy
var galaxy = CFG.Galaxy.mesh;
textureLoader.load(CFG.Galaxy.texture, function (texture) {
  galaxy.material.map = texture;
  scene.add(galaxy);
});


// Markers
CFG.Markers.forEach(marker => TOOLS.placeMarker(earth.getObjectByName('surface'), marker));



// Mesh Configurations
// earth.receiveShadow = true;
// earth.castShadow = true;
earth.getObjectByName('surface').geometry.center();

// On window resize, adjust camera aspect ratio and renderer size
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Trails

var trails = [];



var lats = Array.concat(
  H.linspace(  0,  89, 90),
  H.linspace( 90,   1, 90),
  H.linspace(  0, -89, 90),
  H.linspace(-90,  -1, 90)
);
var lons = lats.map( (lat, idx) => idx < 90 | idx > 270 ? 0 : 180 );

var sim = new THREE.Object3D();
trails.push(new Trail(lats, lons));
trails.forEach( trail => sim.add(trail.mesh));
scene.add( sim );


// Main render function
var render = function render() {

  frame += 1;

  var idx = (frame % 360);

  trails.forEach(trail => trail.advance(idx));

  orbitControls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(render);

};

render();
