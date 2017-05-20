'use strict';

// https://github.com/qkevinto/planetarium/blob/master/app/js/app.js

var SCENE = (function () {

  const TRAIL_LEN = 30;
  const TRAIL_NUM = 720;

  var 
    self,
    frame         = 0,
    loader        = new THREE.TextureLoader(),

    // renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true }),
    // renderer      = new THREE.WebGLRenderer({antialias: true}),
    renderer      = new THREE.WebGLRenderer(),

    camera        = CFG.Cameras.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    doRender      = true,
    doAnimate     = true,

    meshes        = {},
    lights        = {},

    canvas,

    arrowHelper,

    galaxy,
    surface,
    overlay,
    sim,
    trails        = []
  ;

  return {
    
    scene,
    loader,
    camera,
    renderer,

    boot: function () {
      return self = this;
    },
    add: function (name, mesh) {
      meshes[name] = mesh;
      meshes[name].name = name;
      scene.add(mesh);
    },
    init: function () {

      var idx, vertex;

      canvas = renderer.domElement;
      canvas.id = 'simulator';
      document.body.appendChild(canvas);
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setClearColor(0x4d4d4d, 1.0)
      renderer.shadowMap.enabled = false;

      camera.position.copy(CFG.Cameras.perspective.pos);
      self.resize();

      orbitControls.enabled = true;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.88;
      orbitControls.constraint.smoothZoom = true;
      orbitControls.constraint.zoomDampingFactor = 0.2;
      orbitControls.constraint.smoothZoomSpeed = 2.0;
      orbitControls.constraint.minDistance = RADIUS + 0.1;
      orbitControls.constraint.maxDistance = 8;

      meshes.pointer = CFG.earth.pointer;
      meshes.pointer.name = 'pointer';
      scene.add(meshes.pointer);

      meshes.globe = self.createCube(
        'globe', 
        CFG.earth.radius, 
        'images/snpp/globe.snpp.FACE.2048.jpg', 
        'globe'
      );
      scene.add( meshes.globe );
      meshes.globe.visibility = false;
      
      meshes.data = self.createCube(
        'data', 
        CFG.earth.radius, 
        'images/mask/earth.FACE.2048.jpg', 
        'data'
      );
      scene.add( meshes.data );

      // meshes.sst = self.createCube(
      //   'sst', 
      //   CFG.earth.radius + 0.0005, 
      //   'images/sst/globe.sst.FACE.1024.png', 
      //   'globe'
      // );
      // scene.add( meshes.sst );

      // meshes.seaice = self.createCube(
      //   'seaice', 
      //   CFG.earth.radius + 0.001, 
      //   'images/amsr2/polar.amsr2.FACE.1024.png', 
      //   'polar'
      // );
      // scene.add( meshes.seaice );

      // // Galaxy
      // galaxy = CFG.Galaxy.mesh;
      // galaxy.name = 'galaxy';
      // self.texturize(galaxy, CFG.Galaxy.textures);

      // Lights
      lights.ambient = CFG.Lights.ambient;
      scene.add( lights.ambient );

      lights.spot = CFG.Lights.spot.light;
      lights.spot.position.copy( CFG.Lights.spot.pos ); 
      // scene.add( lights.spot );

      // Markers, depend on surface
      // CFG.Markers.forEach(marker => TOOLS.placeMarker(meshes.globe, marker));

      // click pointer
      meshes.arrowHelper = CFG.arrowHelper;
      meshes.arrowHelper.name = 'arrowHelper';
      scene.add( meshes.arrowHelper );

      // axes
      meshes.axes = CFG.axes,
      meshes.axes.name = 'axes';
      scene.add( meshes.axes );

      scene.add(camera);

    },
    createCube: function (name, radius, template, type) {

      var
        idx, vertex, mesh, cubemap, texture, material, bumpmap, shininess, 
        geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
        bumpTemplate = 'images/topo/earth.FACE.topo.2048.jpg';

      for (idx in geometry.vertices) {
        vertex = geometry.vertices[idx];
        vertex.normalize().multiplyScalar(radius);
      }

      geometry.computeVertexNormals();

      cubemap = CFG.Faces.map( face => {

        if (type === 'globe') {
          texture = H.replace(template, 'FACE', face);

        } else if (type === 'data') {
          texture = H.replace(template, 'FACE', face);
          bumpmap = H.replace(bumpTemplate, 'FACE', face);

        } else if (type === 'polar') {
          texture = (face === 'top' || face === 'bottom') ? 
            H.replace(template, 'FACE', face) : 
            'images/transparent.face.512.png';
        }

        material = { 
          map:         loader.load( texture ),
          transparent: true, 
          opacity:     1.0, 
          side:        THREE.FrontSide,
          wireframe:   false,
          // bumpMap:     bumpmap ?  : undefined,
          // bumpScale:   0.04,
          shininess:   2,

          // lights:      false,
        };

        if (bumpmap) {
          material.bumpMap   = loader.load( bumpmap );
          material.bumpScale = 0.04;
        }

        return new THREE.MeshPhongMaterial( material );

      });

      mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( cubemap ) );
      mesh.name = name;
      
      return mesh;

    },
    // addTrails: function (num) {


    //   sim.name = 'sim';
    //   scene.add( sim );

    // },
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
    actions: function (folder, option, value) {

      // console.log("GUI.change", {action, folder, option, value});

      var config = {
        Render:  {
          toggle:    (value) => doRender = value,
        },
        Ambient: {
          toggle:    (value) => value ? scene.add(lights.ambient) : scene.remove(lights.ambient),
          intensity: (value) => lights.ambient.intensity = value,
          color:     (value) => lights.ambient.color = new THREE.Color( value ),
        },
        Spot: {
          toggle:    (value) => value ? scene.add(lights.spot) : scene.remove(lights.spot),
          intensity: (value) => lights.spot.intensity = value,
          color:     (value) => lights.spot.color = new THREE.Color( value ),
        },
        Layers : {
          'SNPP':    (value) => value ? scene.add(meshes.globe)  : scene.remove(meshes.globe),
          'DATA':    (value) => value ? scene.add(meshes.data)   : scene.remove(meshes.data),
          'SST':     (value) => value ? scene.add(meshes.sst)    : scene.remove(meshes.sst),
          'SEAICE':  (value) => value ? scene.add(meshes.seaice) : scene.remove(meshes.seaice),
        },
        Camera: {
          reset:     (value) => camera.position.copy(CFG.Cameras.perspective.pos),
        },
        DateTime: {
          choose:    (value) => console.log('Date', value),
        },
        Extras: {
          Axes:      (value) => value ? scene.add(meshes.axes)   : scene.remove(meshes.axes),
        },
        Simulation: {
          start:     (value) => SIM.start(),
          stop:      (value) => SIM.stop(),
          pause:     (value) => SIM.pause(),
        }
      }

      try {
        config[folder][option](value);
      } catch (e) {console.log("NOT DEFINED", folder, option, value, e)} 

    },
    logInfo: function render () {

      console.log('renderer', JSON.stringify({
        trails:     TRAIL_NUM,
        length:     TRAIL_LEN,
        children:   scene.children.length,
        geometries: renderer.info.memory.geometries,
        calls:      renderer.info.render.calls,
        textures:   renderer.info.memory.textures,
        faces:      renderer.info.render.faces,
        vertices:   renderer.info.render.vertices,
      }, null, 2));

    },
    render: function render () {

      var intersection, intersections, idx = (frame + TRAIL_LEN) % 360;

      requestAnimationFrame(render);

      stats.begin();

      orbitControls.update();
      doAnimate && ANI.animate(frame, NaN);

      if ( IFC.mouse.down ) {

        IFC.raycaster.setFromCamera( IFC.mouse, camera );
        intersections = IFC.raycaster.intersectObjects( [meshes.pointer] );
        if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
          meshes.arrowHelper.setDirection( intersection.point.normalize() );
        }

      }

        // trails.forEach(trail => trail.advance(idx));
        trails.forEach(trail => trail.step());

      // (!(frame % 2)) && SIM.step(frame);
      SIM.step(frame);


      if (!(frame % 2)) {
        doRender  && renderer.render(scene, camera);
      }

      stats.end();

      frame += 1;

    }
  };

}()).boot();



/*

surface.computeBoundingBox();
surface.computeBoundingSphere();
surface.computeFaceNormals();
surface.computeFlatVertexNormals();
surface.computeLineDistances();
surface.computeMorphNormals();
surface.computeFlatVertexNormals();

var surface = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);

for (idx in surface.vertices) {
  vertex = surface.vertices[idx];
  vertex.normalize().multiplyScalar(RADIUS);
}

surface.computeVertexNormals();

var cubemap = ['right', 'left', 'top', 'bottom', 'front', 'back'].map( face => {

  // var filename = 'images/snpp/earth.right.snpp.2048.jpg';
  // var filename = 'images/mask/earth.' + face + '.2048.jpg';
  var surface = 'images/mask/earth.' + face + '.2048.jpg';
  var bumpmap = 'images/topo/earth.' + face + '.topo.2048.jpg';

  var surface = 'images/snpp/globe.snpp.' + face + '.2048.jpg';

  return new THREE.MeshPhongMaterial( { 
    map:      loader.load( surface ),
    // transparent:true, 
    // opacity:0.2, 
    side: THREE.FrontSide,
    // wireframe: true,
    // bumpMap:  loader.load( bumpmap ),
    // bumpScale: 0.08,
    // shininess: 2,
  });

});


*/








