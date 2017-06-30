
'use strict';

CFG.Manager = (function () {

  var 
    self, 
    assets = [],
    position,
    time
  ;

  return self = {
    boot: function () {

      Object.assign(CFG, {
        debug:       self.debug,
        location:    self.location,
      });

      return self;

    },

    location: function (response) {

      Object.assign(CFG.User, response);
      CFG.User.loc_detected = (CFG.User.latitude || CFG.User.longitude);

    },

    probeDevice: function () {

      function onMotion (event) {
        if (event.accelerationIncludingGravity.x !== null) {
          CFG.Device.canOrientation = true;
          TIM.step('CFG.device', 'devicemotion detected')
        }
        window.removeEventListener('devicemotion', onMotion, false);
      }

      function onOrientation (event) {
        if (event.alpha !== null) {
          CFG.Device.canOrientation = true;
        TIM.step('CFG.device', 'deviceorientation detected');
        }
        window.removeEventListener('deviceorientation', onOrientation, false);
      }

      window.addEventListener('devicemotion', onMotion, false);
      window.addEventListener('deviceorientation', onOrientation, false);

    },

    init: function () {

      var user = CFG.User;

      self.initStore();
      self.sanitizeUrl();

      if (user.loc_detected) {
        TIM.step('CFG.User', 'lat:', user.latitude, 'lon:', user.longitude, user.country_code, user.country_name);
      } else {
        TIM.step('CFG.User', 'location unknown');
      }


      // rewrite CFG.Objects visibility to enable objects from url
      // and enable always on assets without id (cam, etc.)

      H.each(CFG.Objects, (name, cfg) => {
        if (cfg.id !== undefined){
          cfg.visible = assets.indexOf(cfg.id) !== -1;
        } else {
          cfg.visible = true;
        }
      });

      // update cam config
      CFG.Camera.pos = position;

      // TODO: Is this the right place for preset handling?
      CFG.Preset.init();

      // init gui.dat
      IFC.initGUI();

    },

    initStore: function () {

      var 
        now = moment(), 
        timestamp = store.get('timestamp'), 
        duration;

      window.onunload = function () {
        store.set('timestamp', moment().valueOf());
      }

      if (!timestamp){
        TIM.step('DBS.init', 'new user detected')
        store.clearAll();
        store.set('timestamp', now.valueOf());
      
      } else {
        duration = moment.duration(now.valueOf() - timestamp);
        TIM.step('DBS.init', 'last use ' + duration.humanize() + ' ago');

      }

    },

    sanitizeUrl: function () {

      var 
        time, coords, 
        [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

      // Assets from URL
      if (locHash) {
        // 0 => default value
        assets = locHash === '0' ? [] : self.hash2assets(String(locHash));
      }

      // TODO: ensure at least some visibility
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

      // overwrite position outside earth from defaults
      if (position.length() < CFG.earth.radius + 0.01){
        position = CFG.Camera.pos.clone();
      }

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
