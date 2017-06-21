'use strict';

var SCN = (function () {

  var 
    self,
    frame         = 0,
    lastTimestamp = NaN,

    $             = document.getElementById.bind(document),
    $$            = document.querySelectorAll.bind(document),

    canvas        = $$('.simulator')[0],
    monitor       = $$('canvas.panel.test')[0].getContext('2d'),
    expi          = $$('canvas.panel.expi')[0].getContext('2d'),

    home          = new THREE.Vector3(0, 0, 0),

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias:    true,
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
    toggleRender: function (force) {
      doRender = force !== undefined ? force : !doRender;
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
      // timeouts keep GUI updated

      var 
        t0      = Date.now(),
        tasks   = [],
        counter = 1,
        info    = $$('.loader .info')[0],
        header  = $$('.loader .header')[0],
        bar     = $$('.loader .bar')[0]
      ;

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

        info.innerHTML = 'Textures';
        bar.innerHTML  = counter + '/' + tasks.length;

        setTimeout(() => {
          RES.load({type: 'texture', urls, onFinish: (err, responses) => {

            responses.forEach(replaceTx);
            TIM.step('SCN.loaded', 'textures');
            counter += 1;
            callback();

          }});
        }, 30);


      });

      // NON Sim Objects second
      H.each(CFG.Objects, (name, config) => {

        if (config.type !== 'simulation'){
          config.name = name;

          if (config.visible){
            tasks.push(function (callback) {

              info.innerHTML = config.title; //name;
              bar.innerHTML  = counter++ + '/' + tasks.length;
              
              self.loader[config.type](name, config, () => {
                setTimeout(callback, 30);
              });

            });

          } else {
            objects[name] = config;

          }
        }

      });


      // SIM Objects third
      H.each(CFG.Objects, (name, config) => {

        if (config.type === 'simulation'){
          config.name = name;

          if (config.visible){
            tasks.push(function (callback) {

              info.innerHTML = config.title; //name;
              bar.innerHTML  = counter++ + '/' + tasks.length;
              
              self.loader[config.type](name, config, () => {
                setTimeout(callback, 30);
              });

            });

          } else {
            objects[name] = config;

          }
        }

      });


      // Execute
      async.series(tasks, function (err, res) {

        if (err) {throw err} else {

          header.innerHTML   = 'Uploading to GPU...';
          info.style.display = 'none';
          bar.style.display  = 'none';

          // late hacks
          objects.pointer.visible = false;

          // finally
          setTimeout(onloaded, 30);

        }

      });

    },
    loader: {

      // TODO: here async tasks

      'simulation': (name, cfg, callback) => {
        SIM.loadModel(name, cfg, (name, obj) => {
          cfg.rotation && obj.rotation.fromArray(cfg.rotation);
          self.add(name, obj);
          callback && callback();
        });
      },

      'mesh.calculated': (name, cfg, callback) => {
        self.add(name, SCN.Meshes.calculate(name, cfg));
        callback && callback();
      },

      'mesh.textured': (name, cfg, callback) => {
        RES.load({type: 'texture', urls: [cfg.texture], onFinish: (err, responses) => {
          cfg.mesh.material.map = responses[0].data;
          self.add(name, cfg.mesh);
          callback && callback();
        }});
      },

      'mesh': (name, cfg, callback) => {
        self.add(name, cfg.mesh);
        callback && callback();
      },

      'geo.json': (name, cfg, callback) => {

        RES.load({type: 'text', urls: [cfg.json], onFinish: (err, responses) => {

          var obj  = new THREE.Object3D();
          var json = JSON.parse(responses[0].data);

          drawThreeGeo(json, cfg.radius, 'sphere', {
            color: cfg.color, 
            lights: true, // grrrr
          }, obj); 

          cfg.rotation && obj.rotation.fromArray(cfg.rotation);

          self.add(name, obj);
          callback && callback();

        }});

      },

      'light': (name, cfg, callback) => {
        cfg.light = cfg.light(cfg);
        cfg.pos && cfg.light.position.copy( cfg.pos ); 
        self.add(name, cfg.light);
        callback && callback();
      },

      'cube.textured': (name, cfg, callback) => {
        SCN.tools.loadCube(name, cfg, (name, obj) => {
          self.add(name, obj);
          callback && callback();
        });
      },

    },

    reset: {
      controller: function () {

        IFC.Controller.reset();

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
          ResetCam: { toggle: (value) => doSimulate = value },
          Ambient: {
            toggle:       (value) => self.toggle(objects.ambient, value),
            intensity:    (value) => objects.ambient.intensity = value,
            color:        (value) => objects.ambient.color = new THREE.Color( value ),
          },
          Spot: {
            toggle:       (value) => self.toggle(objects.spot, value),
            angle:        (value) => objects.spot.angle = value,
            intensity:    (value) => objects.spot.intensity = value,
            color:        (value) => objects.spot.color = new THREE.Color( value ),
          },
          Sun: {
            toggle:       (value) => self.toggle(objects.sun, value),
            intensity:    (value) => objects.sun.intensity = value,
            skycolor:     (value) => objects.sun.color = new THREE.Color( value ),
            grdcolor:     (value) => objects.sun.groundColor = new THREE.Color( value ),
          },
          Atmosphere: {
            toggle:       (value) => self.toggle(objects.atmosphere, value),
            intensity:    (value) => objects.atmosphere.update({intensity: value}),
            color:        (value) => objects.atmosphere.update({color: new THREE.Color( value )}),
          },
          Layers : {
            'BACKGROUND': (value) => self.toggle(objects.background, value),
            'CLOUDS':     (value) => self.toggle(objects.clouds, value),
            'DATA':       (value) => self.toggle(objects.data, value),
            'GMLC':       (value) => self.toggle(objects.gmlc, value),
            'GRATICULE':  (value) => self.toggle(objects.graticule, value),
            'JETSTREAM':  (value) => self.toggle(objects.jetstream, value),
            'LAND':       (value) => self.toggle(objects.land, value),
            'POPULATION': (value) => self.toggle(objects.population, value),
            'RIVERS':     (value) => self.toggle(objects.rivers, value),
            'RTOPO2':     (value) => self.toggle(objects.rtopo2, value),
            'SEAICE':     (value) => self.toggle(objects.seaice, value),
            'SECTOR':     (value) => self.toggle(objects.sector, value),
            'SNPP':       (value) => self.toggle(objects.snpp, value),
            'SST':        (value) => self.toggle(objects.sst, value),
            'WIND':       (value) => self.toggle(objects.wind, value),
            // 'TEST':       (value) => self.toggle(objects.test, value),
          },
          Camera: {
            reset:        (value) => self.reset.controller(),
          },
          DateTime: {
            choose:       (value) => SIM.setSimTime(value),
            'hour  +1':   (value) => SIM.setSimTime(  1, 'hours'),
            'hour  -1':   (value) => SIM.setSimTime( -1, 'hours'),
            'hour  +6':   (value) => SIM.setSimTime(  6, 'hours'),
            'hour  -6':   (value) => SIM.setSimTime( -6, 'hours'),
            'hour +24':   (value) => SIM.setSimTime( 24, 'hours'),
            'hour -24':   (value) => SIM.setSimTime(-24, 'hours'),
            'day  +30':   (value) => SIM.setSimTime( 30, 'days'),
            'day  -30':   (value) => SIM.setSimTime(-30, 'days'),
          },
          Extras: {
            Axes:         (value) => self.toggle(objects.axes, value),
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
        config[folder][option](value);

      } catch (e) {
        console.warn('SCN.actions.error', folder, option, value);
        console.log(e);

      } 

    },
    logInfo: function () {

      var gl = renderer.context;

      TIM.step('REN.info', 'maxVertexUniforms', renderer.capabilities.maxVertexUniforms);
      TIM.step('REN.info', 'devicePixelRatio', devicePixelRatio);
      TIM.step('REN.info', 'max_texture_size', gl.getParameter(gl.MAX_TEXTURE_SIZE));
      TIM.step('REN.info', 'max_cube_map_texture_size', gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));

    },
    logFullInfo: function () {

      // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/

      // Each uniform is aligned to 4 floats.

      // MAX_VERTEX_UNIFORM_VECTORS
      // MAX_FRAGMENT_UNIFORM_VECTORS

      var gl = renderer.context;

      console.log('MAX_VERTEX_UNIFORM_VECTORS ',  gl.getParameter('MAX_VERTEX_UNIFORM_VECTORS', gl.MAX_VERTEX_UNIFORM_VECTORS));
      console.log('MAX_FRAGMENT_UNIFORM_VECTORS', gl.getParameter('MAX_FRAGMENT_UNIFORM_VECTORS', gl.MAX_FRAGMENT_UNIFORM_VECTORS));
      console.log('MAX_TEXTURE_SIZE', gl.getParameter('MAX_TEXTURE_SIZE', gl.MAX_TEXTURE_SIZE));
      console.log('SAMPLES',          gl.getParameter(gl.SAMPLES));

      console.log('MAX_TEXTURE_SIZE', gl.getParameter(gl.MAX_TEXTURE_SIZE));
      console.log('MAX_CUBE_MAP_TEXTURE_SIZE', gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
      console.log('MAX_RENDERBUFFER_SIZE', gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));

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

      var objs = SCN.objects;

      objs.spot.visible         && objs.spot.position.copy(sunVector).multiplyScalar(10);
      objs.sun.visible          && objs.sun.position.copy(sunVector).multiplyScalar(10);
      objs.atmosphere.visible   && objs.atmosphere.update({sunPosition: sunVector});


      // SCN.objects.sunPointer.visible && SCN.objects.sunPointer.setDirection(sunVector);

    },
    render: function render () {

      var 
        timestamp = performance.now(),
        deltatsecs = (timestamp - (lastTimestamp || timestamp)) / 1000; // to secs

      requestAnimationFrame(render);

      IFC.Hud.performance.begin();

        IFC.step(frame, deltatsecs);

        if ( !(frame % 60) ) {
          // update every second
          IFC.Hud.time.render();
        }

        objects.background.visible && objects.background.updatePosition();

        if ( !(frame % 1) ) {
          doSimulate && SIM.step(frame, deltatsecs);
        }

        // always check actions
        doAnimate  && ANI.step(frame, deltatsecs);

        if ( doRender && !(frame % 1) ) {
          renderer.clear();
          renderer.render( scene, camera );
          renderer.clearDepth();
          renderer.render( IFC.Hud.scene, IFC.Hud.camera );
        }

      IFC.Hud.performance.end();

      lastTimestamp = timestamp;
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








