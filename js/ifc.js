
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

    modus =    'space',

    globe = {
      scan:     NaN,   // -1 = tiny globe, 1 = big, 0 = little smaller than screen
      height:   NaN,   // 2 * radius
      sector:   []
    },

    canvas = {            // canvas actually
      height:   NaN,
      width:    NaN,
      aspect:   NaN,
      diagonal: NaN,
    },

    mouse = {
      x:          NaN, 
      y:          NaN, 
      px:         NaN, 
      py:         NaN, 
      down:       false, 
      button:     NaN,
      wheel:      {x: 0, y:0},
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
      intersect:    new THREE.Vector3(0, 0, 0),
    },

    levels  = {
      '8':  1.2,
      '7':  1.4,
      '6':  1.8,
      '5':  2.6,
      '4':  4.2,
    },

    raycaster = new THREE.Raycaster(),
    marker    = new THREE.Vector3()

  ;

  return self = {
    
    modus,
    pointer,
    controller,

    urlDirty,

    init: function () {

      self.events.resize();

      self.urlDirty = urlDirty;

      guiCont = $$('div.dg.ac')[0];
      guiMain = $$('div.dg.main.a')[0];

      // move gui.dat to fullscreen container
      fullscreen.appendChild(guiCont);

      // pos gui.dat
      guiMain.style.margin   = '0';
      guiMain.style.top      = '72px';
      guiMain.style.right    = '0';
      guiMain.style.width    = '';
      guiMain.style.position = 'absolute';

      // check this
      raycaster.params.Points.threshold = 0.001;

      // globe controller
      controller = self.controller = IFC.Controller;
      controller.init(SCN.camera, SCN.renderer.domElement, {

        minDistance: CFG.Camera.minDistance,
        maxDistance: CFG.Camera.maxDistance,

        onorient: function (callback, deltaX, deltaY, deltaZ) {

          // eat for now
          callback(0, 0, 0);

        },

        ondrag: function (callback, deltaX, deltaY, deltaZ) {

          var timescale = H.scale(pointer.device.py, 0, canvas.height, 0.5, 10) ;

          if (modus === 'space') {

            if (pointer.overGlobe) {
              // IFC.Hud.spacetime.updateModus('space');
              callback(deltaX, deltaY, deltaZ);

            } else {
              // overides space modus
              // IFC.Hud.spacetime.updateModus('time');
              SIM.setSimTime(deltaX, 'hours');
              callback(0, 0, 0);

            }

          } else  {
            // IFC.Hud.spacetime.updateModus('time');
            SIM.setSimTime(deltaX, 'hours');
            callback(0, 0, 0);

          }


        },
        onwheel: function (callback, deltaX, deltaY, deltaZ) {

          /* TODO: wheel, drag
              timescale: on bottom 1/3 screen.width = 1 day
              timescale: on top    1/3 screen.width = 1 hour
          */

          var timescale = H.scale(pointer.device.py, 0, canvas.height, 0.5, 20) ;

          if (pointer.overGlobe) {
            // IFC.Hud.spacetime.updateModus('space');
            callback(deltaX, deltaY, deltaZ);

          } else {
            // IFC.Hud.spacetime.updateModus('time');
            SIM.setSimTime( ~~(deltaX * -5 * timescale), 'minutes');
            callback(0, 0, 0);

          }

        },
        // onkey: function (key) {
        //   var actions = {
        //     // 't': () => SIM.setSimTime( -1, 'hours'),
        //     // 'z': () => SIM.setSimTime(  1, 'hours'),
        //   };
        //   actions[key] && actions[key]();
        // },

        onRelax: function () {
          self.urlDirty = true;
        }

      });

      IFC.Hud.init();

    },
    toggleGUI: function () {

      guiOpen = !guiOpen;

      guiCont.style.display = guiOpen ? 'block' : 'none'
      window.GUI.closed = !guiOpen;

    },

    show: function () {

      $$('canvas.simulator')[0].style.display = 'block';

      IFC.Hud.resize();
      IFC.Hud.time.render();
      IFC.Tools.updateUrl();
      self.urlDirty = false;

    },
      
    activate: function () {

      IFC.Hud.activate();

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'mouseenter'],
        [simulator, 'mouseover'],
        [document,  'mouseleave'],
        [document,  'mouseout'],
        // [simulator, 'wheel'],
        [simulator, 'click'],
        // [simulator, 'dblclick'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        [document,  'contextmenu'],
        [document,  'keydown'],
        [window,    'orientationchange'],
        // [window,    'deviceorientation'], // needs https
        // [window,    'devicemotion'],
        [window,    'resize'],
      
      ], (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );

      controller.activate();

    },
    step: function step (frame, deltatime) {

      controller.step(frame, deltatime);

      self.updatePointer();
      self.updateGlobe();

      if (self.urlDirty)  {
        IFC.Tools.updateUrl();
        self.urlDirty = false;
      }

    },
    events: {
      resize: function () {

        // TODO: Chrome on Android drops last event on leave fullscreen

        SCN.resize();

        canvas.width    = SCN.renderer.domElement.width;
        canvas.height   = SCN.renderer.domElement.height;
        canvas.aspect   = canvas.width / canvas.height;
        canvas.diagonal = Math.hypot(canvas.width, canvas.height);

        IFC.Hud.resize();

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
        mouse.down = true;
        mouse.button = event.button;

        // console.log('mousedown', event.button, event);

        // TODO: swap buttons, mind orbit drag

        if (mouse.button === 0) {
          // SCN.objects.arrowHelper.visible && SCN.objects.arrowHelper.setDirection( pointer.intersect );
          marker.copy(pointer.intersect);
        }

        if (mouse.button === 2) {
          if (pointer.overGlobe){
            ANI.insert(0, ANI.library.cam2vector(pointer.intersect, 2));
          }
        }

      },
      mouseup:     function (event) { 
        pointer.device = mouse;
        mouse.down     = false;
        mouse.button   = NaN;
      },
      mousemove:   function (event) { 
        pointer.device = mouse;
        mouse.px = event.clientX; 
        mouse.py = event.clientY;
        mouse.x  =   ( event.clientX / canvas.width )  * 2 - 1;
        mouse.y  = - ( event.clientY / canvas.height ) * 2 + 1;
      },
      mouseenter:   function (event) { 
        pointer.device = mouse;
        SCN.toggleRender(true);
      },
      mouseleave:  function (event) {
        SCN.toggleRender(false);
      },
      keydown:     function (event) { 

        var keys = {
          ' ': () => SCN.toggleRender(),
          'g': () => self.toggleGUI(),
          'm': () => IFC.Hud.toggleMenu(),
          't': () => SIM.setSimTime( -1, 'hours'),
          'z': () => SIM.setSimTime(  1, 'hours'),
        };

        if (keys[event.key]) {
          keys[event.key]();          
          console.log('IFC.keydown.done', `'${event.key}'`);
          return IFC.Tools.eat(event);
        }

      },

      touchstart:  function (event) { 
      
        console.log('touchstart');

        touch.down = event.touches.length > 0;
        touch.px = event.touches[ 0 ].pageX;
        touch.py = event.touches[ 0 ].pageY;
        touch.x  =   ( touch.px / canvas.width )  * 2 - 1;
        touch.y  = - ( touch.py / canvas.height ) * 2 + 1;

        pointer.device = touch;

      },
      touchmove:   function (event) { 
        pointer.device = touch;
        // console.log('touchmove');
      },
      touchend:    function (event) { 
        pointer.device = touch;
        // console.log('touchend');
        touch.down = event.touches.length === 0;
      },
      touchcancel: function (event) { 
        pointer.device = touch;
        // console.log('touchcancel');
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
        height   = 2 * Math.tan( fov / 2 ) * cam.position.length(),
        fraction = CFG.earth.radius * 2 / height
      ;

      globe.height = canvas.height * fraction;

      globe.scan = (
        globe.height > canvas.diagonal                              ? 1 : // big
        globe.height > canvas.width || globe.height > canvas.height ? 0 : // fits
          -1                                                              // tiny
      );

    },
    onglobeenter: function () {
      ANI.insert(0, ANI.library.scaleGLobe( 1.0,  800))
      // console.log('onglobeenter');
      IFC.Hud.spacetime.updateModus('space');
    },
    onglobeleave: function () {
      ANI.insert(0, ANI.library.scaleGLobe( 0.94, 800));
      IFC.Hud.spacetime.updateModus('time');
      // console.log('onglobeleave');
    },
    updatePointer: function () {

      var 
        intersection, 
        isOver, wasOver = pointer.overGlobe,
        intersections  = []
      ;

      raycaster.setFromCamera( pointer.device, SCN.camera );

      SCN.objects.pointer.raycast(raycaster, intersections)

      if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
        pointer.intersect.copy(intersection.point).normalize();
        isOver = true;

      } else {
        isOver = false;

      }

      (  isOver && !wasOver ) && self.onglobeenter();
      ( !isOver &&  wasOver ) && self.onglobeleave();

      pointer.overGlobe = isOver;

    },

  };

}());
