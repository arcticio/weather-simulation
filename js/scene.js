'use strict';

// https://github.com/qkevinto/planetarium/blob/master/app/js/app.js

// loaded after libs !!

var SCENE = (function () {

  var 
    self,
    frame = 0,
    loader = new THREE.TextureLoader(),

    renderer      = new THREE.WebGLRenderer({antialias: true}),
    camera        = CFG.Cameras.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    galaxy,
    surface,
    overlay,
    trails = []
  ;


  return {
    boot: function () {
      return self = this;
    },
    init: function () {

      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      camera.position.copy(CFG.Cameras.perspective.pos);

      orbitControls.enabled = true; //!cameraAutoRotation;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.88;
      orbitControls.constraint.smoothZoom = true;
      orbitControls.constraint.zoomDampingFactor = 0.2;
      orbitControls.constraint.smoothZoomSpeed = 5.0;
      orbitControls.constraint.minDistance = 1;
      orbitControls.constraint.maxDistance = 8;

      surface = CFG.earth.surface.mesh;
      surface.name = 'surface';
      self.texturize(surface, CFG.earth.surface.textures);

      overlay = CFG.earth.overlay.mesh;
      overlay.name = 'surface';
      self.texturize(overlay, CFG.earth.overlay.textures);

      // Galaxy
      galaxy = CFG.Galaxy.mesh;
      galaxy.name = 'galaxy';
      self.texturize(galaxy, CFG.Galaxy.textures);

      // Lights
      scene.add( CFG.Lights.ambient );
      scene.add( CFG.Lights.spot.light );
      CFG.Lights.spot.light.position.copy( CFG.Lights.spot.pos ); // lon=90

      // Extras
      self.addTrails();

      // Markers
      CFG.Markers.forEach(marker => TOOLS.placeMarker(surface, marker));

      // axes
      axes = new THREE.AxisHelper( 2 ); 
      scene.add( axes );

      scene.add(camera);

    },
    addTrails: function () {

      var lats = Array.prototype.concat(
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


    },
    activate: function () {
      window.addEventListener('load', self.resize, false);
    },
    resize: function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    texturize: function (mesh, textures) {

      H.each(textures, function (property, uri) {

        var textureLoader = new THREE.TextureLoader();

        textureLoader.crossOrigin = '';
        loader.setCrossOrigin("anonymous");
        
        textureLoader.load(uri, function (texture) {
          mesh.material[property] = texture;
          mesh.material.needsUpdate = true;
          scene.add(mesh);
        });

      });

    },
    render: function render () {

      var idx = (frame % 360);

      requestAnimationFrame(render);

      trails.forEach(trail => trail.advance(idx));

      orbitControls.update();
      renderer.render(scene, camera);

      frame += 1;

    }
  };

}()).boot();



// // var frame = 0;

// // // Scene, Camera, Renderer
// // var renderer      = new THREE.WebGLRenderer({antialias: true});
// // var scenePlanet   = new THREE.Scene();
// // var textureLoader = new THREE.TextureLoader();

// // // renderer.autoClear = false;
// // renderer.setSize(window.innerWidth, window.innerHeight);
// // document.body.appendChild(renderer.domElement);

// // var camera = CFG.Cameras.perspective.cam;
// // camera.position.copy(CFG.Cameras.perspective.pos);

// // var orbitControls = new THREE.OOrbitControls(camera, renderer.domElement);
// // orbitControls.enabled = true; //!cameraAutoRotation;
// // orbitControls.enableDamping = true;
// // orbitControls.dampingFactor = 0.88;
// // orbitControls.constraint.smoothZoom = true;
// // orbitControls.constraint.zoomDampingFactor = 0.2;
// // orbitControls.constraint.smoothZoomSpeed = 5.0;
// // orbitControls.constraint.minDistance = 1;
// // orbitControls.constraint.maxDistance = 8;


// // var textures = {
// //   map: 'images/earth.bathy.grey.jpg',
// //   bumpMap: 'images/srtm_ramp2.world.4096x2048.jpg',
// //   // specularMap: 'images/earthspec1k.jpg'
// // }

// // var sphere   = new THREE.SphereGeometry(CFG.earth.radius, 128, 128);
// // var material = new THREE.MeshPhongMaterial({
// //   bumpScale: 0.02,
// //   // specular: new THREE.Color('blue'),
// //   // shininess: 2
// // });

// // var surface = new THREE.Mesh(sphere, material);

// // var surface = CFG.earth.surface.mesh;
// // surface.name = 'surface';
// // SCENE.texturize(surface, CFG.earth.surface.textures)

// // H.each(textures, function (property, uri) {

// //   var textureLoader = new THREE.TextureLoader();

// //   textureLoader.crossOrigin = true;
// //   textureLoader.load(uri, function (texture) {
// //     material[property] = texture;
// //     material.needsUpdate = true;
// //     // surface.geometry.center();
// //   });

// // });


// // var overlay = CFG.earth.overlay.mesh;
// // overlay.name = 'surface';
// // SCENE.texturize(overlay, CFG.earth.overlay.textures)



// // Sim Layer

// // var simulation = new THREE.Mesh(
// //   new THREE.SphereGeometry(CFG.earth.radius + 0.01, 128, 128), 
// //   new THREE.MeshPhongMaterial({
// //     side:        THREE.DoubleSide,
// //     transparent: true,
// //   })
// // );

// // H.each({map: 'images/earthcloudmap.jpg', alphaMap: 'images/earthcloudmaptrans.jpg'}, (property, uri) => {

// //   var textureLoader = new THREE.TextureLoader();

// //   textureLoader.crossOrigin = true;
// //   textureLoader.load(uri, function (texture) {
// //     simulation.material[property] = texture;
// //     simulation.material.needsUpdate = true;
// //     // simulation.geometry.center();
// //   });

// // });

// // simulation.name ="simulation";

// // scenePlanet.add( simulation);

// // scenePlanet.add( CFG.Lights.ambient );
// // scenePlanet.add( CFG.Lights.spot.light );
// // CFG.Lights.spot.light.position.copy(CFG.Lights.spot.pos); // lon=90

// // scenePlanet.add(camera);
// // scenePlanet.add(surface);


// // Galaxy
// var galaxy = CFG.Galaxy.mesh;
// textureLoader.load(CFG.Galaxy.texture, function (texture) {
//   galaxy.material.map = texture;
//   scenePlanet.add(galaxy);
// });


// // Markers
// CFG.Markers.forEach(marker => TOOLS.placeMarker(surface, marker));

// // Mesh Configurations
// // earth.receiveShadow = true;
// // earth.castShadow = true;
// // earth.getObjectByName('surface').geometry.center();

// // On window resize, adjust camera aspect ratio and renderer size
// window.addEventListener('resize', function () {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });


// // Trails

// var trails = [];

// var lats = Array.concat(
//   H.linspace(  0,  89, 90),
//   H.linspace( 90,   1, 90),
//   H.linspace(  0, -89, 90),
//   H.linspace(-90,  -1, 90)
// );
// var lons = lats.map( (lat, idx) => idx < 90 | idx > 270 ? 0 : 180 );

// var sim = new THREE.Object3D();
// trails.push(new Trail(lats, lons));
// trails.forEach( trail => sim.add(trail.mesh));
// scenePlanet.add( sim );



// // axes
// var axes = new THREE.AxisHelper( 2 ); // this will be on top
// scenePlanet.add( axes );


// // Main render function
// var render = function render() {

//   requestAnimationFrame(render);

//   frame += 1;

//   var idx = (frame % 360);

//   trails.forEach(trail => trail.advance(idx));

//   orbitControls.update();

//   // renderer.clear();
//   // renderer.render( scenePlanet, camera );
//   // renderer.render( sceneSim, camera );

//   renderer.render(scenePlanet, camera);

// };

// render();
