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

    camera     =  null,
    sprites    =  [],
    scene      =  new THREE.Scene(),

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

    scene,
    camera,
    
    init: function () {

      var w2, h2;

      w2 = SCN.canvas.width  / 2;
      h2 = SCN.canvas.height / 2;

      camera = self.camera = new THREE.OrthographicCamera (- w2, w2, h2, - h2, 1, 10 );
      camera.position.z = 10;

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

            scene.add( sprite );
            self.resize();

          })
        });

      });

    },
    resize: function () {

      var w2 = SCN.canvas.width  / 2;
      var h2 = SCN.canvas.height / 2;

      if (camera) {
        camera.left   = - w2;
        camera.right  =   w2;
        camera.top    =   h2;
        camera.bottom = - h2;
        camera.updateProjectionMatrix();
      }

      H.each(scene.children, (_, sprite) => {

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
      
    },
    activate: function () {

    },

    step: function () {

      var mouse = IFC.mouse;

      mouse.sprite = null;

      H.each(scene.children, (_, sprite) => {

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
