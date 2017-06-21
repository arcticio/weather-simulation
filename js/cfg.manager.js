'use strict';

Object.assign(CFG, {

  init: function () {

    var 
      time, coords, position, assets, 
      [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

    if (locHash !== undefined) {
      assets = CFG.hash2assets(locHash);
    }

    if (locTime !== undefined) {
      time = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
      if (!time.isValid()) {
        time = undefined;
      }
    }

    if (locCoords !== undefined) {
      coords = locCoords.split(';').map(Number);
      position = new THREE.Vector3().add({
        x: coords[0] !== undefined ? coords[0] : 2.0,
        y: coords[1] !== undefined ? coords[1] : 2.0,
        z: coords[2] !== undefined ? coords[2] : 2.0,
      });
    }

    // console.log('assets', assets);
    // console.log('time',   time ? time.format('YYYY-MM-DD-HH-mm') : undefined);
    // console.log('coords', coords);

    // enable objects
    H.each(CFG.Objects, (name, cfg) => {
      if (cfg.id){
        cfg.visible = assets.indexOf(cfg.id) !== -1;
      }
    });

    // set cam
    if (position) {
      CFG.Objects.perspective.pos = position;
    }

    // current model time
    if (time) {
      TIMENOW = time.clone();
    }

  },

  hash2assets: function(code){

    var i, layers = [];

    code = H.Base62.toNumber(code);

    function bit (i, test) {return (i & (1 << test));}

    for (i = 0; i < 32; i++){
      if (bit(code, i)){layers.push(i);}
    }

    return layers.sort(function(a, b){return a-b;});

  },

  assets2hash: function(layers){

    var out = 0;

    if (!layers.length) {return null;}

    layers.forEach(function(l){
      out += 1 << l;
    });

    return H.Base62.fromNumber(out);

  },


});
