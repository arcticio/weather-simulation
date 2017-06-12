'use strict';

// https://github.com/sindresorhus/screenfull.js/

IFC.Hud = (function () {

  var 
    self,

    txloader = new THREE.TextureLoader(),

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    loader     = $$('.interface img.loader')[0],
    simulator  = $$('.simulator')[0],

    camera     = new THREE.OrthographicCamera (0, 0, 100, 100, 1, 10 ),
    scene      = new THREE.Scene(),
    menu       = new THREE.Object3D(),
    sprites    = [],

    toggled    = false,

  end;

  return self = {

    menu,
    scene,
    camera,
    
    init: function () {

      camera.position.z = 10;

      menu.position.setX(-100);

      self.initSprites();
      scene.add(menu);
      scene.add(camera);
      self.resize();

    },
    initSprites: function () {

      var w2 = SCN.canvas.width  / 2;
      var h2 = SCN.canvas.height / 2;

      H.each(CFG.sprites, (name, cfg) => {

        var material = new THREE.SpriteMaterial( {
          map: txloader.load(cfg.material.image, function (texture) {

            var 
              sprite = new THREE.Sprite( material ),
              pos = cfg.position
            ;

            material.transparent = true;
            material.opacity = cfg.material.opacity;

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

            if (pos.bottom){
              sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , 1 );

            } else {
              sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

            }

            if (name === 'hamburger' || name === 'performance') {
              scene.add( sprite );
            } else {
              menu.add( sprite );              
            }
            sprites.push(sprite);

            if (IFC.Hud[name]) {
              IFC.Hud[name].init(sprite, cfg);
            }

          })
        });

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

      H.each(sprites, (_, sprite) => {

        var pos = sprite.cfg.position;

        if (pos.bottom){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , 1 );

        } else {
          sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

        }


      });
    },
    show: function () {

      // $$('.panel.image')[0].style.display = 'block';
      // $$('.panel.latlon')[0].style.display = 'block';
      // $$('.panel.info')[0].style.display = 'block';
      // $$('.panel.test')[0].style.display = 'block';
      // $$('.panel.expi')[0].style.display = 'block';
      // $$('.interface .labels')[0].style.display = 'block';
      
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
      
      ], function (_, e) { 

        e[0].addEventListener(e[1], self.events[e[1]], false) 

      });

    },

    events: {

      mousedown: function (event) {console.log('HUD.mousedown')},
      mouseup: function (event) {console.log('HUD.mouseup')},
      mousemove: function (event) {
        // console.log('HUD.mousemove')
      },
      touchstart: function (event) {console.log('HUD.touchstart')},
      touchmove: function (event) {console.log('HUD.touchmove')},
      touchend: function (event) {console.log('HUD.touchend')},
      orientationchange: function (event) {
        self.resize();
        console.log('HUD.orientationchange')
      },

    },

    toggle: function () {

      toggled = !toggled;

      if (toggled){
        ANI.insert(0, ANI.library.menu.toggle(0, 200));

      } else {
        ANI.insert(0, ANI.library.menu.toggle(-100, 200));

      }

    },
    step: function () {

      // buttons hit test for mouse

      var mouse = IFC.mouse;

      mouse.sprite = null;

      H.each(sprites, (_, sprite) => {

        // TODO: respect pos.bottom

        var 
          x = mouse.px,
          y = mouse.py,
          pos = sprite.cfg.position,
          hit = x > pos.left && x < pos.left + pos.width && y > pos.top && y < pos.top + pos.height;

        if (toggled || !toggled && (sprite.name === 'hamburger' || sprite.name === 'performance' )){

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
          
        }

      });

    },

  };

}());


IFC.Hud.performance = (function () {

  var 
    self,
    sprite,
    cfg,
    cvs, ctx, img,
    texture,
    width, height,
    now, duration, 

  end;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');
      img    = sprite.material.map.image;

      width  = cfg.position.width;
      height = cfg.position.height;

      cvs.width  = 256;
      cvs.height = 128;

      // CanvasTexture( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy )
      texture = new THREE.CanvasTexture(cvs);

      sprite.material.map = texture;

    },
    begin: function () {

      var i;

      now = window.performance.now();

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#ffffff';
        for (i=0; i<3; i++){
          ctx.fillRect(0, cvs.height/4 * (i +1), cvs.width, 2);
        }

        ctx.font = '28px monospace'
        ctx.fillStyle = '#ffffff';
        ctx.fillText('D: ' + duration.toFixed(1), 150, 124);

        texture.needsUpdate = true;

      }

    },
    end:   function () {

      duration = window.performance.now() - now;

      // sprite.material.map.needsUpdate = true;


    },
  };


}());