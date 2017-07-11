
var SCN = (function () {

  var 
    self,
    frame         = 0,
    lastTimestamp = NaN,

    $$            = document.querySelectorAll.bind(document),

    canvas        = $$('.simulator')[0],
    home          = new THREE.Vector3(0, 0, 0),

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias:    true,
      // alpha:        true, // lensflare ???
      preserveDrawingBuffer:    true,   // screenshots
    }),

    camera, 
    pointer,
    scene         = new THREE.Scene(),

    comb          = 1,   // 0 = no render, 1 = all frames, 2 = every other, 3 etc 

    doRender      = true,

    extensions    = {},
    objects       = {}

  ;

  return self = {
    
    home,
    scene,
    camera,
    pointer,
    objects,
    renderer,

    toggleRender: function (force) {
      doRender = force !== undefined ? force : !doRender;
    },
    add: function (name, obj) {

      if (name === 'pointer') {
        pointer = self.pointer = obj;

      } // else {
        objects[name] = obj;
        objects[name].name = name;
        scene.add(obj);

      // }

    },
    setComb : function (val) {comb = val;},
    toggle: function (obj, force) {

      if (scene.getObjectByName(obj.name) || force === false) {
        scene.remove(obj);

      } else {
        if (obj instanceof THREE.Object3D){
          scene.add(obj);

        } else {
          SCN.Tools.loader[obj.type](obj.name, obj, () => {});

        }
      }

      IFC.urlDirty = true;

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

      var basename, lightset;

      // sanitize param
      if (typeof basemap === 'string'){
        basename = basemap;

      } else  {
        console.error('SCN.toggleBasemap', 'illegal basemap param');
      }

      H.each(objects, (name, obj) => {

        if (CFG.Assets[name] !== undefined) {

          if (name === basename){
            self.toggle(obj, true);

          } else if (CFG.BasemapIds.indexOf(CFG.Assets[name].id) !== -1 ) {
            self.toggle(obj, false);

          }

        }

      });

      lightset = CFG.Lightsets[CFG.Assets[basename].lightset];

      ANI.insert(0, ANI.library.lightset(lightset, 300));

      console.log('SCN.toggleBasemap', basename);

    },

    resize: function (geometry) {

      renderer.setSize(geometry.width, geometry.height);

      if (camera) {
        camera.aspect = geometry.aspect;
        camera.updateProjectionMatrix();
      }
      
    },
    init: function () {

      // https://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      // webgl.min_capability_mode

      renderer.setClearColor(0x662200, 1.0);  // red for danger
      renderer.shadowMap.enabled = false;
      renderer.autoClear = false;             // cause HUD

      camera = self.camera = CFG.Camera.cam;
      camera.position.copy(CFG.Camera.pos);
      self.add('camera', camera);

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

            H.each(CFG.Assets, (name, config) => {
              if (config.debuggable) {
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
        }
      ;

      try {
        config[folder][option](value);

      } catch (e) {
        console.warn('SCN.actions.error', folder, option, value);
        console.log(e);

      } 

    },

    prerender: function () {
      var t0 = Date.now();
      renderer.clear();
      renderer.render( scene, camera );
      renderer.render( scene, camera ); // cause onAfterRender
      renderer.clearDepth();
      IFC.Hud.render(renderer);
      IFC.Hud.render(renderer);
      TIM.step('SCN.prerender', Date.now() - t0, 'ms');
    },

    render: function render () {

      var 
        timestamp = performance.now(),
        deltasecs = (timestamp - (lastTimestamp || timestamp)) / 1000; // to secs

      requestAnimationFrame(render);

      if ( comb && !(frame % comb) ) {

        IFC.Hud.performance.begin();

          TWEEN.update();

          // moves cam
          IFC.step(frame, deltasecs);

          camera.radius   = camera.position.length();
          camera.distance = camera.radius - CFG.earth.radius;

          objects.background.updatePosition();

          SIM.updateSun();
          objects.spot.position.copy(SIM.sunPosition);
          objects.sun.position.copy(SIM.sunPosition);

          // always look for new animations
          ANI.step(frame, deltasecs);

          // update globe
          renderer.clear();
          renderer.render( scene, camera );

          // update Hud
          IFC.Hud.step(frame, deltasecs);
          IFC.Hud.render(renderer);

        IFC.Hud.performance.end();

        // to next frame
        IFC.Hud.performance.render();

      }

      lastTimestamp = timestamp;
      frame += 1;

    },
    // info: function () { },
    probeDevice: function () {

      var gl = renderer.context, dev = CFG.Device;

      gl.getSupportedExtensions().forEach(ex => extensions[ex] = ex);

      dev.devicePixelRatio                = devicePixelRatio;
      dev.maxVertexUniforms               = renderer.capabilities.maxVertexUniforms;
      dev.max_texture_size                = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      dev.max_texture_image_units         = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      dev.max_cube_map_texture_size       = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
      dev.max_vertex_texture_image_units  = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      dev.OES_texture_float               = !!extensions.OES_texture_float;
      dev.OES_texture_float_linear        = !!extensions.OES_texture_float_linear;

    },
    logFullInfo: function () {

      // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
      // Each uniform is aligned to 4 floats.

      var gl = renderer.context;

      console.log('SAMPLES',                      gl.getParameter(gl.SAMPLES));
      console.log('MAX_RENDERBUFFER_SIZE',        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
      console.log('MAX_VERTEX_UNIFORM_VECTORS ',  gl.getParameter('MAX_VERTEX_UNIFORM_VECTORS', gl.MAX_VERTEX_UNIFORM_VECTORS));
      console.log('MAX_FRAGMENT_UNIFORM_VECTORS', gl.getParameter('MAX_FRAGMENT_UNIFORM_VECTORS', gl.MAX_FRAGMENT_UNIFORM_VECTORS));

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
        extensions:             gl.getSupportedExtensions(),

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








