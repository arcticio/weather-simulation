
'use strict';

Object.assign(CFG, {

  init: function () {

    var 
      time, coords, position, assets, defAssets = [],
      [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

    // H.each(CFG.Objects, (name, cfg) => {
    //   if (cfg.visible){
    //     defAssets.push(cfg.id);
    //   }
    // });

    // TODO: rethink invalid and default values for all

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

    CFG.Preset.init();
    IFC.initGUI();

  },

  hash2assets: function(hash){

    var i, digits, assets = [];

    digits = H.Base62.toNumber(hash);

    function bit (i, test) {return (i & (1 << test));}

    for (i = 0; i < 32; i++){
      if (bit(digits, i)){assets.push(i);}
    }

    return assets.sort( (a, b) => a - b );

  },

  assets2hash: function(assets){

    var out = 0;

    if (!assets.length) {return null;}

    assets.forEach(function(l){
      out += 1 << l;
    });

    return H.Base62.fromNumber(out);

  },

});
