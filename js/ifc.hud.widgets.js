
'use strict'

IFC.Hud.spacetime = (function () {

  var 
    self, cfg, modus, 
    sprite, cvs, ctx, img, texture,
    width, height,
    simtime, 
    vecUp       = new THREE.Vector3(0, 1, 0),
    vecRot      = new THREE.Vector3(0, 0, 0),
  end;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');

      width  = cfg.position.width;
      height = cfg.position.height;

      cvs.width  = 64;
      cvs.height = 64;

      texture = new THREE.CanvasTexture(cvs);

      self.updateModus();
      self.render();

    },

    updateModus: function (force) {

      modus = force === undefined ? IFC.modus : force;

      sprite.material.map = (modus === 'space') ?
        CFG.Textures['hud/space.png'] : 
        texture
      ;

      sprite.material.map.needsUpdate = true;

    },

    render: function () {

      (modus === 'space') ? self.renderSpace() : self.renderTime();
        
    },
    renderSpace: function () {
      
      var veloX, veloY, angle;

      if (IFC.controller) {

        ({veloX, veloY} = IFC.controller.info());

        if (veloX || veloY) {

          vecRot.setX(veloX);
          vecRot.setY(-veloY);
          // vecRot.normalize();

          angle = vecRot.angleTo(vecUp);
          
          sprite.material.rotation = angle;

          // console.log(angle);

        }

      }

    },
    renderTime: function () {

      // credits: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations

      var 
        w    = cvs.width,  w2 = w/2,
        h    = cvs.height, h2 = h/2,
        time = SIM.time.model,
        sec  = time.seconds(),
        min  = time.minutes(),
        hr   = time.hours() % 12,
      end;

      sprite.material.rotation = 0;

      ctx.save();

      ctx.clearRect(0, 0, w, h);
      ctx.translate(w2, h2);
      ctx.scale(0.4, 0.4);
      ctx.rotate(-Math.PI / 2);

      ctx.strokeStyle = 'white';
      ctx.lineCap = 'round';

      // Hours
      ctx.save();
      ctx.rotate(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec);
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(44, 0);
      ctx.stroke();
      ctx.restore();

      // Minutes
      ctx.save();
      ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(60, 0);
      ctx.stroke();
      ctx.restore();

      // Circle
      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#999';
      ctx.arc(0, 0, 72, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.restore();

    }

  };

}());


IFC.Hud.performance = (function () {

  var 
    self,
    sprite,
    cfg,
    cvs, ctx, img, back, texture, ctxBack,
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

      sprite  = mesh;
      cfg     = config;
      cvs     = cfg.canvas;
      ctx     = cvs.getContext('2d');
      img     = sprite.material.map.image,
      back    = cfg.back,
      ctxBack = back.getContext('2d'),

      width  = cfg.position.width;
      height = cfg.position.height;

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
        ctx  =  ctxBack,
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
    cvs, ctx, // img,
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
      // img    = sprite.material.map.image;

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
        // now = moment().format('YYYY-MM-DD HH:mm:ss'),
        simDate = SIM.time.model.format('YYYY-MM-DD'),
        simTime = SIM.time.model.format('HH:mm [UTC]');

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        // ctx.fillStyle = 'rgba(200, 0, 0, 0.5)'
        // ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 22px monospace'

        metrics = ctx.measureText(simDate);
        ctx.fillText(simDate, (cvs.width - metrics.width) / 2, 34);

        ctx.font = 'bold 16px monospace'
        metrics = ctx.measureText(simTime);
        ctx.fillText(simTime, (cvs.width - metrics.width) / 2, 54);

        texture.needsUpdate = true;

      }

    },

  };


}());