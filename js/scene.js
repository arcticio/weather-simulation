'use strict';

const TRAIL_LEN = 60;
const TRAIL_NUM = 40;

var SCN = (function () {

  var 
    self,
    frame         = 0,
    time          = 0,
    // loader        = new THREE.TextureLoader(),

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    renderer      = new THREE.WebGLRenderer({
      canvas:    $$('.simulator')[0],
      // antialias: true,
      // alpha:     true 
    }),

    camera        = CFG.objects.perspective.cam,
    scene         = new THREE.Scene(),
    orbitControls = new THREE.OOrbitControls(camera, renderer.domElement),
    axes,

    doRender      = true,
    doAnimate     = true,
    doSimulate    = true,

    posArrow,

    objects        = {},

    monitor      = $$('canvas.panel.test')[0].getContext('2d'),
    expi         = $$('canvas.panel.expi')[0].getContext('2d'),

    canvas,

    arrowHelper,

    home = new THREE.Vector3(0, 0, 0),

    galaxy,
    surface,
    overlay,
    sim,

  end;

  return {
    
    expi,
    home,
    scene,
    camera,
    monitor,
    objects,
    renderer,

    boot: function () {
      return self = this;
    },
    add: function (name, obj) {
      objects[name] = obj;
      objects[name].name = name;
      scene.add(obj);
    },
    toggle: function (obj, force) {

      if (scene.getObjectByName(obj.name) || force === false) {
        scene.remove(obj);

      } else {
        if (obj instanceof THREE.Object3D){
          scene.add(obj);

        } else {
          self.loader[obj.type](obj.name, obj);

        }
      }

    },
    activate: function () {
      window.addEventListener('resize', self.resize, false);
    },
    loader: {

      'mesh.textured': (name, cfg) => {
        RES.load({type: 'texture', urls: [cfg.texture], onFinish: (err, responses) => {
          cfg.mesh.material.map = responses[0].data;
          self.add(name, cfg.mesh);
        }});
      },

      'mesh': (name, cfg) => {
        self.add(name, cfg.mesh);
      },

      'light': (name, cfg) => {
        cfg.light = cfg.light(cfg);
        cfg.pos && cfg.light.position.copy( cfg.pos ); 
        self.add(name, cfg.light);
      },

      'simulation': (name, cfg) => {
        SIM.load(name, cfg, self.add);
      },
      'cube.textured': (name, cfg) => {
        self.loadCube(name, cfg, self.add);
      },
      'camera': (name, cfg) => {

      },

    },
    init: function () {

      var idx, vertex, onload;

      canvas = renderer.domElement;
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setClearColor(0x4d4d4d, 1.0)
      renderer.shadowMap.enabled = false;

      camera.position.copy(CFG.objects.perspective.pos);

      self.resize();

      orbitControls.enabled = true;
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.88;
        orbitControls.constraint.smoothZoom = true;
        orbitControls.constraint.zoomDampingFactor = 0.2;
        orbitControls.constraint.smoothZoomSpeed = 2.0;
        orbitControls.constraint.minDistance = RADIUS + 0.1;
        orbitControls.constraint.maxDistance = 8;


      H.each(CFG.objects, (name, config) => {

        config.name = name;

        if (config.visible){
          self.loader[config.type](name, config);
        } else {
          objects[name] = config;
        }

      });

    },
    loadCube: function (name, cfg, callback) {

      var
        idx, vertex,  materials, mesh,
        geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
        urls = CFG.Faces.map( face => {

          if (cfg.cube.type === 'globe'){
            return H.replace(cfg.cube.texture, 'FACE', face);

          } else if (cfg.cube.type === 'polar') {
             return (face === 'top' || face === 'bottom') ? 
              H.replace(cfg.cube.texture, 'FACE', face) : 'images/transparent.face.512.png';
          }

        });

      // H.each(geometry.vertices, (_, vertex) => vertex.normalize().multiplyScalar(cfg.cube.radius));

      for (idx in geometry.vertices) {
        vertex = geometry.vertices[idx];
        vertex.normalize().multiplyScalar(cfg.cube.radius);
      }

      geometry.computeVertexNormals();

      RES.load({urls, type: 'texture', onFinish: function (err, responses) {

        materials = responses.map(response => {

          return new THREE.MeshPhongMaterial({ 
            map:         response.data,
            transparent: true, 
            opacity:     1.0, 
            side:        THREE.FrontSide,
            shininess:   2,
          });

        });

        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

        cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

        callback(name, mesh);

      }});

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

    actions: function (folder, option, value) {

      // console.log("GUI.change", {action, folder, option, value});

      var config = {
        Render:   { toggle: (value) => doRender   = value },
        Animate:  { toggle: (value) => doAnimate  = value },
        Simulate: { toggle: (value) => doSimulate = value },
        Ambient: {
          toggle:    (value) => self.toggle(objects.ambient, value),
          intensity: (value) => objects.ambient.intensity = value,
          color:     (value) => objects.ambient.color = new THREE.Color( value ),
        },
        Spot: {
          toggle:    (value) => self.toggle(objects.spot, value),
          intensity: (value) => objects.spot.intensity = value,
          color:     (value) => objects.spot.color = new THREE.Color( value ),
        },
        Layers : {
          'SNPP':    (value) => self.toggle(objects.snpp, value),
          'DATA':    (value) => self.toggle(objects.data, value),
          'SST':     (value) => self.toggle(objects.sst, value),
          'SEAICE':  (value) => self.toggle(objects.seaice, value),
          'TEST':    (value) => self.toggle(objects.test, value),
          'WIND':    (value) => self.toggle(objects.wind, value),
        },
        Camera: {
          reset:     (value) => camera.position.copy(CFG.objects.perspective.pos),
        },
        DateTime: {
          choose:    (value) => console.log('Date', value),
        },
        Extras: {
          Axes:      (value) => self.toggle(objects.axes, value),
          Rotate:    (value) => ANI.insert(0, ANI.library.example), 
          // Rotate:    (value) => ANI.insert(0, ANI.library.cam2latlon(51, 7, 2)), 
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
    render: function render (nTime) {

      var v3, 
        intersection, intersections, 
        idx = (frame + TRAIL_LEN) % 360,
        dTime = nTime - time;

      requestAnimationFrame(render);

      // drop first call, need dTime
      if (!nTime){return;}

      IFC.stats.begin();

        TWEEN.update();
        orbitControls.update();

        // GUI info
        posArrow && IFC.setLatLon(camera.position, posArrow);

        if (!(frame % 4)) {
          doSimulate && SIM.step(frame, dTime);
        }

        // always check actions
        doAnimate  && ANI.step(frame, dTime);

        if (!(frame % 1)) {
          doRender  && renderer.render(scene, camera);
        }

      IFC.stats.end();

      time = nTime;
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



*/








