
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
      preserveDrawingBuffer:    true,   // screenshots
    }),

    camera        = CFG.Objects.perspective.cam,
    scene         = new THREE.Scene(),

    doRender      = true,
    doAnimate     = true,
    doSimulate    = true,

    objects       = {},

  end;

  return self = {
    
    home,
    scene,
    camera,
    canvas,
    objects,
    renderer,

    toggleRender: function (force) {
      doRender = force !== undefined ? force : !doRender;
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

      IFC.Tools.updateUrl();

    },

    isActive: function (assetname) {

      var active = false;

      H.each(objects, (name, asset) => {

        if (!active && name === assetname && asset instanceof THREE.Object3D ) {
          active = true;
        }

      });

      return active;

    },

    toggleBasemap: function (basemap) {

      var mesh, basename, lightset;

      // normalize param
      if (typeof basemap === 'string'){
        basename = basemap;
        mesh = objects[basename];

      } else  {
        console.error('SCN.toggleBasemap', 'illegal basemap param');
      }

      // check edge case
      if (self.isActive(basename) && basename !== CFG.defaultBasemap) {

        // back to default
        basename = CFG.defaultBasemap;
        mesh = objects[basename];

      }

      // finally execute
      H.each(objects, (name, mesh) => {

        if (name === basename){
          self.toggle(mesh, true);

        } else if (CFG.BasemapIds.indexOf(CFG.Objects[name].id) !== -1 ) {
          self.toggle(mesh, false);

        }

      });

      lightset = CFG.Lightsets[CFG.Objects[basename].lightset];

      ANI.insert(0, ANI.library.lightset(lightset, 300));

      console.log('SCN.toggleBasemap', basename);

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

      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      // webgl.min_capability_mode

      renderer.setClearColor(0x000000, 1.0);
      renderer.shadowMap.enabled = false;
      renderer.autoClear = false;             // cause HUD

      camera.position.copy(CFG.Objects.perspective.pos);
      // camera.lookAt(scene); // why not sufficient

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

              info.innerHTML = config.title;                  //name;
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

      'mesh': (name, cfg, callback) => {
        self.add(name, cfg.mesh);
        callback && callback();
      },

      'light': (name, cfg, callback) => {
        cfg.light = cfg.light(cfg);
        cfg.pos && cfg.light.position.copy( cfg.pos ); 
        self.add(name, cfg.light);
        callback && callback();
      },

      'mesh.calculated': (name, cfg, callback) => {
        self.add(name, SCN.Meshes.calculate(name, cfg));
        callback && callback();
      },

      'mesh.module': (name, cfg, callback) => {
        SCN.Meshes[name](name, cfg, function (name, mesh) {
          self.add(name, mesh);
          callback && callback();
        });
      },

      'simulation': (name, cfg, callback) => {
        SIM.loadModel(name, cfg, (name, obj) => {
          cfg.rotation && obj.rotation.fromArray(cfg.rotation);
          self.add(name, obj);
          callback && callback();
        });
      },

      // 'mesh.basemaps': (name, cfg, callback) => {
      //   SCN.Meshes.basemaps(name, cfg, function (name, mesh) {
      //     self.add(name, mesh);
      //     callback && callback();
      //   });
      // },

      // 'mesh.basecopy': (name, cfg, callback) => {
      //   SCN.Meshes.basecopy(name, cfg, function (name, mesh) {
      //     self.add(name, mesh);
      //     callback && callback();
      //   });
      // },

      // 'mesh.textured': (name, cfg, callback) => {
      //   RES.load({type: 'texture', urls: [cfg.texture], onFinish: (err, responses) => {
      //     cfg.mesh.material.map = responses[0].data;
      //     self.add(name, cfg.mesh);
      //     callback && callback();
      //   }});
      // },

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
          // Animate:  { toggle: (value) => doAnimate  = value },
          // Simulate: { toggle: (value) => doSimulate = value },
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
            opacity:      (value) => objects.atmosphere.update({opacity: value}),
          },
          Assets: (function () {
            var asets = {};

            H.each(CFG.Objects, (name, config) => {
              if (config.id) {
                asets[name.toUpperCase()] = (value) => self.toggle(objects[name], value);
              }
            });

            return asets;

          }()),
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
          Animations: {
            Rotate:       (value) => ANI.insert(0, ANI.library.datetime.add(1, 'days', 800)), 
          },
        },
      end;

      try {
        config[folder][option](value);

      } catch (e) {
        console.warn('SCN.actions.error', folder, option, value);
        console.log(e);

      } 

    },
    updateSun: function (sunDirection) {

      //TODO: check light.onbeforerender

      var objs = SCN.objects;

      objs.spot.visible && objs.spot.position.copy(sunDirection).multiplyScalar(10);
      objs.sun.visible  && objs.sun.position.copy(sunDirection).multiplyScalar(10);

    },
    render: function render () {

      var 
        timestamp = performance.now(),
        deltasecs = (timestamp - (lastTimestamp || timestamp)) / 1000; // to secs

      requestAnimationFrame(render);

      IFC.Hud.performance.begin();

        objects.background.visible && objects.background.updatePosition();

        TWEEN.update();

        IFC.step(frame, deltasecs);
        IFC.Hud.step(frame, deltasecs);

        if ( !(frame % 1) ) {
          doSimulate && SIM.step(frame, deltasecs);
        }

        // always check actions
        doAnimate  && ANI.step(frame, deltasecs);

        if ( doRender && !(frame % 1) ) {
          renderer.clear();
          renderer.render( scene, camera );
          renderer.clearDepth();
          IFC.Hud.doRender && renderer.render( IFC.Hud.scene, IFC.Hud.camera );
        }

      IFC.Hud.performance.end();

      lastTimestamp = timestamp;
      frame += 1;

    },
    logInfo: function () {

      var gl = renderer.context;

      TIM.step('REN.info', 'maxVertexUniforms', renderer.capabilities.maxVertexUniforms);
      TIM.step('REN.info', 'devicePixelRatio', devicePixelRatio);
      TIM.step('REN.info', 'max_texture_size', gl.getParameter(gl.MAX_TEXTURE_SIZE));
      TIM.step('REN.info', 'max_cube_map_texture_size', gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));

      TIM.step('REN.extension', gl.getSupportedExtensions().filter( ex => ex.indexOf('float_linear') !== -1 ));

    },
    logFullInfo: function () {

      // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/

      // Each uniform is aligned to 4 floats.

      // MAX_VERTEX_UNIFORM_VECTORS
      // MAX_FRAGMENT_UNIFORM_VECTORS

      // FLOAT relevant: 
      // DataTexture
      //   OES_texture_float, 
      //   OES_texture_half_float,
      // THREE.LinearFilter
      //   OES_texture_float_linear,
      //   OES_texture_half_float_linear

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








