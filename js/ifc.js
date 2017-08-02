
// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    $$ = document.querySelectorAll.bind(document),

    simulator  = $$('.simulator')[0],
    fullscreen = $$('.fullscreen')[0],

    guiCont, guiMain, guiOpen = false,

    urlDirty   = false,

    controller, 

    intersections  = [],

    modus =    'space',

    globe = {
      scan:     NaN,   // -1 = tiny globe, 1 = big, 0 = little smaller than screen
      height:   NaN,   // 2 * radius
      sector:   []
    },

    geometry = {            // canvas actually
      height:        NaN,        // canvas
      width:         NaN,
      aspect:        NaN,
      diagonal:      NaN,
      distance:      NaN,        // camera
      radius:        NaN,
    },

    mouse = {
      x:             NaN, 
      y:             NaN, 
      px:            NaN, 
      py:            NaN, 
      down:          false, 
      button:        NaN,
      wheel:         {x: 0, y:0},
    },

    touch = {
      x:          NaN, 
      y:          NaN, 
      px:         NaN, 
      py:         NaN, 
      down:       false, 
    },

    pointer = {
      device:       mouse,             // assumption
      overGlobe:    false,
      overScreen:   false,
      intersect:    new THREE.Vector3(0, 0, 0),
      latitude:     NaN,
      longitude:    NaN,
    },

    raycaster = new THREE.Raycaster()

  ;

  return self = {
    
    modus,
    pointer,
    geometry,
    controller,

    urlDirty,

    init: function () {

      self.events.resize();

      // move gui.dat to fullscreen container
      guiCont = $$('div.dg.ac')[0];
      fullscreen.appendChild(guiCont);

      // pos gui.dat
      guiMain = $$('div.dg.main.a')[0];
      Object.assign(guiMain.style, {
        margin   : '0',
        position : 'absolute',
        right    : '0',
        top      : '72px',
        width    : '',
      });

      // check this
      raycaster.params.Points.threshold = 0.001;

      // init second scene
      IFC.Hud.init();

      // spacetime controller
      controller = self.controller = IFC.Controller;
      controller.init(SCN.camera, SCN.renderer.domElement, {

        minRadius: CFG.Camera.minRadius,
        maxRadius: CFG.Camera.maxRadius,

        onorient: function (callback /* , deltaX, deltaY, deltaZ */ ) {

          // eat for now
          callback(0, 0, 0);

        },

        ondrag: function (callback, deltaX, deltaY, deltaZ) {

          var timescale = H.scale(pointer.device.py, 0, geometry.height, 0.5, 10) ;

          if (modus === 'space') {

            if (pointer.overGlobe) {
              callback(deltaX, deltaY, deltaZ);

            } else {
              SIM.setSimTime(deltaX, 'hours');
              callback(0, 0, 0);

            }

          } else  {
            SIM.setSimTime(deltaX, 'hours');
            callback(0, 0, 0);

          }

        },
        onwheel: function (callback, deltaX, deltaY, deltaZ) {

          /* TODO: wheel, drag
              timescale: on bottom 1/3 screen.width = 1 day
              timescale: on top    1/3 screen.width = 1 hour
          */

          var timescale = H.scale(pointer.device.py, 0, geometry.height, 0.5, 20) ;

          if (pointer.overGlobe) {
            callback(deltaX, deltaY, deltaZ);

          } else {
            SIM.setSimTime( ~~(deltaX * -5 * timescale), 'minutes');
            callback(0, 0, 0);

          }

        },

        onRelax: function () {
          self.urlDirty = true;
        }

      });

    },
    toggleGUI: function () {

      guiOpen = !guiOpen;

      guiCont.style.display = guiOpen ? 'block' : 'none';
      window.GUI.closed = !guiOpen;

    },

    activate: function () {

      IFC.Hud.activate();

      controller.activate();

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'mouseenter'],
        // [simulator, 'mouseover'],
        [document,  'mouseleave'],
        // [document,  'mouseout'],
        // [simulator, 'wheel'],
        [simulator, 'click'],
        // [simulator, 'dblclick'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        [document,  'contextmenu'],
        [document,  'keydown'],
        // [window,    'orientationchange'], // no edge
        // [window,    'deviceorientation'], // needs https
        // [window,    'devicemotion'],
        [window,    'resize'],
      
      ], (_, e) => {
        // TODO make touchstart, -move, wheel passive
        // console.log(e[1]);
        e[0].addEventListener(e[1], self.events[e[1]], false);
      } );

    },

    show: function () {

      $$('canvas.simulator')[0].style.display = 'block';

      IFC.Hud.time.render();
      self.urlDirty = true;

    },
      
    step: function step (frame, deltatime) {

      controller.step(frame, deltatime);

      self.updatePointer();
      self.updateGlobe();
      self.updateLatLon();

      if (self.urlDirty)  {
        IFC.Tools.updateUrl();
        self.urlDirty = false;
      }

    },
    capture: function () {

      var 
        blob,
        amount = 60,
        ondone = function (obj) {
          if(!obj.error) {
            blob = H.base64toBlob(obj.image.slice(22), 'image/gif');
            saveAs(blob, 'hypatia.gif');
          }
        }

      SCN.capture(amount, function (images) {

        gifshot.createGIF({
          gifWidth:   360,
          gifHeight:  640,
          interval:   1/60,
          numFrames:  amount,
          images:     images.map(blob => {
            var img = new Image();
            img.src = blob;
            return img;
          })
        }, ondone);

      });

    },
    events: {

      keydown:     function (event) { 

        var keys = {
          ' ': SCN.toggleRender,
          's': SCN.logScene,
          // 'd': SCN.logFullInfo,
          'd': CFG.Manager.download,
          'g': self.toggleGUI,
          'm': IFC.Hud.toggleMenu,
          'c': IFC.capture,
          't': () => SIM.setSimTime( -1, 'hours'),
          'z': () => SIM.setSimTime(  1, 'hours'),
        };

        if (keys[event.key]) {
          keys[event.key]();          
          console.log(event.key, 'down');
          return IFC.Tools.eat(event);
        }

      },

      onglobeenter: function () {
        ANI.insert(0, ANI.library.scaleGLobe( 1.0,  800))
        IFC.Hud.spacetime.updateModus('space');
        IFC.Hud.performance.selectModus(1);
      },
      onglobeleave: function () {
        ANI.insert(0, ANI.library.scaleGLobe( 0.94, 800));
        IFC.Hud.spacetime.updateModus('time');
        IFC.Hud.performance.selectModus(2);
      },
      resize: function () {

        // TODO: Chrome on Android drops last event on leave fullscreen

        geometry.width         = window.innerWidth;
        geometry.height        = window.innerHeight;
        geometry.aspect        = geometry.width / geometry.height;
        geometry.diagonal      = Math.hypot(geometry.width, geometry.height);

        geometry.w2            = geometry.width  / 2;
        geometry.h2            = geometry.height / 2;

        simulator.style.width  = geometry.width  + 'px';
        simulator.style.height = geometry.height + 'px';
        simulator.width        = geometry.width;
        simulator.height       = geometry.height;

        SCN.resize(geometry);
        IFC.Hud.resize(geometry);

      },
      click:   function (event) { 
        // pointer.device = mouse;
        // if (!pointer.overGlobe) {GUI.closed = !GUI.closed;}

      },      
      contextmenu:   function (event) { 
        IFC.Tools.eat(event);
      },      
      dblclick:   function (event) { 
        // pointer.device = mouse;

        // if (!pointer.overGlobe) {
        //   if (screenfull.enabled) {
        //     screenfull.toggle(fullscreen);
        //   }        

        // } else {
        //   ANI.insert(0, ANI.library.cam2vector(pointer.intersect, 2))

        // }
        
        // console.log('dblclick');

      },
      mousedown:   function (event) { 

        pointer.device = mouse;
        mouse.down     = true;
        mouse.button   = event.button;

        // console.log('mousedown', event.button, event);

        // TODO: swap buttons, mind orbit drag

        if (mouse.button === 0) {
          // SCN.assets.arrowHelper.visible && SCN.assets.arrowHelper.setDirection( pointer.intersect );
          // marker.copy(pointer.intersect);
        }

        if (mouse.button === 2) {
          if (pointer.overGlobe){
            ANI.insert(0, ANI.library.cam2vector(pointer.intersect, 500));
          }
        }

      },
      mouseup:     function () { 
        pointer.device = mouse;
        mouse.down     = false;
        mouse.button   = NaN;
      },
      mousemove:   function (event) { 
        pointer.device = mouse;
        mouse.px       = event.clientX; 
        mouse.py       = event.clientY;
        mouse.x        =   ( event.clientX / geometry.width )  * 2 - 1;
        mouse.y        = - ( event.clientY / geometry.height ) * 2 + 1;
      },
      mouseenter:   function () { 
        pointer.device = mouse;
        pointer.overScreen = true;
        SCN.setComb(1);
      },
      mouseleave:  function () {
        pointer.overScreen = false;
        SCN.setComb(4);
      },

      touchstart:  function (event) { 
      
        console.log('touchstart');

        touch.down = event.touches.length > 0;
        touch.px   = event.touches[ 0 ].pageX;
        touch.py   = event.touches[ 0 ].pageY;
        touch.x    =   ( touch.px / geometry.width )  * 2 - 1;
        touch.y    = - ( touch.py / geometry.height ) * 2 + 1;

        pointer.device = touch;

      },
      touchmove:   function () { 
        pointer.device = touch;
      },
      touchend:    function (event) { 
        pointer.device = touch;
        touch.down = event.touches.length === 0;
      },
      touchcancel: function (event) { 
        pointer.device = touch;
        touch.down = event.touches.length === 0;
      },

      devicemotion:      function (event) { /* console.log('devicemotion', event)      */ },
      deviceorientation: function (event) { /* console.log('deviceorientation', event) */ },

      orientationchange: function (event) { console.log('orientationchange', event)       },

    },

    toggleSpaceTime: function () {

      modus = self.modus = modus === 'space' ? 'time' : 'space';

      IFC.Hud.spacetime.updateModus();

    },
    
    updateGlobe: function () {

      // https://stackoverflow.com/questions/15331358/three-js-get-object-size-with-respect-to-camera-and-object-position-on-screen

      var 
        cam      = SCN.camera,
        fov      = cam.fov * Math.PI / 180,
        // height   = 2 * Math.tan( fov / 2 ) * cam.position.length(),
        height   = 2 * Math.tan( fov / 2 ) * cam.radius,
        fraction = CFG.earth.radius * 2 / height
      ;

      globe.height = geometry.height * fraction;

      globe.scan = (
        globe.height > geometry.diagonal                              ? 1 :   // big
        globe.height > geometry.width || globe.height > geometry.height ? 0 : // fits
          -1                                                                  // tiny
      );

    },
    updatePointer: function () {

      var 
        intersection, 
        isOver  = false, 
        wasOver = pointer.overGlobe
      ;
      
      intersections.length = 0;
      // intersections.splice(0, intersections.length);
      raycaster.setFromCamera( pointer.device, SCN.camera );
      SCN.assets.pointer.raycast(raycaster, intersections)

      if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
        pointer.intersect.copy(intersection.point).normalize();
        isOver = true;
      
      } else {
        pointer.intersect.set(0, 0, 0);

      }

      (  isOver && !wasOver ) && self.events.onglobeenter();
      ( !isOver &&  wasOver ) && self.events.onglobeleave();

      pointer.overGlobe = isOver;

    },

    updateLatLon: function () {

      var v = pointer.intersect;

      if (v.x || v.y || v.z) {
        pointer.latitude  = 90 - (Math.acos(v.y))  * 180 / PI;
        pointer.longitude = ((270 + (Math.atan2(v.x , v.z)) * 180 / PI) % 360);

      } else {
        pointer.latitude  = NaN;
        pointer.longitude = NaN;

      }

    },

  };

}());
