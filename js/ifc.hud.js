
'use strict';

IFC.Hud = (function () {

  var 
    self,

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    doRender    = true,

    loader      = $$('.interface img.loader')[0],
    simulator   = $$('.simulator')[0],

                         // OrthographicCamera ( left, right, top, bottom, near, far )
    camera      = new THREE.OrthographicCamera (0, 0, 100, 100, 1, 10 ),
    scene       = new THREE.Scene(),
    menu        = new THREE.Object3D(),
    sprites     = {},

    touch       = {x: NaN, y: NaN, sprite: null},
    mouse       = {x: NaN, y: NaN, sprite: null},

    menuToggled = false,

  end;

  return self = {

    menu,
    scene,
    camera,
    sprites,
    doRender,
    
    init: function () {

      camera.position.z = 10;

      menu.position.setX(menuToggled ? 0 : -400);

      self.initSprites();
      scene.add(menu);
      scene.add(camera);
      self.resize();

    },
    initSprites: function () {

      H.each(CFG.Sprites, (name, cfg) => {

        var sprite = new THREE.Sprite( new THREE.SpriteMaterial({
          // map:          CFG.Textures[cfg.material.image],
          opacity :     cfg.material.opacity,
          transparent : true,
        }));

        // https://threejs.org/examples/webgl_sprites.html
        // material.map.offset.set( -0.5, -0.5 );
        // material.map.repeat.set( 2, 2 );

        sprite.cfg = cfg;
        sprite.name = name;

        if (cfg.material.image) {
          sprite.material.map = CFG.Textures[cfg.material.image];

        } else if (cfg.material.color) {
          sprite.material.color = cfg.material.color;

        }

        if (cfg.position.width === '100%') {
          sprite.scale.set( SCN.canvas.width, cfg.position.height, 1 );

        } else {
          sprite.scale.set( cfg.position.width, cfg.position.height, 1 );

        }

        if (cfg.hover !== false) {  // is explicit

          sprite.onmouseenter = sprite.touchstart = function () {
            ANI.insert(0, ANI.library.sprite.enter(sprite, 200));
          };

          sprite.onmouseleave = sprite.touchend = function () {
            ANI.insert(0, ANI.library.sprite.leave(sprite, 200));
          };

        } else {
          sprite.onmouseleave = sprite.onmouseenter = () => {};

        }

        if (cfg.onclick) {
          sprite.click = cfg.onclick.bind(sprite, sprite);
        }

        cfg.menu ? menu.add( sprite ) : scene.add( sprite );

        sprites[name] = sprite;

        // complex HUD elements
        IFC.Hud[name] && IFC.Hud[name].init(sprite, cfg);

      });

    },
    posSprites: function () { 

      var
        pos, 
        w  = SCN.canvas.width,
        h  = SCN.canvas.height,
        w2 = w / 2,
        h2 = h / 2;

      H.each(sprites, (name, sprite) => {

        pos = sprite.cfg.position;

        if (pos.width === '100%') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , pos.zIndex );
          sprite.scale.setX(w);

        } else if (pos.bottom && pos.right){
          sprite.position.set( + w2 - pos.right - pos.width / 2, -h2 + pos.bottom + pos.height / 2 , pos.zIndex );

        } else if (pos.bottom && pos.left){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , pos.zIndex );

        } else if (pos.right && pos.top) {
          sprite.position.set( + w2 - pos.right - pos.width / 2, h2 - pos.top - pos.height / 2 , pos.zIndex );

        } else if (pos.center && pos.center === 'x') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , pos.zIndex );

        } else {
          sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , pos.zIndex );

        }

      });

    },
    resize: function () {

      var w2 = SCN.canvas.width  / 2;
      var h2 = SCN.canvas.height / 2;

      camera.left   = - w2;
      camera.right  =   w2;
      camera.top    =   h2;
      camera.bottom = - h2;
      camera.updateProjectionMatrix();

      self.posSprites();

    },
    toggle: function () {

      doRender = self.doRender = !doRender;
      
    },
    activate: function () {

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        [window,    'orientationchange'],
      
      ], (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );

    },

    step: function (frame, deltatime) {

      // update every second
      if ( !(frame % 60) ) {
        IFC.Hud.time.render();
      }

      IFC.Hud.spacetime.render();

    },

    events: {

      mousedown: function (event) {
        // console.log('HUD.mousedown')
      },
      mouseup: function (event) {

        mouse.sprite && mouse.sprite.click();
        // mouse.sprite && console.log('HUD.mouseup', mouse.sprite.name);

      },
      mousemove: function (event) {

        var x, y, sprite;

        x = mouse.x = event.pageX;
        y = mouse.y = event.pageY; 

        if (( sprite = self.testHit(x, y) )) {

          // fast mouse
          if (mouse.sprite && sprite !== mouse.sprite) {
            mouse.sprite.hit = false;
            mouse.sprite.onmouseleave();
            mouse.sprite = null;
          }

          if (!sprite.hit) {
            sprite.hit = true;
            sprite.onmouseenter();

            // console.log('HIT', sprite.name);

          }

          mouse.sprite = sprite;


        } else {

          if (mouse.sprite) {

            // console.log('UNHIT', mouse.sprite.name);

            mouse.sprite.hit = false;
            mouse.sprite.onmouseleave();
            mouse.sprite = null;

          }

        }

      },
      touchstart: function (event) {

        var x, y, sprite;

        if ( event.changedTouches.length === 1) {

          x = event.changedTouches[ 0 ].pageX;
          y = event.changedTouches[ 0 ].pageY;

          // console.log('HUD.touchstart', x, y);

          if (( sprite = self.testHit(x, y) )) {

            touch.x = x;
            touch.y = y;
            touch.sprite = sprite;

            // console.log('touchstart', x, y, sprite.name);

          }

        }

      },
      touchend: function (event) {

        var 
          sprite,
          x = event.changedTouches[ 0 ].pageX,
          y = event.changedTouches[ 0 ].pageY;

        if (( sprite = self.testHit(x, y) )) {

          if (sprite === touch.sprite){

            sprite.click && sprite.click();

            IFC.Tools.eat(event);

          }

        }

        touch.x = NaN;
        touch.y = NaN;
        touch.sprite = null;

      },

      orientationchange: function (event) {
        self.resize();
        console.log('HUD.orientationchange')
      },

    },

    toggleMenu: function () {

      var left;

      menuToggled = !menuToggled;

      left = menuToggled ? 0 : -400;

      ANI.insert(0, ANI.library.menu.toggle(left, 200));

    },
    testHit: function testHit (x, y) {

      // works in screen space 0/0 = left/top

      var 
        pos, isMenu, hasClick, hit = false, found = null, 
        zone  = {left:0, top: 0, right: 0, bottom: 0},
        menuX = IFC.Hud.menu.position.x,
        menuY = IFC.Hud.menu.position.y,
        w     = SCN.canvas.width,
        h     = SCN.canvas.height,
        w2    = w / 2,
        h2    = h / 2
      ;

      H.each(sprites, (name, sprite) => {

        pos      = sprite.cfg.position;
        isMenu   = sprite.cfg.menu;

        if (!found && !!sprite.cfg.onclick) {

          if (pos.bottom && pos.left){

            zone.left   = !isMenu ?     pos.left    : menuX +     pos.left;
            zone.bottom = !isMenu ? h - pos.bottom  : menuY + h - pos.bottom;
            zone.top    = zone.bottom - pos.height;
            zone.right  = zone.left   + pos.width;

          } else if (pos.right && pos.bottom) {

            zone.right  = !isMenu ? w - pos.right   : menuX + w - pos.right;
            zone.bottom = !isMenu ? h - pos.bottom  : menuY + h - pos.bottom;
            zone.top    = zone.bottom - pos.height;
            zone.left   = zone.right - pos.width;

          } else if (pos.right && pos.top) {

            zone.right  = !isMenu ? w - pos.right   : menuX + w - pos.right;
            zone.top    = !isMenu ?     pos.top     : menuY +     pos.top;
            zone.left   = zone.right - pos.width;
            zone.bottom = zone.top   + pos.height;

          } else if (pos.left && pos.top) {

            zone.left   = !isMenu ? pos.left    : menuX + pos.left;
            zone.top    = !isMenu ? pos.top     : menuY + pos.top;
            zone.right  = zone.left  + pos.width;
            zone.bottom = zone.top   + pos.height;

          } else if (pos.center && pos.center === 'x') {

            // can't be menu

            zone.top    = pos.top;
            zone.left   = w2 - pos.width / 2;
            zone.bottom = zone.top   + pos.height;
            zone.right  = zone.left  + pos.width;

          } else if (pos.center && pos.center === 'y') {
            console.log('IFC.testHit', sprite.name, 'unhandled pos');

          } else {
            console.log('IFC.testHit', sprite.name, 'strange pos');
          }

          hit = x > zone.left && y > zone.top && x < zone.right && y < zone.bottom;

          found = hit ? sprite : null;

        }

      });

      return found;

    },


  };

}());
