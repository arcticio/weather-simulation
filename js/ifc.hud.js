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

            sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

            if (name === 'hamburger') {
              scene.add( sprite );
            } else {
              menu.add( sprite );              
            }
            sprites.push(sprite);

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

        sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

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

      // self.resize();

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

      var mouse = IFC.mouse;

      mouse.sprite = null;

      H.each(sprites, (_, sprite) => {

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

  };

}());
