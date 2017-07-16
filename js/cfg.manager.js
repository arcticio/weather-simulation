
CFG.Manager = (function () {

  var 
    self, 
    assets = [], // found in URL
    simtime,     // found in URL
    simcoords,   // found in URL
    position,
    activated = Object.assign({}, CFG.Activated, {
      /* name: id*/
    })
  ;

  return self = {

    assets,
    activated,
    
    boot: function () {
      CFG.debug    = self.debug;
      CFG.location = self.location;
      return self;
    },
    init: function () {

      // called BEFORE launch sequence

      var user = CFG.User;

      self.initStore();
      self.probeFullscreen();
      self.sanitizeUrl();

      if (user.loc_detected) {
        TIM.step('CFG.User', 'lat:', user.latitude, 'lon:', user.longitude, user.country_code, user.country_name);
      } else {
        TIM.step('CFG.User', 'location unknown');
      }

      // update cam config
      CFG.Camera.pos = position;

    },

    probeFullscreen: function () {

      if (screenfull.enabled){
        var img = document.querySelectorAll('.btnFullscreen')[0];
        img.src = 'images/fullscreen.grey.png';
      }

    },
    lockOrientation: function (orientation) {

      // https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation

      var 
        locker1 = (
          ('orientation' in screen) && 
          (typeof screen.orientation.lock   === 'function') && 
          (typeof screen.orientation.unlock === 'function')
        ),
        locker2 = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation
      ;

      // Chrome
      if (locker1) {
        screen.orientation.lock(orientation).then(
          function() {
            TIM.step('CFG.lock', orientation);
          },
          function() {
            TIM.step('CFG.lock', 'failed');
          }
        );

      } else {

        if (locker2 && locker2(orientation)) {
          TIM.step('CFG.lock', orientation);

        } else {
          TIM.step('CFG.lock', 'failed');

        }

      }

    },

    location: function (response) {
      // called by geojson
      Object.assign(CFG.User, response);
      CFG.User.loc_detected = (CFG.User.latitude || CFG.User.longitude);
    },

    probeDevice: function () {

      function onMotion (event) {
        if (event.accelerationIncludingGravity.x !== null) {
          CFG.Device.canOrientation = true;
          TIM.step('CFG.device', 'devicemotion detected', 'interval', event.interval)
        }
        window.removeEventListener('devicemotion', onMotion, false);
      }

      function onOrientation (event) {
        if (event.alpha !== null) {
          CFG.Device.canOrientation = true;
          TIM.step('CFG.device', 'deviceorientation detected', 'absolute', event.absolute);
        }
        window.removeEventListener('deviceorientation', onOrientation, false);
      }

      function ondeviceproximity (event) {
        CFG.Device.canDeviceProximitry = true;
        TIM.step('CFG.device', 'deviceproximity detected', event);
        window.removeEventListener('deviceproximity', ondeviceproximity, false);
      }

      function onuserproximity (event) {
        CFG.Device.canUserProximitry = true;
        TIM.step('CFG.device', 'userproximity detected', event);
        window.removeEventListener('userproximity', onuserproximity, false);
      }

      window.addEventListener('devicemotion',      onMotion, false);
      window.addEventListener('deviceorientation', onOrientation, false);
      window.addEventListener('deviceproximity',   ondeviceproximity, false);
      window.addEventListener('userproximity',     onuserproximity, false);


      // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

      var 
        isOpera   = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
        isFirefox = typeof InstallTrigger !== 'undefined',
        isSafari  = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === '[object SafariRemoteNotification]'; })(!window['safari'] || safari.pushNotification),
        isIE      = /*@cc_on!@*/false || !!document.documentMode,
        isEdge    = !isIE && !!window.StyleMedia,
        isChrome  = !!window.chrome && !!window.chrome.webstore,isBlink = (isChrome || isOpera) && !!window.CSS
      ;

      CFG.Device.browser = (
        isOpera   ? 'Opera'   :
        isFirefox ? 'Forefox' :
        isSafari  ? 'Safari'  :
        isIE      ? 'IE'      :
        isEdge    ? 'Edge'    :
        isChrome  ? 'Chrome'  :
        isBlink   ? 'Blink'   :
          'unknown'
      );

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
        intersect, 
        [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

      // Assets from URL
      if (locHash) {
        // 0 => default value
        assets = self.assets = (locHash === '0') ? [] : self.hash2assets(String(locHash));
      }

      // populate activated from assets
      H.each(CFG.Assets, ( name, cfg ) => {

        if (cfg.index !== undefined && H.contains(assets, cfg.index) ) {
          activated[name] = cfg.index;

        } else if (cfg.ids !== undefined) {
          intersect = H.intersect(assets, cfg.ids);
          if (intersect.length) {
            activated[name] = intersect[0];
          }

        }

      });

      console.log('activated', JSON.stringify(activated, null, 2));


      // DateTime from URL
      // TODO: ensure within range
      if (locTime) {
        simtime = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
        if (!simtime.isValid()) {
          simtime = undefined;
        }
      }

      // DateTime failsafe
      if (!simtime) {
        simtime = TIMENOW ? TIMENOW : moment.utc();
      }

      // Coords from URL
      if (locCoords) {
        simcoords = locCoords.split(';').map(Number);
        if (simcoords.length === 3){
          position = new THREE.Vector3().add({
            x: simcoords[0] !== undefined ? simcoords[0] : 2.0,
            y: simcoords[1] !== undefined ? simcoords[1] : 2.0,
            z: simcoords[2] !== undefined ? simcoords[2] : 2.0,
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

      H.each(CFG.Assets, (name, cfg) => {

        out[name] = {index: cfg.index || '-'};

        H.each(cfg, (option, value) => {

          if (option === 'index' || has(args, option)) {
            out[name][option] = value;
          }

        });

      });

      console.log(JSON.stringify(out, null, 2));

    }

  };

}()).boot();
