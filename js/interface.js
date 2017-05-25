'use strict';

// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    simulator, // 3D canvas

    mouse = {x: NaN, y: NaN, down: false},

    raycaster = new THREE.Raycaster(),

    stuff

    ;


  return {
    
    mouse,
    raycaster,

    boot: function () {
      return self = this;
    },
    init: function () {

      raycaster.params.Points.threshold = 0.001; // threshold;

    },
    activate: function () {

      simulator = $('simulator');

      // console.log('simulator', simulator);


      window.addEventListener('resize', self.resize, false);


      H.each([
        'mousedown',
        'mouseup',
        'mousemove',
        'mouseenter',
        'mouseover',
        'mouseleave',
        'mouseout',
        'contextmenu',
      ], (_, event) => document.addEventListener(event, self.events[event], false));

    },
    events: {
      mousedown:   function (event) { 

        /* console.log('mousedown') */ 

        mouse.down = true;

        // gui.closed = true;


      },
      mouseup:     function (event) { 

        /* console.log('mouseup') */ 

        mouse.down = false;

      },
      mousemove:   function (event) { 

        /* console.log('mousemove') */ 

        mouse.x =   ( event.clientX / window.innerWidth )  * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      },
      mouseenter:  function (event) { /* console.log('mouseenter') */ },
      mouseover:   function (event) { /* console.log('mouseover') */ },
      mouseleave:  function (event) { /* console.log('mouseleave') */ },
      mouseout:    function (event) { /* console.log('mouseout') */ },
      contextmenu: function (event) { /* console.log('contextmenu') */ },
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