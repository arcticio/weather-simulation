
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

    touch      = {x: NaN, y: NaN, sprite: null},
    mouse      = {x: NaN, y: NaN, sprite: null},

    menuToggled    = false,

    vecUp  = new THREE.Vector3(1, 1, 0).normalize(),
    vecRot = new THREE.Vector3(0, 0, 0),

  end;

  return self = {

    menu,
    scene,
    camera,
    sprites,
    
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

        if (cfg.material.image) {
          sprite.material.map = CFG.Textures[cfg.material.image];

        } else if (cfg.material.color) {
          sprite.material.color = cfg.material.color;

        }

        // https://threejs.org/examples/webgl_sprites.html
        // material.map.offset.set( -0.5, -0.5 );
        // material.map.repeat.set( 2, 2 );

        sprite.cfg = cfg;
        sprite.name = name;

        if (cfg.position.width === '100%') {
          sprite.scale.set( SCN.canvas.width, cfg.position.height, 1 );

        } else {
          sprite.scale.set( cfg.position.width, cfg.position.height, 1 );

        }

        if (cfg.hover !== false) {

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

        if (cfg.menu) {
          menu.add( sprite );     

        } else {
          scene.add( sprite );

        }

        sprites[name] = sprite;

        IFC.Hud[name] && IFC.Hud[name].init(sprite, cfg);

      });

    },
    posSprites: function () { 

      var
        pos, 
        w  = SCN.canvas.width,
        w2 = SCN.canvas.width  / 2,
        h2 = SCN.canvas.height / 2;

      H.each(sprites, (name, sprite) => {

        pos = sprite.cfg.position;

        if (pos.width === '100%') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , 1 );
          sprite.scale.setX(w);

        } else if (pos.bottom && pos.left){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , 1 );

        } else if (pos.right && pos.top) {
          sprite.position.set( + w2 - pos.right - pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

        } else if (pos.center && pos.center === 'x') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , 1 );

        } else {
          sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , 1 );

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
      
      ], (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );

    },

    step: function () {

      var veloX, veloY, angle;

      if (IFC.controller) {

        ({veloX, veloY} = IFC.controller.info());

        if (veloX || veloY) {

          vecRot.setX(veloX);
          vecRot.setY(-veloY);
          vecRot.normalize();

          angle = vecRot.angleTo(vecUp);
          
          sprites.spacetime.material.rotation = angle;

          // console.log(angle);

        }

      }

    },

    events: {

      mousedown: function (event) {
        // console.log('HUD.mousedown')
      },
      mouseup: function (event) {

        mouse.sprite && mouse.sprite.click();

        mouse.sprite && console.log('HUD.mouseup', mouse.sprite.name);

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

            console.log('HIT', sprite.name);

          }

          mouse.sprite = sprite;


        } else {

          if (mouse.sprite) {

            console.log('UNHIT', mouse.sprite.name);

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

        var x, y, sprite;

        // console.log('HUD.touchend');

        x = event.changedTouches[ 0 ].pageX;
        y = event.changedTouches[ 0 ].pageY;

        if (( sprite = self.testHit(x, y) )) {

          if (sprite === touch.sprite){

            sprite.click && sprite.click();

            IFC.eat(event);
            // console.log('touchend', x, y, sprite.name);

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

      menuToggled = !menuToggled;

      if (menuToggled){
        // sprites.hamburger.material.opacity = 0.9;
        // sprites.hamburger.toggled = true;
        ANI.insert(0, ANI.library.menu.toggle(0, 200));

      } else {
        // sprites.hamburger.material.opacity = 0.5;
        ANI.insert(0, ANI.library.menu.toggle(-400, 200));
        // sprites.hamburger.toggled = false;

      }

    },
    testHit: function (x, y) {

      // works in screen space 0/0 = left/top

      var 
        pos, isMenu, hasClick, hit = false, found = null, 
        zone  = {left:0, top: 0, right: 0, bottom: 0},
        menuX = IFC.Hud.menu.position.x,
        menuY = IFC.Hud.menu.position.y,
        w     = SCN.canvas.width,
        h     = SCN.canvas.height,
        w2    = SCN.canvas.width  / 2,
        h2    = SCN.canvas.height / 2
      ;

      H.each(sprites, (name, sprite) => {

        pos      = sprite.cfg.position;
        isMenu   = sprite.cfg.menu;
        hasClick = !!sprite.cfg.onclick;

        if (!found && hasClick) {

          if (pos.bottom && pos.left){

            zone.left   = !isMenu ?     pos.left    : menuX +     pos.left;
            zone.bottom = !isMenu ? h - pos.bottom  : menuY + h - pos.bottom;
            zone.top    = zone.bottom - pos.height;
            zone.right  = zone.left   + pos.width;

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