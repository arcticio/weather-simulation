'use strict';

// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    txloader = new THREE.TextureLoader(),

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    loader     = $$('.interface img.loader')[0],
    simulator  = $$('.simulator')[0],
    fullscreen = $$('.fullscreen')[0],

    orbitControls, 

    controllers = GUIcontrollers,

    globe = {
      scan:     NaN,   // -1 = tiny globe, 1 = big, 0 = little smaller than screen
      pixels:   NaN,   // 2 * radius
      sector:   []
    },

    canvas = {            // canvas actually
      height:   NaN,
      width:    NaN,
      aspect:   NaN,
      diameter: NaN,
    },

    mouse = {
      x:          NaN, 
      y:          NaN, 
      px:         NaN, 
      py:         NaN, 
      down:       false, 
      button:     NaN,
      intersect:  new THREE.Vector3(0, 0, 0),
      overGlobe:  NaN,
      sprite:     null,
    },

    hud = {
      camera:   null,
      sprites:  [],
      scene:    new THREE.Scene(),
    },

    levels  = {
      '8':  1.2,
      '7':  1.4,
      '6':  1.8,
      '5':  2.6,
      '4':  4.2,
    },

    labels = {
      sun:       $$('.label.sun')[0],
    },

    panels = {
      latlon:    $$('.panel.latlon')[0],
    },

    raycaster = new THREE.Raycaster(),
    marker    = new THREE.Vector3(),

    stats,

    end;

  function vector3ToLatLong (v3) {

    var v = v3.clone().normalize();
    var lon = ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360);

    lon = lon > 180 ? -(360 - lon) : lon;

    return {
      lat: 90 - (Math.acos(v.y))  * 180 / Math.PI,
      lon: lon,
    };

  }

  function formatLatLon (prefix, ll) {
    
    ll.lat = ll.lat < 0 ? 'S ' + Math.abs(ll.lat).toFixed(0) : 'N ' + Math.abs(ll.lat).toFixed(0);
    ll.lon = ll.lon < 0 ? 'E ' + Math.abs(ll.lon).toFixed(0) : 'W ' + Math.abs(ll.lon).toFixed(0);

    return `<strong>${prefix}</strong> ${ ll.lat }, ${ ll.lon }`;

  }


  return self = {
    
    hud,
    stats,
    mouse,
    canvas,
    globe,
    raycaster,
    controllers,
    orbitControls,

    init: function () {

      var w2, h2;

      self.events.resize();

      w2 = canvas.width  / 2;
      h2 = canvas.height / 2;

      loader.style.display = 'block';

      hud.camera = new THREE.OrthographicCamera (- w2, w2, h2, - h2, 1, 10 );
      hud.camera.position.z = 10;

      self.stats = stats = new Stats();
      stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      fullscreen.appendChild( stats.dom );

      // move gui.dat to fullscreen container
      fullscreen.appendChild($$('div.dg.ac')[0]);

      raycaster.params.Points.threshold = 0.001; // threshold;

      H.each(CFG.sprites, (name, cfg) => {

        var material = new THREE.SpriteMaterial( {
          map: txloader.load(cfg.material.image, function (texture) {

            var sprite = new THREE.Sprite( material );

            material.transparent = true;
            material.opacity = 0.5;

            sprite.cfg = cfg;
            sprite.name = name;
            sprite.scale.set( cfg.position.width, cfg.position.height, 1 );

            sprite.onmouseenter = function () {
              ANI.insert(0, ANI.library.sprite.enter(sprite, 200));
            };

            sprite.onmouseleft = function () {
              ANI.insert(0, ANI.library.sprite.leave(sprite, 200));
            };

            sprite.click = cfg.onclick.bind(sprite, sprite);

            hud.scene.add( sprite );
            self.resizeHud();

          })
        });

      });

    },
    resizeHud: function () {

      var w2 = canvas.width  / 2;
      var h2 = canvas.height / 2;

      if (hud.camera) {
        hud.camera.left   = - w2;
        hud.camera.right  =   w2;
        hud.camera.top    =   h2;
        hud.camera.bottom = - h2;
        hud.camera.updateProjectionMatrix();
      }

      H.each(hud.scene.children, (_, sprite) => {

        var pos = sprite.cfg.position;

        sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

      });
    },
    show: function () {

      loader.style.display = 'none';

      // $$('.panel.image')[0].style.display = 'block';
      // $$('.panel.latlon')[0].style.display = 'block';
      // $$('.panel.info')[0].style.display = 'block';
      // $$('.panel.test')[0].style.display = 'block';
      // $$('.panel.expi')[0].style.display = 'block';
      // $$('.interface .labels')[0].style.display = 'block';
      
      $$('canvas.simulator')[0].style.display = 'block';

    },
    activate: function () {

      orbitControls = self.orbitControls = new THREE.OOrbitControls(SCN.camera, SCN.renderer.domElement),

      orbitControls.enabled = true;
        orbitControls.enablePan = false;
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.88;
        orbitControls.constraint.smoothZoom = true;
        orbitControls.constraint.zoomDampingFactor = 0.2;
        orbitControls.constraint.smoothZoomSpeed = 2.0;
        orbitControls.constraint.minDistance = CFG.minDistance;
        orbitControls.constraint.maxDistance = CFG.maxDistance;

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
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        // [document,  'contextmenu'],
        [document,  'keydown'],
        [window,    'orientationchange'],
        // [window,    'deviceorientation'], // needs https
        // [window,    'devicemotion'],
        [window,    'resize'],
      
      ], function (_, e) { 

        e[0].addEventListener(e[1], self.events[e[1]], false) 

      });

    },
    step: function step () {

      TWEEN.update();

      orbitControls.update();

      self.updateMouse();
      self.updateGlobe();
      self.updateHud();

      // GUI infos
      // self.updatePanels();
      // self.updateLabels();

    },
    events: {
      resize: function () {

        canvas.width    = SCN.renderer.domElement.width;
        canvas.height   = SCN.renderer.domElement.height;
        canvas.aspect   = canvas.width / canvas.height;
        canvas.diameter = Math.hypot(canvas.width, canvas.height);

        self.resizeHud();

      },
      click:   function (event) { 

        // if (!mouse.overGlobe) {GUI.closed = !GUI.closed;}

      },      
      dblclick:   function (event) { 

        if (!mouse.overGlobe) {
          if (screenfull.enabled) {
            screenfull.toggle(fullscreen);
          }        

        } else {
          ANI.insert(0, ANI.library.cam2vector(mouse.intersect, 2))

        }
        
        // console.log('dblclick');

      },
      mousedown:   function (event) { 

        mouse.down = true;
        mouse.button = event.button;
        // console.log('mousedown', event.button, event);

        // TODO: swap buttons, mind orbit drag

        if (mouse.button === 0) {
          SCN.objects.arrowHelper.visible && SCN.objects.arrowHelper.setDirection( mouse.intersect );
          marker.copy(mouse.intersect);
        }

        if (mouse.button === 2) {
          ANI.insert(0, ANI.library.cam2vector(mouse.intersect, 2));
        }

      },
      mouseup:     function (event) { 

        mouse.down = false;
        mouse.button = NaN;

        if (mouse.sprite){mouse.sprite.click();}

      },
      mousemove:   function (event) { 

        // TODO: not window
        mouse.px = event.clientX; 
        mouse.py = event.clientY;
        mouse.x  =   ( event.clientX / canvas.width )  * 2 - 1;
        mouse.y  = - ( event.clientY / canvas.height ) * 2 + 1;

        // console.log(mouse.px, mouse.py);

      },
      mouseenter:  function (event) { /* console.log('mouseenter') */ },
      mouseover:   function (event) { /* console.log('mouseover') */ },
      mouseleave:  function (event) { /* console.log('mouseleave') */ },
      mouseout:    function (event) { /* console.log('mouseout') */ },

      contextmenu: function (event) { /* console.log('contextmenu') */ },
      keydown:     function (event) { 

        console.log('IFC.keydown.in', `'${event.key}'`);

        var keys = {
          // ' ': () => doRender = !doRender,
        };

        if (keys[event.key]) {
          keys[event.key]();          
          console.log('IFC.keydown.done', `'${event.key}'`);
        }

      },

      touchstart:  function (event) { /* console.log('touchstart') */ },
      touchmove:   function (event) { /* console.log('touchmove') */ },
      touchend:    function (event) { /* console.log('touchend') */ },
      touchcancel: function (event) { /* console.log('touchcancel') */ },

      devicemotion:      function (event) { /* console.log('devicemotion', event)      */ },
      deviceorientation: function (event) { /* console.log('deviceorientation', event) */ },

      orientationchange: function (event) { console.log('orientationchange', event)       },

    },

    updateHud: function () {

      mouse.sprite = null;

      H.each(hud.scene.children, (_, sprite) => {

        var 
          x = mouse.px,
          y = mouse.py,
          pos = sprite.cfg.position,
          hit = x > pos.left && x < pos.left + pos.width && y > pos.top && y < pos.top + pos.height;

        if ( hit ) {

          if (!sprite.hit) {
            sprite.onmouseenter();
            sprite.hit = true;
          }

          mouse.sprite = sprite;

          // console.log('HIT', sprite.name);

        } else {

          if (sprite.hit) {
            sprite.onmouseleft();
            sprite.hit = false;
          }

        }

      });

    },

    updateGlobe: function () {

      // https://stackoverflow.com/questions/15331358/three-js-get-object-size-with-respect-to-camera-and-object-position-on-screen

      var 
        cam = SCN.camera,
        fov = cam.fov * Math.PI / 180,
        height = 2 * Math.tan( fov / 2 ) * cam.position.length(),
        fraction = CFG.earth.radius * 2 / height
      ;

      globe.pixels = canvas.height * fraction;

      globe.scan = (
        globe.pixels > canvas.diameter                              ? 1 : // big
        globe.pixels > canvas.width || globe.pixels > canvas.height ? 0 : // fits
          -1                                                              // tiny
      );

    },
    updateMouse: function () {

      var intersections, intersection, oldMouseOver = mouse.overGlobe;

      raycaster.setFromCamera( mouse, SCN.camera );
      intersections = raycaster.intersectObjects( [SCN.objects.pointer] );

      if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
        mouse.intersect.copy(intersection.point).normalize();
        mouse.overGlobe = true;

      } else {
        mouse.overGlobe = false;

      }

      if (oldMouseOver !== mouse.overGlobe){
        if (mouse.overGlobe) {
          ANI.insert(0, ANI.library.scaleGLobe(1.0, 800));
          GUI.closed = true;
        } else {
          ANI.insert(0, ANI.library.scaleGLobe(0.94, 800));
          GUI.closed = false;
        }
      }

    },
    updateLabels: function () {

      var 
        cam = SCN.camera,
        convert = TOOLS.vector3toScreenXY,
        camDistance = cam.position.distanceTo(SCN.home),
        sunDistance = cam.position.distanceTo(SIM.vectorSun);

      if (camDistance < sunDistance) {
        SIM.vectorSun && self.updateLabel(labels.sun, {x: -1000, y: -1000});

      } else {
        SIM.vectorSun && self.updateLabel(labels.sun, convert(SIM.vectorSun, width, height));

      }

    },
    updateLabel: function (el, pos) {

      el.style.left = pos.x + 'px';
      el.style.top  = pos.y + 'px';

    },
    updatePanels: function () {

      var 
        cam    = SCN.camera.position,
        marker = SCN.objects.arrowHelper.cone.position,

      end;

      panels.latlon.innerHTML = (
        formatLatLon('C', vector3ToLatLong(cam)) + '<br>' + 
        formatLatLon('M', vector3ToLatLong(marker))
      );


    },




    takeScreenShot: function(){
      // https://developer.mozilla.org/en/DOM/window.open
      var f = self.getFrame('image/png');
      var opts = 'menubar=no,scrollbars=no,location=no,status=no,resizable=yes,innerHeight=' + (f.height/2) + ',innerWidth=' + (f.width/2);
      var win = window.open(f.url, 'screenshot', opts); 
      win.focus();
      console.log('win.open', win, opts);
    },   
    getFrame :  function(mimetype){ 

      var 
        cvs    = SCN.renderer.domElement,
        width  = cvs.width,
        height = cvs.height;

      return {
        width, 
        height,
        url: cvs.toDataURL(mimetype),
        num: SCN.frames, 
      }; 

    },

  };

}());
