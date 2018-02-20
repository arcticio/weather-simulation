
CFG.Manager = (function () {

  var 
    self, 
    assets = [], // found in URL
    urlMom,      // found in URL
    urlCoords,   // found in URL
    position,
    activated = Object.assign({}, CFG.Activated, {
      /* name: id*/
    })
  ;

  return self = {

    urlMom,

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
      self.parseUrl();

      if (user.loc_detected) {
        TIM.step('CFG.User', 'lat:', user.latitude, 'lon:', user.longitude, user.country_code, user.country_name);
      
      } else {
        TIM.step('CFG.User', 'location unknown');
        
      }

    },

    download: function () {

      var 
        system = Object.assign({

          version:   VERSION,
          timestamp: new Date(),
          location:  location.href,
          runtime:   '',

        }, {

          User:       CFG.User,
          Device:     CFG.Device, 
          Connection: CFG.Connection, 

        }),
        json   = JSON.stringify(system, null, 2),
        blob = new Blob([json], {type: 'text/plain;charset=utf-8'})
      ;

      saveAs(blob, 'hypatia.debug.txt');

    },

    location: function (response) {
      // called by geojson in HTML
      Object.assign(CFG.User, response);
      CFG.User.loc_detected = !!(CFG.User.latitude || CFG.User.longitude);
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

    probeLocalTime: function () {

      // https://en.wikipedia.org/wiki/ISO_8601
      // https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations

      try {

        if (Intl && Intl.DateTimeFormat) {
          //  IANA time zone , e.g. Europe/Berlin
          CFG.User.localtime.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        } else {
          CFG.User.localtime.timezone = moment.tz.guess();
        
        }

        // minutes
        CFG.User.localtime.offset = new Date().getTimezoneOffset(); 

        // e.g. CEST
        CFG.User.localtime.abbeviation = new Date().toString().replace(/.*[(](.*)[)].*/,'$1');

        TIM.step('local time', JSON.stringify(CFG.User.localtime, null, 2));

      } catch(e) { console.log('probeLocalTime', e) ;}

    },

    probeFullscreen: function () {

      if (screenfull.enabled){
        CFG.Device.canFullScreen = true;
        var img = document.querySelectorAll('.btnFullscreen')[0];
        img.src = 'images/fullscreen.grey.png';
        img.onclick = function () {
          LDR.goFullscreen();
          img.src='images/transparent.png';
        }
      }

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

      if (CFG.Connection.secure) {
        window.addEventListener('devicemotion',      onMotion, false);
        window.addEventListener('deviceorientation', onOrientation, false);
      }

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
        isFirefox ? 'Firefox' :
        isSafari  ? 'Safari'  :
        isIE      ? 'IE'      :
        isEdge    ? 'Edge'    :
        isChrome  ? 'Chrome'  :
        isBlink   ? 'Blink'   :
          'unknown'
      );

      // Test via a getter in the options object to see if the passive property is accessed
      // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
      try {
        var opts = Object.defineProperty({}, 'passive', {
          get: function() {
            CFG.Device.supportsPassive = true;
          }
        });
        window.addEventListener('test', null, opts);
      } catch (e) { /* not needed */ }

      // https://github.com/eligrey/FileSaver.js
      try {
        CFG.Device.isFileSaverSupported = !!new Blob;
      } catch (e) { /* not needed */ }

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

    parseUrl: function () {

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

      // debug overview
      console.log('activated', JSON.stringify(activated, null, 2));


      // DateTime from URL
      // TODO: ensure within range
      if (locTime) {
        urlMom = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
        if (!urlMom.isValid()) {
          urlMom = undefined;
        }
      }

      // DateTime failsafe
      if (!urlMom) {
        urlMom = TIMENOW ? TIMENOW : moment.utc();
      }

      // expose // TODO: check range of obs
      self.urlMom = urlMom;

      // Coords from URL
      if (locCoords) {
        urlCoords = locCoords.split(';').map(Number);
        if (urlCoords.length === 3){
          position = new THREE.Vector3().add({
            x: urlCoords[0] !== undefined ? urlCoords[0] : 2.0,
            y: urlCoords[1] !== undefined ? urlCoords[1] : 2.0,
            z: urlCoords[2] !== undefined ? urlCoords[2] : 2.0,
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

      // update cam config from url
      CFG.Camera.pos = position;

    },


  // helper

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
