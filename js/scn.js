
'use strict';

var SCN = (function () {

  var 
    self,
    frame         = 0,
    lastTimestamp = NaN,

    // $             = document.getElementById.bind(document),
    $$            = document.querySelectorAll.bind(document),

    canvas        = $$('.simulator')[0],
    // monitor       = $$('canvas.panel.test')[0].getContext('2d'),
    // expi          = $$('canvas.panel.expi')[0].getContext('2d'),

    home          = new THREE.Vector3(0, 0, 0),

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias:    true,
      preserveDrawingBuffer:    true,   // screenshots
    }),

    camera,
    scene         = new THREE.Scene(),

    doRender      = true,
    doAnimate     = true,
    doSimulate    = true,

    extensions    = {},
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

      // TODO: make use of callback

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
      // IFC.Tools.updateUrl();

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

      // normalize param
      if (typeof basemap === 'string'){
        basename = basemap;

      } else  {
        console.error('SCN.toggleBasemap', 'illegal basemap param');
      }

      H.each(objects, (name, obj) => {

        if (name === basename){
          self.toggle(obj, true);

        } else if (CFG.BasemapIds.indexOf(CFG.Objects[name].id) !== -1 ) {
          self.toggle(obj, false);

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

      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
      
    },
    init: function () {

      // https://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      // webgl.min_capability_mode

      renderer.setClearColor(0x883300, 1.0);  // red for danger
      renderer.shadowMap.enabled = false;
      renderer.autoClear = false;             // cause HUD

      camera = self.camera = CFG.Camera.cam;
      camera.position.copy(CFG.Camera.pos);
      self.add('camera', camera);

      self.resize();

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

    prerender: function () {
      renderer.clear();
      renderer.render( scene, camera );
      renderer.clearDepth();
      renderer.render( IFC.Hud.scene, IFC.Hud.camera );
    },

    render: function render () {

      var 
        timestamp = performance.now(),
        deltasecs = (timestamp - (lastTimestamp || timestamp)) / 1000; // to secs

      requestAnimationFrame(render);

      IFC.Hud.performance.begin();

        camera.distance = camera.position.length() - CFG.earth.radius;

        objects.background.visible && objects.background.updatePosition();

        objects.spot.visible && objects.spot.position.copy(SIM.sunDirection).multiplyScalar(CFG.Sun.radius);
        objects.sun.visible  && objects.sun.position.copy(SIM.sunDirection).multiplyScalar(CFG.Sun.radius);

        TWEEN.update();

        IFC.step(frame, deltasecs);
        IFC.Hud.step(frame, deltasecs);

        // doSimulate && SIM.step(frame, deltasecs);

        // always check actions
        doAnimate && ANI.step(frame, deltasecs);

        if ( doRender && !(frame % 1) ) {
          renderer.clear();
          renderer.render( scene, camera );
          renderer.clearDepth();
          IFC.Hud.doRender && renderer.render( IFC.Hud.scene, IFC.Hud.camera );
        }

      IFC.Hud.performance.end();
      IFC.Hud.performance.render();

      lastTimestamp = timestamp;
      frame += 1;

    },
    info: function () { },
    probeDevice: function () {

      var gl = renderer.context;

      gl.getSupportedExtensions().forEach(ex => extensions[ex] = ex);

      CFG.Device.devicePixelRatio  = devicePixelRatio;
      CFG.Device.maxVertexUniforms = renderer.capabilities.maxVertexUniforms;
      CFG.Device.max_texture_size  = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      CFG.Device.max_cube_map_texture_size  = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
      
      CFG.Device.OES_texture_float         = !!extensions.OES_texture_float;
      CFG.Device.OES_texture_float_linear  = !!extensions.OES_texture_float_linear;

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








