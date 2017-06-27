
'use strict';


CFG.Manager = (function () {

  var self;

  return self = {
    boot: function () {

      var 
        now = moment(), 
        timestamp, 
        duration;

      Object.assign(CFG, {
        init:        self.init,
        debug:       self.debug,
        assets2hash: self.assets2hash,
      });

      window.onunload = function () {
        store.set('timestamp', moment().valueOf());
      }

      var timestamp = store.get('timestamp');

      if (!timestamp){
        TIM.step('STR.init', 'new user detected')
        store.clearAll();
        store.set('timestamp', now.valueOf());
      
      } else {
        duration = moment.duration(now.valueOf() - timestamp);
        TIM.step('STR.init', 'last use ' + duration.humanize() + ' ago');

      }

    },

    init: function () {

      var 
        position, defAssets = [],
        assets = [], time, coords, 
        [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

      // Assets from URL
      if (locHash) {
        assets = self.hash2assets(String(locHash));
      }

      // Assets failsafe
      if (!assets.length){
        assets = [
          CFG.Objects.background.id,
          CFG.Objects.ambient.id,
          CFG.Objects.spot.id,
          CFG.Objects.sun.id,
          CFG.Objects.basemaps.id,
        ];
      }

      // DateTime from URL
      // TODO: ensure within range
      if (locTime) {
        time = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
        if (!time.isValid()) {
          time = undefined;
        }
      }

      // DateTime failsafe
      if (!time) {
        time = TIMENOW ? TIMENOW : moment.utc();
      }

      // Coords from URL
      if (locCoords) {
        coords = locCoords.split(';').map(Number);
        if (coords.length === 3){
          position = new THREE.Vector3().add({
            x: coords[0] !== undefined ? coords[0] : 2.0,
            y: coords[1] !== undefined ? coords[1] : 2.0,
            z: coords[2] !== undefined ? coords[2] : 2.0,
          });

        }
      }

      // Coords failsafe
      if (!position) {
        position = TOOLS.latLongToVector3(
          CFG.User.latitude,
          CFG.User.longitude,
          CFG.earth.radius,
          3
        )
      }

      // rewrite CFG.Objects visibility to enable objects
      H.each(CFG.Objects, (name, cfg) => {
        if (cfg.id !== undefined){
          cfg.visible = assets.indexOf(cfg.id) !== -1;
        }
      });

      // update cam
      CFG.Objects.perspective.pos = position;

      // TODO: Is this the right place for preset handling
      CFG.Preset.init();

      // init gui.dat
      IFC.initGUI();

    },

    number2assets: function(digits){ 

      // CFG.number2assets(0xFFFFFFFF)

      var i, assets = [];

      function bit (i, test) {return (i & (1 << test));}

      for (i = 0; i < 32; i++){
        if (bit(digits, i)){assets.push(i);}
      }

      return assets.sort( (a, b) => a - b );

    },
    hash2assets: function(hash){

      var i, digits, assets = [];

      digits = H.Base62.toNumber(String(hash));

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

    debug: function ( /* args */ ) {

      var 
        out  = {}, 
        args = [...arguments],
        has  = function (a, item) {
          return a.indexOf(item) !== -1;
        };

      H.each(CFG.Objects, (name, cfg) => {

        out[name] = {id: cfg.id || '-'};

        H.each(cfg, (option, value) => {

          if (option === 'id' || has(args, option)) {
            out[name][option] = value;
          }

        });

      });

      console.log(JSON.stringify(out, null, 2));

    }

  };

}()).boot();



// Object.assign(CFG, {

//   init: function () {

//     var 
//       position, defAssets = [],
//       assets = [], time, coords, 
//       [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

//     // Assets from URL
//     if (locHash) {
//       assets = CFG.hash2assets(String(locHash));
//     }

//     // Assets failsafe
//     if (!assets.length){
//       assets = [
//         CFG.Objects.background.id,
//         CFG.Objects.ambient.id,
//         CFG.Objects.spot.id,
//         CFG.Objects.sun.id,
//         CFG.Objects.basemaps.id,
//       ];
//     }

//     // DateTime from URL
//     // TODO: ensure within range
//     if (locTime) {
//       time = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
//       if (!time.isValid()) {
//         time = undefined;
//       }
//     }

//     // DateTime failsafe
//     if (!time) {
//       time = TIMENOW ? TIMENOW : moment.utc();
//     }

//     // Coords from URL
//     if (locCoords) {
//       coords = locCoords.split(';').map(Number);
//       if (coords.length === 3){
//         position = new THREE.Vector3().add({
//           x: coords[0] !== undefined ? coords[0] : 2.0,
//           y: coords[1] !== undefined ? coords[1] : 2.0,
//           z: coords[2] !== undefined ? coords[2] : 2.0,
//         });

//       }
//     }

//     // Coords failsafe
//     if (!position) {
//       position = TOOLS.latLongToVector3(
//         CFG.User.latitude,
//         CFG.User.longitude,
//         CFG.earth.radius,
//         3
//       )
//     }

//     // rewrite CFG.Objects visibility to enable objects
//     H.each(CFG.Objects, (name, cfg) => {
//       if (cfg.id !== undefined){
//         cfg.visible = assets.indexOf(cfg.id) !== -1;
//       }
//     });

//     // update cam
//     CFG.Objects.perspective.pos = position;

//     // TODO: Is this the right place for preset handling
//     CFG.Preset.init();

//     // init gui.dat
//     IFC.initGUI();

//   },

//   number2assets: function(digits){ 

//     // CFG.number2assets(0xFFFFFFFF)

//     var i, assets = [];

//     function bit (i, test) {return (i & (1 << test));}

//     for (i = 0; i < 32; i++){
//       if (bit(digits, i)){assets.push(i);}
//     }

//     return assets.sort( (a, b) => a - b );

//   },
//   hash2assets: function(hash){

//     var i, digits, assets = [];

//     digits = H.Base62.toNumber(String(hash));

//     function bit (i, test) {return (i & (1 << test));}

//     for (i = 0; i < 32; i++){
//       if (bit(digits, i)){assets.push(i);}
//     }

//     return assets.sort( (a, b) => a - b );

//   },

//   assets2hash: function(assets){

//     var out = 0;

//     if (!assets.length) {return null;}

//     assets.forEach(function(l){
//       out += 1 << l;
//     });

//     return H.Base62.fromNumber(out);

//   },

//   debug: function ( /* args */ ) {

//     var 
//       out  = {}, 
//       args = [...arguments],
//       has  = function (a, item) {
//         return a.indexOf(item) !== -1;
//       };

//     H.each(CFG.Objects, (name, cfg) => {

//       out[name] = {id: cfg.id || '-'};

//       H.each(cfg, (option, value) => {

//         if (option === 'id' || has(args, option)) {
//           out[name][option] = value;
//         }

//       });

//     });

//     console.log(JSON.stringify(out, null, 2));

//   }

// });
