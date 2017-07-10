
IFC.Hud.spacetime = (function () {

  var 
    self, cfg, modus, 
    sprite, cvs, ctx, texture,
    vecUp       = new THREE.Vector3(0, 1, 0),
    vecRot      = new THREE.Vector3(0, 0, 0)
  ;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');

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
        hr   = time.hours() % 12;

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
      ctx.lineTo(40, 0);
      ctx.stroke();
      ctx.restore();

      // Minutes
      ctx.save();
      ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(56, 0);
      ctx.stroke();
      ctx.restore();

      // Circle
      ctx.beginPath();
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#ddd';
      ctx.arc(0, 0, 72, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.restore();

    }

  };

}());

IFC.Hud.time = (function () {

  var 
    self,
    sprite,
    cfg,
    cvs, ctx, // img,
    texture
  ;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');

      cvs.width  = cfg.position.width;
      cvs.height = cfg.position.height;

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
        // simDate = SIM.time.model.format('YYYY-MM-DD'),
        // simTime = SIM.time.model.format('HH:mm [UTC]'),
        simDate = SIM.time.fmtDay,
        simTime = SIM.time.fmtHour,
        simDoe  = SIM.time.doe.toFixed(2)
      ;

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        // debug
        // ctx.fillStyle = 'rgba(200, 0, 0, 0.5)'
        // ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#000';

        ctx.font = 'bold 22px monospace'
        metrics = ctx.measureText(simDate);
        ctx.fillText(simDate, (cvs.width - metrics.width) / 2, 34);

        ctx.font = 'bold 16px monospace'
        metrics = ctx.measureText(simTime);
        ctx.fillText(simTime, (cvs.width - metrics.width) / 2, 54);

        ctx.font = 'bold 11px monospace'
        metrics = ctx.measureText(simDoe);
        // ctx.fillText(simDoe, (cvs.width - metrics.width) / 2, 66);

        texture.needsUpdate = true;

      }

    },

  };

}());