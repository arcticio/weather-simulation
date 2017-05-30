'use strict';

const TRAIL_LEN = 60;
const TRAIL_NUM = 100;

var SCN = (function () {

  var 
    self,
    frame         = 0,
    time          = 0,

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    canvas       =    $$('.simulator')[0],

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha:     true,
    }),

    camera        = CFG.objects.perspective.cam,
    scene         = new THREE.Scene(),
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

    timerange = new TimeRange(),

  end;

  return {
    
    expi,
    home,
    scene,
    camera,
    canvas,
    monitor,
    objects,
    renderer,
    timerange,

    boot:     function () { return self = this; },
    activate: function () { window.addEventListener('resize', self.resize, false); },
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
    resize: function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.width  = window.innerWidth  + 'px';
      renderer.domElement.style.height = window.innerHeight + 'px';
      renderer.domElement.width        = window.innerWidth;
      renderer.domElement.height       = window.innerHeight;
      camera.aspect                    = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      // console.log(window.innerWidth, window.innerHeight);
    },
    init: function () {

      var idx, vertex, onload;

      canvas = renderer.domElement;
      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      renderer.setSize(window.innerWidth, window.innerHeight);
      // webgl.min_capability_mode
      renderer.setClearColor(0x000000, 0.0);
      renderer.shadowMap.enabled = false;

      camera.position.copy(CFG.objects.perspective.pos);

      self.resize();

      timerange.push(dataTimeRanges['3d-simulation'][0]);
      console.log(timerange.latest());


      H.each(CFG.objects, (name, config) => {

        config.name = name;

        if (config.visible){
          self.loader[config.type](name, config);
        } else {
          objects[name] = config;
        }

      });

    },
    loader: {

      // TODO: here async tasks

      'mesh.textured': (name, cfg) => {
        RES.load({type: 'texture', urls: [cfg.texture], onFinish: (err, responses) => {
          cfg.mesh.material.map = responses[0].data;
          self.add(name, cfg.mesh);
        }});
      },

      'mesh': (name, cfg) => {
        self.add(name, cfg.mesh);
      },

      'geo.json': (name, cfg) => {

        RES.load({type: 'text', urls: [cfg.json], onFinish: (err, responses) => {

          var obj = new THREE.Object3D();
          var json = JSON.parse(responses[0].data);

          drawThreeGeo(json, cfg.radius, 'sphere', {
            color: cfg.color, 
            lights: true, // grrrr
          }, obj); 

          cfg.rotation && obj.rotation.fromArray(cfg.rotation);

          self.add(name, obj);

        }});

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

      for (idx in geometry.vertices) {
        vertex = geometry.vertices[idx];
        vertex.normalize().multiplyScalar(cfg.cube.radius);
      }

      geometry.computeVertexNormals();

      RES.load({urls, type: 'texture', onFinish: function (err, responses) {

        materials = responses.map(response => {

          return new THREE.MeshPhongMaterial(Object.assign({ 
            map:         response.data,
            shininess:   0,
            alphaTest: 0.5,
          }), cfg.material);

        });

        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

        cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

        callback(name, mesh);

      }});

    },

    actions: function (folder, option, value) {

      var
        ignore = () => {},
        config = {
          Loading:  { update: ignore},
          SimTime:  { update: ignore},
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
            angle:     (value) => objects.spot.angle = value,
            intensity: (value) => objects.spot.intensity = value,
            color:     (value) => objects.spot.color = new THREE.Color( value ),
          },
          Sun: {
            toggle:    (value) => self.toggle(objects.sun, value),
            intensity: (value) => objects.sun.intensity = value,
            skycolor:  (value) => {objects.sun.color = new THREE.Color( value ); console.log(value)},
            grdcolor:  (value) => objects.sun.groundColor = new THREE.Color( value ),
          },
          Layers : {
            'SNPP':    (value) => self.toggle(objects.snpp, value),
            'DATA':    (value) => self.toggle(objects.data, value),
            'SST':     (value) => self.toggle(objects.sst, value),
            'SEAICE':  (value) => self.toggle(objects.seaice, value),
            'TEST':    (value) => self.toggle(objects.test, value),
            'WIND':    (value) => self.toggle(objects.wind, value),
            'LAND':    (value) => self.toggle(objects.land, value),
            'RIVERS':  (value) => self.toggle(objects.rivers, value),
          },
          Camera: {
            reset:     (value) => camera.position.copy(CFG.objects.perspective.pos),
          },
          DateTime: {
            choose:    (value) => SIM.updateDatetime(value),
            hourn1:     (value) => SIM.updateDatetime('-1'),
            hour1:     (value) => SIM.updateDatetime('+1'),
            hour24:    (value) => SIM.updateDatetime('+24'),
            hourn24:    (value) => SIM.updateDatetime('-24'),
            day30:     (value) => SIM.updateDatetime('+' + 24*30),
            dayn30:    (value) => SIM.updateDatetime('-' + 24*30),
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
        },
      end;

      try {
        if ( config[folder] && config[folder][option] ) {
          config[folder][option](value);
        } else {
          console.log('SCN.actions.ignored', folder, option, value);
        }
      } catch (e) {console.log("SCN.actions.error", folder, option, value, e)} 

    },
    logInfo: function render () {

      console.log('renderer', JSON.stringify({

        trails:                 TRAIL_NUM,
        length:                 TRAIL_LEN,
        children:               scene.children.length,
        geometries:             renderer.info.memory.geometries,
        calls:                  renderer.info.render.calls,
        textures:               renderer.info.memory.textures,
        faces:                  renderer.info.render.faces,
        vertices:               renderer.info.render.vertices,
        maxAttributes :         renderer.capabilities.maxAttributes,
        maxTextures :           renderer.capabilities.maxTextures,
        maxVaryings :           renderer.capabilities.maxVaryings,
        maxVertexUniforms :     renderer.capabilities.maxVertexUniforms, // this limits multiline amount
        floatFragmentTextures : renderer.capabilities.floatFragmentTextures,
        floatVertexTextures :   renderer.capabilities.floatVertexTextures,
        getMaxAnisotropy :      renderer.capabilities.getMaxAnisotropy,
        capabilities:           canvas.getContext('webgl').getSupportedExtensions(),

      }, null, 2));

    },
    render: function render (nTime) {

      var dTime = nTime - time;

      requestAnimationFrame(render);

      // drop first call, need dTime
      if (!nTime){return;}

      IFC.stats.begin();

        IFC.step();

        if (!(frame % 1)) {
          doSimulate && SIM.step(frame, dTime);
        }

        // always check actions
        doAnimate  && ANI.step(frame, dTime);

        if (!(frame % 1)) {
          doRender  && renderer.render(scene, camera);
        }

      IFC.stats.end();

      time   = nTime;
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








