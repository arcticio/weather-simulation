'use strict';

// https://github.com/qkevinto/planetarium/blob/master/app/js/app.js

var SCENE = (function () {

  const TRAIL_LEN = 30;
  const TRAIL_NUM = 720;

  var 
    self,
    frame         = 0,
    loader        = new THREE.TextureLoader(),

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true }),
    // renderer      = new THREE.WebGLRenderer({antialias: true}),
    // renderer      = new THREE.WebGLRenderer(),

    camera        = CFG.Cameras.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    canvas,

    arrowHelper,

    galaxy,
    surface,
    overlay,
    sim,
    trails        = []
  ;

  return {
    
    renderer,

    boot: function () {
      return self = this;
    },
    init: function () {

      var idx, vertex;

      canvas = renderer.domElement;
      canvas.id = 'simulator';
      document.body.appendChild(canvas);
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setClearColor(0x4d4d4d, 1.0)

      self.resize();


      camera.position.copy(CFG.Cameras.perspective.pos);

      orbitControls.enabled = true;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.88;
      orbitControls.constraint.smoothZoom = true;
      orbitControls.constraint.zoomDampingFactor = 0.2;
      orbitControls.constraint.smoothZoomSpeed = 2.0;
      orbitControls.constraint.minDistance = RADIUS + 0.1;
      orbitControls.constraint.maxDistance = 8;


      var surface = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);

      for (idx in surface.vertices) {
        vertex = surface.vertices[idx];
        vertex.normalize().multiplyScalar(RADIUS);
      }

      surface.computeVertexNormals();
      // surface.computeBoundingBox();
      // surface.computeBoundingSphere();
      // surface.computeFaceNormals();
      // surface.computeFlatVertexNormals();
      // surface.computeLineDistances();
      // surface.computeMorphNormals();
      // surface.computeFlatVertexNormals();

      var cubemap = ['right', 'left', 'top', 'bottom', 'front', 'back'].map( face => {

        // var filename = 'images/snpp/earth.right.snpp.2048.jpg';
        // var filename = 'images/mask/earth.' + face + '.2048.jpg';
        var surface = 'images/mask/earth.' + face + '.2048.jpg';
        var bumpmap = 'images/topo/earth.' + face + '.topo.2048.jpg';

        return new THREE.MeshPhongMaterial( { 
          map:      loader.load( surface ),
          bumpMap:  loader.load( bumpmap ),
          bumpScale: 0.08,
          // shininess: 2,
        });

      });

      var mesh = new THREE.Mesh( surface, new THREE.MeshFaceMaterial(cubemap) );
      mesh.name = 'globe';
      scene.add( mesh );


      // surface = CFG.earth.surface.mesh;
      // surface.name = 'surface';
      // self.texturize(surface, CFG.earth.surface.textures);

      // overlay = CFG.earth.overlay.mesh;
      // overlay.name = 'overlay';
      // self.texturize(overlay, CFG.earth.overlay.textures);

      // // Galaxy
      // galaxy = CFG.Galaxy.mesh;
      // galaxy.name = 'galaxy';
      // self.texturize(galaxy, CFG.Galaxy.textures);

      // Lights
      scene.add( CFG.Lights.ambient );
      // scene.add( CFG.Lights.spot.light );
      CFG.Lights.spot.light.position.copy( CFG.Lights.spot.pos ); // lon=90

      // Extras
      self.addTrails();

      // Markers, depend on surface
      // CFG.Markers.forEach(marker => TOOLS.placeMarker(surface, marker));

      // click pointer
      arrowHelper = CFG.arrowHelper;
      arrowHelper.name = 'arrowHelper';
      scene.add( arrowHelper );

      // axes
      axes = CFG.axes,
      axes.name = 'axes';
      scene.add( axes );

      scene.add(camera);

    },
    addTrails: function (num) {

      // first lat/lon [0/0] is last of trail

      function genLons (lats, start) {
        return lats.map( (lat, idx) => idx <= 90 | idx > 270 ? start : 180 + start );
      }

      var 
        lats = Array.prototype.concat(
          H.linspace(  0,  89, 90),
          H.linspace( 90,   1, 90),
          H.linspace(  0, -89, 90),
          H.linspace(-90,  -1, 90)
        ),
        alphamap = loader.load('images/line.alpha.16.png');

      sim = new THREE.Object3D();

      H.linspace(0, 359, num).forEach(start => {

        trails.push(new Trail(lats, genLons(lats, start), TRAIL_LEN, alphamap));

      });

      trails.forEach( trail => sim.add(trail.mesh));
      sim.name = 'sim';
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
      // console.log(window.innerWidth, window.innerHeight);
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
    logInfo: function render () {

      console.log('renderer', JSON.stringify({
        trails:     TRAIL_NUM,
        length:     TRAIL_LEN,
        geometries: renderer.info.memory.geometries,
        textures:   renderer.info.memory.textures,
        calls:      renderer.info.render.calls,
        faces:      renderer.info.render.faces,
        vertices:   renderer.info.render.vertices,
      }, null, 2));

    },
    render: function render () {

      var intersection, intersections, idx = (frame + TRAIL_LEN) % 360;

      requestAnimationFrame(render);

      stats.begin();

      if (frame % 2) {

        if ( IFC.mouse.down ) {

          IFC.raycaster.setFromCamera( IFC.mouse, camera );
          intersections = IFC.raycaster.intersectObjects( scene.children ).filter( its => its.object.name === 'globe');
          intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

          if (intersection) {
            arrowHelper.setDirection( intersection.point.normalize() );
            // console.log('click', TOOLS.vector3ToLatLong(intersection.point, CFG.earth.radius));
          }

        }

        // trails.forEach(trail => trail.advance(idx));

        // trails.forEach(trail => trail.step());

        orbitControls.update();
        renderer.render(scene, camera);

      }

      stats.end();

      frame += 1;

    }
  };

}()).boot();
