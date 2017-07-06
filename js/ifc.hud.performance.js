
IFC.Hud.performance = (function () {

  var 
    self, sprite,  cfg,
    cvs, ctx, back, texture, ctxBack,
    stats = {
      now:  NaN,
      last: NaN,
      fps:  NaN,
    },
    bufDur = H.createRingBuffer(60),
    bufFps = H.createRingBuffer(60),
    lineFills = {
      '0': '#666',
      '1': '#fff',
      '2': '#666',
    },
    modus = 2,
    modi = {
      1: 'Debug',
      2: 'Scene',
      3: 'Bandwidth',
    };

  return self = {
    selectModus: function (param) {

      if (typeof param === 'string') {
        debugger;
        modus = modi[param];
      } else if (typeof param === 'number') {
        modus = param;
      } else {
        modus = (modus + 1) > 3 ? 1 : (modus + 1);
      }

    },
    init:  function (mesh, config) {

      sprite  = mesh;
      cfg     = config;
      cvs     = cfg.canvas;
      ctx     = cvs.getContext('2d');
      back    = cfg.back;
      ctxBack = back.getContext('2d');

      cvs.width  = back.width  = cfg.position.width;
      cvs.height = back.height = cfg.position.height;

      texture = sprite.material.map = new THREE.CanvasTexture(cvs);

    },
    render: function () {

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      // debug
      // ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
      // ctx.fillRect(0, 0, cvs.width, cvs.height);

      self['render' + modi[modus]]();

      texture.needsUpdate = true;

    },
    renderDebug:     function () {

      var 
        line = 1,
        state = IFC.controller.status(),
        tmp2m = NaN
      ;

      // tmp2m = SIM.models.tmp2m && SIM.models.tmp2m.interpolateLL(IFC.pointer.latitude, IFC.pointer.longitude) - KELVIN;

      // ctx.font = '11px monospace'
      // ctx.fillStyle = '#ddd';
      // ctx.textBaseline = 'bottom';

      // // ctx.fillText('alpha: ' + state.alpha, 4, line++ * 14);
      // // ctx.fillText('beta:  ' + state.beta,  4, line++ * 14);
      // // ctx.fillText('gamma: ' + state.gamma, 4, line++ * 14);

      // ctx.fillText('LAT: ' + IFC.pointer.latitude.toFixed(4),  4, line++ * 14);
      // ctx.fillText('LON: ' + IFC.pointer.longitude.toFixed(4), 4, line++ * 14);
      // ctx.fillText('TMP: ' + (tmp2m ? tmp2m.toFixed(1) : 'X') + ' °C',          4, line++ * 14);

    },
    renderBandwidth: function () {

      ctx.font      = '11px monospace'
      ctx.fillStyle = '#ddd';

      ctx.fillText('bandwidth', 4, cvs.height / 2);

    },
    renderScene:     function () {

      var 
        val, i,
        off  = 1,
        max  = 18,
        zero = 29 + max;

      val = H.scale(stats.fps, 0, 60, 0, max ),

      ctxBack.globalCompositeOperation = 'source-over';

      // paint fps line in new column
      ctxBack.fillStyle = stats.fps > 50 ? '#008800' : '#ee0000';
      ctxBack.fillRect(back.width - off, zero, off, -val);

      ctxBack.globalCompositeOperation = 'copy';

      // move left off pixel column
      ctxBack.drawImage(back, off, 0, back.width - off, back.height, 0, 0, back.width - off, back.height);

      // render front
      ctx.drawImage(back, 0, 0);

      // horizontal lines
      for (i=0; i<3; i++){
        ctx.fillStyle = lineFills[i];
        ctx.fillRect(0, cvs.height/4.5 * (i +1), cvs.width, 1.1);
      }

      // print fps, dur
      ctx.font = '11px monospace'
      ctx.fillStyle = '#ddd';
      ctx.fillText(bufDur.avg().toFixed(1) + 'd',   100, 62);
      ctx.fillText(bufFps.avg().toFixed(1) + 'fps',   0, 62);

    },
    begin: function () {
      stats.now = window.performance.now();
      stats.fps = stats.last ? 1000 / (stats.now - stats.last) : 60;
      bufFps.push(stats.fps);
      stats.last = stats.now;
    },
    end:   function () {
      bufDur.push(window.performance.now() - stats.now);
    },
  };


}());