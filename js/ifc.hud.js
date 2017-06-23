
'use strict';

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
    sprites    = {},

    toggled    = false,

  end;

  return self = {

    menu,
    scene,
    camera,
    sprites,
    
    init: function () {

      camera.position.z = 10;

      menu.position.setX(-500);

      self.initSprites();
      scene.add(menu);
      scene.add(camera);
      self.resize();

    },
    initSprites: function () {

      var 
        w2 = SCN.canvas.width  / 2,
        h2 = SCN.canvas.height / 2;

      H.each(CFG.Sprites, (name, cfg) => {

        var 
          material = new THREE.SpriteMaterial({map: CFG.Textures[cfg.material.image]}),
          sprite   = new THREE.Sprite( material ),
          pos      = cfg.position
        ;
        // debugger;
        material.transparent = true;
        material.opacity = cfg.material.opacity;

        sprite.cfg = cfg;
        sprite.name = name;
        sprite.scale.set( cfg.position.width, cfg.position.height, 1 );

        sprite.onmouseenter = function () {
          ANI.insert(0, ANI.library.sprite.enter(sprite, 200));
        };

        sprite.onmouseleave = function () {
          ANI.insert(0, ANI.library.sprite.leave(sprite, 200));
        };

        sprite.click = cfg.onclick.bind(sprite, sprite);

        if (pos.bottom){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , 1 );

        } else if (pos.center && pos.center === 'x') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , 1 );

        } else {
          sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

        }

        if (name === 'hamburger' || name === 'performance' || name === 'time') {
          scene.add( sprite );

        } else {
          menu.add( sprite );     

        }

        sprites[name] = sprite;

        if (IFC.Hud[name]) {
          IFC.Hud[name].init(sprite, cfg);
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

      H.each(sprites, (name, sprite) => {

        var pos = sprite.cfg.position;

        if (pos.bottom){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , 1 );

        } else if (pos.center && pos.center === 'x') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , 1 );

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

      mousedown: function (event) {
        // console.log('HUD.mousedown')
      },
      mouseup: function (event) {

        if (IFC.mouse.sprite){IFC.mouse.sprite.click();}

        // console.log('HUD.mouseup')
      },
      mousemove: function (event) {
        // console.log('HUD.mousemove')
      },
      touchstart: function (event) {

        var x, y;

        console.log('HUD.touchstart')

        switch ( event.touches.length ) {

          case 1:
            x = event.touches[ 0 ].pageX;
            y = event.touches[ 0 ].pageY;

          case 2:
          break;
          
          case 3:
          break;

        }

        IFC.touch.x = x;
        IFC.touch.y = y;

        self.hitTest(x, y);

        console.log('touchstart', x, y)


      },
      touchmove: function (event) {console.log('HUD.touchmove')},
      touchend: function (event) {

        IFC.touch.x = NaN;
        IFC.touch.y = NaN;

        console.log('HUD.touchend')

      },

      orientationchange: function (event) {
        self.resize();
        console.log('HUD.orientationchange')
      },

    },

    toggle: function () {

      toggled = !toggled;

      if (toggled){
        // sprites.hamburger.material.opacity = 0.9;
        // sprites.hamburger.toggled = true;
        ANI.insert(0, ANI.library.menu.toggle(0, 200));

      } else {
        // sprites.hamburger.material.opacity = 0.5;
        ANI.insert(0, ANI.library.menu.toggle(-500, 200));
        // sprites.hamburger.toggled = false;

      }

    },
    hitTest: function (xTest, y) {

      var 
        xOff = IFC.Hud.menu.position.x,
        x = xOff + xTest,
        element = null;

      H.each(sprites, (name, sprite) => {

        // TODO: respect pos.bottom

        var 
          pos = sprite.cfg.position,
          hit = x > pos.left && x < pos.left + pos.width && y > pos.top && y < pos.top + pos.height;

        if ( sprite.cfg.events.length ){

          if ( hit ) {

            if (!sprite.hit) {
              sprite.onmouseenter();
              sprite.hit = true;
            }

            IFC.touch.sprite = sprite;

            console.log('HIT', sprite.name);

          } else {

            if (sprite.hit) {
              sprite.onmouseleave();
              sprite.hit = false;
            }

          }

        }

      });

    },
    step: function () {

      // buttons hit test for mouse

      var mouse = IFC.mouse;

      mouse.sprite = null;

      H.each(sprites, (name, sprite) => {

        // TODO: respect pos.bottom

        var 
          x = mouse.px,
          y = mouse.py,
          pos = sprite.cfg.position,
          hit = x > pos.left && x < pos.left + pos.width && y > pos.top && y < pos.top + pos.height;


        if ( !sprite.cfg.events.length ){return;}

        if (toggled || !toggled && (sprite.name === 'hamburger' || sprite.name === 'performance' )){

          if ( hit ) {

            if (!sprite.hit) {
              sprite.onmouseenter();
              sprite.hit = true;

              console.log('HIT', sprite.name);

            }

            mouse.sprite = sprite;


          } else {

            if (sprite.hit) {
              sprite.onmouseleave();
              sprite.hit = false;

              console.log('UNHIT', sprite.name);

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
    cvs, ctx, img, back, texture,
    width, height,
    now, last, fps,
    bufDur = H.createRingBuffer(60),
    bufFps = H.createRingBuffer(60),
    lineFills = {
      '0': '#666',
      '1': '#fff',
      '2': '#666',
    },
  end;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');
      img    = sprite.material.map.image,
      back   = cfg.back,

      width  = cfg.position.width;
      height = cfg.position.height;

      // cvs.width  = back.width  = 256;
      // cvs.height = back.height = 128;

      cvs.width  = back.width  = 128;
      cvs.height = back.height = 64;

      texture = new THREE.CanvasTexture(cvs);

      sprite.material.map = texture;

    },
    begin: function () {

      var 
        val,
        off  = 1,
        max  = 18,
        ctx  =  back.getContext('2d'),
        zero = 29 + max;

      now = window.performance.now();
      fps = last ? 1000 / (now - last) : 60;
      val = H.scale(fps, 0, 60, 0, max ),

      ctx.globalCompositeOperation = 'source-over';

      // paint fps line in new column
      ctx.fillStyle = fps > 50 ? '#008800' : '#ee0000';
      ctx.fillRect(back.width - off, zero, off, -val);

      ctx.globalCompositeOperation = 'copy';

      // move left off pixel column
      ctx.drawImage(back, off, 0, back.width - off, back.height, 0, 0, back.width - off, back.height);

      last = now;

    },
    end:   function () {

      var i, duration = window.performance.now() - now;

      bufDur.push(duration);
      bufFps.push(fps);

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        ctx.drawImage(back, 0, 0);

        // debug
        // ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
        // ctx.fillRect(0, 0, cvs.width, cvs.height);

        for (i=0; i<3; i++){
          ctx.fillStyle = lineFills[i];
          ctx.fillRect(0, cvs.height/4.5 * (i +1), cvs.width, 1.1);
        }

        ctx.font = '11px monospace'
        ctx.fillStyle = '#ddd';
        ctx.fillText(bufDur.avg().toFixed(1) + 'd',   100, 62);
        ctx.fillText(bufFps.avg().toFixed(1) + 'fps',   0, 62);

        texture.needsUpdate = true;

      }

    },
  };


}());


IFC.Hud.time = (function () {

  var 
    self,
    sprite,
    cfg,
    cvs, ctx, img,
    texture,
    width, height,
    simtime, 

  end;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');
      img    = sprite.material.map.image;

      width  = cvs.width  = cfg.position.width;
      height = cvs.height = cfg.position.height;

      ctx.font         = '24px monospace'
      ctx.fillStyle    = '#eee';
      ctx.textBaseline = 'bottom';

      texture = new THREE.CanvasTexture(cvs);

      sprite.material.map = texture;

      self.render();

    },
    render: function () {

      var 
        metrics,
        now = moment().format('YYYY-MM-DD HH:mm:ss'),
        simDate = SIM.time.model.format('YYYY-MM-DD'),
        simTime = SIM.time.model.format('HH:mm [UTC]');

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        // ctx.fillStyle = 'rgba(200, 0, 0, 0.5)'
        // ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#eee'
        ctx.font = 'bold 22px monospace'

        metrics = ctx.measureText(simDate);
        ctx.fillText(simDate, (cvs.width - metrics.width) / 2, 22);

        ctx.font = 'bold 16px monospace'
        metrics = ctx.measureText(simTime);
        ctx.fillText(simTime, (cvs.width - metrics.width) / 2, 44);

        texture.needsUpdate = true;

      }

    },

  };


}());