'use strict';

// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    simulator,  // 3D canvas
    fullscreen, // div full

    mouse = {x: NaN, y: NaN, down: false},

    raycaster = new THREE.Raycaster(),

    stats,

    end;


  return {
    
    stats,
    mouse,
    raycaster,

    boot: function () {
      return self = this;
    },
    init: function () {

      simulator  = $$('.simulator')[0];
      fullscreen = $$('.fullscreen')[0];

      var datgui = $$('div.dg.ac')[0];
      // datgui.style.position = 'relative';
      // datgui.style.top = '0px';

      var stats = new Stats();
      self.stats = stats;
      stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      fullscreen.appendChild( stats.dom );

      raycaster.params.Points.threshold = 0.001; // threshold;

    },
    activate: function () {


      window.addEventListener('resize', self.resize, false);

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'mouseenter'],
        [simulator, 'mouseover'],
        [simulator, 'mouseleave'],
        [simulator, 'mouseout'],
        [simulator, 'click'],
        [simulator, 'dblclick'],
        [document,  'contextmenu'],
        [window,    'orientationchange'],
        [window,    'deviceorientation'],
        [window,    'devicemotion'],
      
      ], function (_, e) { 

        e[0].addEventListener(e[1], self.events[e[1]], false) 

      });

    },
    events: {
      click:   function (event) { 

        gui.closed = true;
        // console.log('click')

      },      
      dblclick:   function (event) { 

        if (screenfull.enabled) {
          screenfull.toggle(fullscreen);
        }        
        console.log('dblclick');

      },
      mousedown:   function (event) { 

        mouse.down = true;
        // console.log('mousedown', event.button, event);

      },
      mouseup:     function (event) { 

        mouse.down = false;

      },
      mousemove:   function (event) { 

        // TODO: not window
        mouse.x =   ( event.clientX / window.innerWidth )  * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      },
      mouseenter:  function (event) { /* console.log('mouseenter') */ },
      mouseover:   function (event) { /* console.log('mouseover') */ },
      mouseleave:  function (event) { /* console.log('mouseleave') */ },
      mouseout:    function (event) { /* console.log('mouseout') */ },
      contextmenu: function (event) { /* console.log('contextmenu') */ },

      devicemotion:      function (event) { /* console.log('devicemotion', event)      */ },
      orientationchange: function (event) { console.log('orientationchange', event)       },
      deviceorientation: function (event) { /* console.log('deviceorientation', event) */ },

    },
    resize: function () {
    },

    takeScreenShot: function(){
      // https://developer.mozilla.org/en/DOM/window.open
      var f = self.getFrame("image/png");
      var opts = "menubar=no,scrollbars=no,location=no,status=no,resizable=yes,innerHeight=" + (f.height/2) + ",innerWidth=" + (f.width/2);
      var win = window.open(f.url, "screenshot", opts); 
      win.focus();
      console.log("win.open", win, opts);
    },   
    getFrame :  function(mimetype){ 

      var 
        ele    = SCN.renderer.domElement,
        width  = ele.width,
        height = ele.height;

      return {
        width, 
        height,
        url: ele.toDataURL(mimetype),
        num: SCN.frames, 
      }; 

    },

  };

}()).boot();