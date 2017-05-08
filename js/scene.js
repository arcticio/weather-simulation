'use strict';

// https://github.com/qkevinto/planetarium/blob/master/app/js/app.js

// loaded after libs !!

var SCENE = (function () {

  var 
    self,
    frame         = 0,
    loader        = new THREE.TextureLoader(),

    renderer      = new THREE.WebGLRenderer({antialias: true}),
    camera        = CFG.Cameras.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    galaxy,
    surface,
    overlay,
    trails        = []
  ;

  return {
    boot: function () {
      return self = this;
    },
    init: function () {

      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      renderer.domElement.style.width  = '100%';
      renderer.domElement.style.height = '100%';

      camera.position.copy(CFG.Cameras.perspective.pos);

      orbitControls.enabled = true;
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
      overlay.name = 'overlay';
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
      axes = new THREE.AxisHelper( CFG.earth.radius * 4 ); 
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

        loader.load(uri, function (texture) {
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
