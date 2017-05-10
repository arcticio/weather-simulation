'use strict';

// https://github.com/qkevinto/planetarium/blob/master/app/js/app.js

// loaded after libs !!

var SCENE = (function () {


  const TRAIL_LEN = 45;

  var 
    self,
    frame         = 0,
    loader        = new THREE.TextureLoader(),

    // renderer      = new THREE.WebGLRenderer({antialias: true}),
    renderer      = new THREE.WebGLRenderer(),
    camera        = CFG.Cameras.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    galaxy,
    surface,
    overlay,
    sim,
    trails        = []
  ;

  return {
    boot: function () {
      return self = this;
    },
    init: function () {

      document.body.appendChild(renderer.domElement);

      self.resize();

      // renderer.setSize(window.innerWidth, window.innerHeight);

      // renderer.domElement.style.width  = window.innerWidth  + 'px';
      // renderer.domElement.style.height = window.innerHeight + 'px';

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

      // overlay = CFG.earth.overlay.mesh;
      // overlay.name = 'overlay';
      // self.texturize(overlay, CFG.earth.overlay.textures);

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

      // first lat/lon [0/0] is last of trail

      function genLons (lats, start) {
        return lats.map( (lat, idx) => idx < 90 | idx > 270 ? start : 180 + start );
      }

      var 
        lats = Array.prototype.concat(
          H.linspace(  0,  89, 90),
          H.linspace( 90,   1, 90),
          H.linspace(  0, -89, 90),
          H.linspace(-90,  -1, 90)
        );

      sim = new THREE.Object3D();

      H.linspace(0, 359, 360).forEach(start => {

        trails.push(new Trail(lats, genLons(lats, start), TRAIL_LEN));

      });

      trails.forEach( trail => sim.add(trail.mesh));
      scene.add( sim );

    },
    activate: function () {
      window.addEventListener('resize', self.resize, false);
    },
    resize: function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.width  = window.innerWidth  + 'px';
      renderer.domElement.style.height = window.innerHeight + 'px';
      renderer.domElement.width        = window.innerWidth;
      renderer.domElement.height       = window.innerHeight;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      console.log(window.innerWidth, window.innerHeight);
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

      var idx = (frame + TRAIL_LEN) % 360;

      requestAnimationFrame(render);

      stats.begin();

        trails.forEach(trail => trail.advance(idx));

        orbitControls.update();
        renderer.render(scene, camera);

      stats.end();

      frame += 1;

    }
  };

}()).boot();
