
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
      preserveDrawingBuffer:    true,   // screenshots
    }),

    camera, 
    pointer,
    scene         = new THREE.Scene(),

    comb          = 1,   // 0 = no render, 1 = all frames, 2 = every other, 3 etc 

    doRender      = true,

    extensions    = {},
    assets        = {}

  ;

  return self = {
    
    home,
    scene,
    assets,
    camera,
    pointer,
    renderer,

    toggleRender: function (force) {
      doRender = force !== undefined ? force : !doRender;
    },
    add: function (name, asset) {

      if (name === 'pointer') {
        // expose pointer to IFC
        pointer = self.pointer = asset;
      }

      assets[name] = asset;
      assets[name].name = name;
      scene.add(asset);

    },
    setComb : function (val) {comb = val;},
    toggle: function (asset, force) {

      if (scene.getObjectByName(asset.name) || force === false) {
        scene.remove(asset);

      } else {
        if (asset instanceof THREE.Object3D){
          scene.add(asset);

        } else {
          SCN.Tools.loader[asset.type](asset.name, asset, () => {});

        }
      }

      IFC.urlDirty = true;

    },

    isActive: function (assetname) {

      var active = false;

      H.each(assets, (name, asset) => {

        if (!active && name === assetname && asset instanceof THREE.Object3D ) {
          active = true;
        }

      });

      return active;

    },
    activeAssets: function (arr) {
      arr.splice(0, arr.length);
      scene.children
        .filter(c => c.visible && c.name !== 'camera')
        .map(c => c.name === 'basemaps' ? c.getMapId() : CFG.Assets[c.name].id)
        .filter(c => !!c)        
        .forEach( id => arr.push(id))
      ;
      return arr.sort( (a, b) => a - b);

    },
    toggleBasemap: function (basemap) {

      var basename, lightset, action = '';

      // sanitize param
      if (typeof basemap === 'string'){
        basename = basemap;

      } else  {
        console.error('SCN.toggleBasemap', 'illegal basemap param');
      }

      H.each(assets, (name, obj) => {

        if (CFG.Assets[name] !== undefined) {

          if (name === basename){
            self.toggle(obj, true);
            action = 'on';

          } else if (CFG.BasemapIds.indexOf(CFG.Assets[name].id) !== -1 ) {
            self.toggle(obj, false);
            action = 'off';

          }

        }

      });

      lightset = CFG.Lightsets[CFG.Assets[basename].lightset];

      ANI.insert(0, ANI.library.lightset(lightset, 300));

      IFC.urlDirty = true;

      console.log('SCN.toggleBasemap', basename, action);

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
      renderer.shadowMap.enabled = false;     // not needed
      renderer.autoClear = false;             // cause HUD has own scene

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
            toggle:       (value) => self.toggle(assets.ambient, value),
            intensity:    (value) => assets.ambient.intensity = value,
            color:        (value) => assets.ambient.color = new THREE.Color( value ),
          },
          Spot: {
            toggle:       (value) => self.toggle(assets.spot, value),
            angle:        (value) => assets.spot.angle = value,
            intensity:    (value) => assets.spot.intensity = value,
            color:        (value) => assets.spot.color = new THREE.Color( value ),
          },
          Sun: {
            toggle:       (value) => self.toggle(assets.sun, value),
            intensity:    (value) => assets.sun.intensity = value,
            skycolor:     (value) => assets.sun.color = new THREE.Color( value ),
            grdcolor:     (value) => assets.sun.groundColor = new THREE.Color( value ),
          },
          Atmosphere: {
            toggle:       (value) => self.toggle(assets.atmosphere, value),
            opacity:      (value) => assets.atmosphere.update({opacity: value}),
          },
          Assets: (function () {
            var asets = {};

            H.each(CFG.Assets, (name, config) => {
              if (config.debuggable) {
                asets[name.toUpperCase()] = (value) => self.toggle(assets[name], value);
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
          camera.distance = (camera.radius - CFG.Camera.minRadius) / (CFG.Camera.maxRadius - CFG.Camera.minRadius);

          assets.background.updatePosition();

          SIM.updateSun();
          assets.spot.position.copy(SIM.sunPosition);
          assets.sun.position.copy(SIM.sunPosition);

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
      dev.oes_texture_float               = !!extensions.OES_texture_float;
      dev.oes_texture_float_linear        = !!extensions.OES_texture_float_linear;
      dev.oes_standard_derivatives        = !!extensions.OES_standard_derivatives;

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








