'use strict';

var SCN = (function () {

  var 
    self,
    frame         = 0,
    time          = 0,

    $             = document.getElementById.bind(document),
    $$            = document.querySelectorAll.bind(document),

    canvas        = $$('.simulator')[0],
    monitor       = $$('canvas.panel.test')[0].getContext('2d'),
    expi          = $$('canvas.panel.expi')[0].getContext('2d'),

    home          = new THREE.Vector3(0, 0, 0),

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias:    true,
      // alpha:        true,
    }),

    camera        = CFG.Objects.perspective.cam,
    scene         = new THREE.Scene(),
    axes,

    doRender      = true,
    doAnimate     = true,
    doSimulate    = true,

    objects       = {},

  end;

  return self = {
    
    expi,
    home,
    scene,
    camera,
    canvas,
    monitor,
    objects,
    renderer,

    activate: function () { 

    },
    add: function (name, obj) {
      objects[name] = obj;
      objects[name].name = name;
      scene.add(obj);
    },
    toggleRender: function () {
      doRender = !doRender;
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
      
    },
    init: function (callback) {

      var idx, vertex, onload;

      canvas = renderer.domElement;
      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      renderer.setSize(window.innerWidth, window.innerHeight);
      // webgl.min_capability_mode
      renderer.setClearColor(0x000000, 1.0);
      renderer.shadowMap.enabled = false;
      renderer.autoClear = false; // cause HUD

      camera.position.copy(CFG.Objects.perspective.pos);

      self.resize();
      self.logInfo();

    },
    load: function (onloaded) {

      // collects resource requests from textures, meshes, and models
      // and loads them as async series

      var tasks = [];

      function replaceTx (res) {
        H.each(CFG.Textures, (key, value) => {
          if (value === res.url) {
            CFG.Textures[key] = res.data;
          }
        });
      }

      // Textures first
      tasks.push(function (callback) {

        var urls = Object.keys(CFG.Textures).map( key => CFG.Textures[key] );

        RES.load({type: 'texture', urls, onFinish: (err, responses) => {

          responses.forEach(replaceTx);
          TIM.step('SCN.loaded', 'textures');
          callback();

        }});

      })

      // Objects second
      H.each(CFG.Objects, (name, config) => {

        config.name = name;

        if (config.visible){
          tasks.push(function (callback) {
            self.loader[config.type](name, config, () => {
              // TIM.step('SCN.loaded', name);
              callback();
            });
          });

        } else {
          objects[name] = config;

        }

      });

      // Execute
      async.series(tasks, function (err, res) {

        if (err) {throw err} else {

          // late hacks
          objects.pointer.visible = false;

          // finally
          TIM.step('SCN.loaded', 'objects');
          onloaded();

        }

      });

    },
    loader: {

      // TODO: here async tasks

      'mesh-calculate': (name, cfg, callback) => {
        self.add(name, SCN.Meshes.calculate(name, cfg));
        callback();
      },

      'mesh.textured': (name, cfg, callback) => {
        RES.load({type: 'texture', urls: [cfg.texture], onFinish: (err, responses) => {
          cfg.mesh.material.map = responses[0].data;
          self.add(name, cfg.mesh);
          callback();
        }});
      },

      'mesh': (name, cfg, callback) => {
        self.add(name, cfg.mesh);
        callback();
      },

      'geo.json': (name, cfg, callback) => {

        RES.load({type: 'text', urls: [cfg.json], onFinish: (err, responses) => {

          var obj = new THREE.Object3D();
          var json = JSON.parse(responses[0].data);

          drawThreeGeo(json, cfg.radius, 'sphere', {
            color: cfg.color, 
            lights: true, // grrrr
          }, obj); 

          cfg.rotation && obj.rotation.fromArray(cfg.rotation);

          self.add(name, obj);
          callback();

        }});

      },

      'light': (name, cfg, callback) => {
        cfg.light = cfg.light(cfg);
        cfg.pos && cfg.light.position.copy( cfg.pos ); 
        self.add(name, cfg.light);
        callback();
      },

      'simulation': (name, cfg, callback) => {
        SIM.load(name, cfg, (name, obj) => {
          cfg.rotation && obj.rotation.fromArray(cfg.rotation);
          self.add(name, obj);
          callback();
        });
      },
      'cube.textured': (name, cfg, callback) => {
        SCN.tools.loadCube(name, cfg, (name, obj) => {
          self.add(name, obj);
          callback();
        });
      },

    },

    reset: {
      controller: function () {

        IFC.controller.reset();

      }
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
            'SNPP':       (value) => self.toggle(objects.snpp, value),
            'DATA':       (value) => self.toggle(objects.data, value),
            'SST':        (value) => self.toggle(objects.sst, value),
            'SEAICE':     (value) => self.toggle(objects.seaice, value),
            'TEST':       (value) => self.toggle(objects.test, value),
            'WIND':       (value) => self.toggle(objects.wind, value),
            'JETSTREAM':  (value) => self.toggle(objects.jetstream, value),
            'LAND':       (value) => self.toggle(objects.land, value),
            'RIVERS':     (value) => self.toggle(objects.rivers, value),
            'CLOUDS':     (value) => self.toggle(objects.clouds, value),
            'RANDOM':     (value) => self.toggle(objects.randomizer, value),
            'GRATICULE':  (value) => self.toggle(objects.graticule, value),
            'SECTOR':     (value) => self.toggle(objects.sector, value),
            'POPULATION': (value) => self.toggle(objects.population, value),
            'BACKGROUND': (value) => self.toggle(objects.background, value),
          },
          Camera: {
            reset:        (value) => self.reset.controller(),
          },
          DateTime: {
            choose:       (value) => SIM.setSimTime(value),
            'hour  +1':   (value) => SIM.setSimTime(  1, 'hours'),
            'hour  -1':   (value) => SIM.setSimTime( -1, 'hours'),
            'hour  +6':   (value) => SIM.setSimTime(  4, 'hours'),
            'hour  -6':   (value) => SIM.setSimTime( -4, 'hours'),
            'hour +24':   (value) => SIM.setSimTime( 24, 'hours'),
            'hour -24':   (value) => SIM.setSimTime(-24, 'hours'),
            'day  +30':   (value) => SIM.setSimTime( 30, 'days'),
            'day  -30':   (value) => SIM.setSimTime(-30, 'days'),
          },
          Extras: {
            Axes:         (value) => self.toggle(objects.axes, value),
            ZoomOut:      (value) => ANI.insert(0, ANI.library.zoomout), 
            Rotate:       (value) => ANI.insert(0, ANI.library.datetime.add(1, 'days', 800)), 
          },
          Simulation: {
            start:        (value) => SIM.start(),
            stop:         (value) => SIM.stop(),
            pause:        (value) => SIM.pause(),
          }
        },
      end;

      try {
        if ( config[folder] && config[folder][option] ) {
          config[folder][option](value);
        } else {
          console.log('SCN.actions.ignored', folder, option, value);
        }
      } catch (e) {console.log('SCN.actions.error', folder, option, value, e)} 

    },
    logInfo: function () {

      var gl = renderer.context;

      TIM.step('REN.info', 'maxVertexUniforms', renderer.capabilities.maxVertexUniforms);
      TIM.step('REN.info', 'devicePixelRatio', devicePixelRatio);

    },
    logFullInfo: function () {

      // MAX_VERTEX_UNIFORM_VECTORS
      // MAX_FRAGMENT_UNIFORM_VECTORS

      var gl = renderer.context;

      console.log(gl.getParameter('MAX_VERTEX_UNIFORM_VECTORS', gl.MAX_VERTEX_UNIFORM_VECTORS));
      console.log(gl.getParameter('MAX_FRAGMENT_UNIFORM_VECTORS', gl.MAX_FRAGMENT_UNIFORM_VECTORS));
      console.log(gl.getParameter('MAX_TEXTURE_SIZE', gl.MAX_TEXTURE_SIZE));

      console.log('renderer', JSON.stringify({

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
    updateSun: function (sunVector) {

      SCN.objects.spot.visible       && SCN.objects.spot.position.copy(sunVector).multiplyScalar(10);
      SCN.objects.sun.visible        && SCN.objects.sun.position.copy(sunVector).multiplyScalar(10);
      SCN.objects.sunPointer.visible && SCN.objects.sunPointer.setDirection(sunVector);

    },
    render: function render (nTime) {

      var dTime = nTime - time;

      requestAnimationFrame(render);

      // drop first call, need dTime
      // if (!nTime){return;}

      // IFC.stats.begin();
      IFC.Hud.performance.begin();

        IFC.step();

        if (!(frame % 60)) {
          // update now
          IFC.Hud.time.render();
        }

        objects.background.updatePosition();
        // self.updateBackground();

        if (!(frame % 1)) {
          doSimulate && SIM.step(frame, dTime);
        }

        // always check actions
        doAnimate  && ANI.step(frame, dTime);

        if (!(frame % 1)) {
          // doRender  && renderer.render(scene, camera);
        } 

        if (doRender){
          renderer.clear();
          renderer.render( scene, camera );
          renderer.clearDepth();
          renderer.render( IFC.Hud.scene, IFC.Hud.camera );
        }

      IFC.Hud.performance.end();
      // IFC.stats.end();

      time   = nTime;
      frame += 1;

    }
  };

}());


/*

surface.computeBoundingBox();
surface.computeBoundingSphere();
surface.computeFaceNormals();
surface.computeFlatVertexNormals();
surface.computeLineDistances();
surface.computeMorphNormals();
surface.computeFlatVertexNormals();



*/








