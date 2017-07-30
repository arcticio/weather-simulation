
var SIM = (function () {

  var 
    self,

    $$             = document.querySelectorAll.bind(document),

    image          = $$('.panel.image')[0],  // debug sun

    coordsPool     = null, 
    poolJetStream  = NaN,

    models         = {},
    datagrams      = {}, // all models share GFS data

    sun            = Orb.SolarSystem().Sun(),
    sunVector      = new THREE.Vector3(),             // pos of real sun
    sunDirection   = new THREE.Vector3(),             // dir of real sun
    sunSphererical = new THREE.Spherical(4, 0, -PI2),
    sunPosition    = new THREE.Vector3(),             // pos of lights 

    timeranges     = dataTimeRanges['hypatia'],       // timeranges.js

    time = {
      iso:         '',
      doe:         NaN,                                           // day of epoch
      start:       moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),  // give full year, no purpose
      end:         moment.utc('2017-12-31-18', 'YYYY-MM-DD-HH'),  // complete full year
      now:         moment.utc(),                                  // now, plus init show
      model:       null,                                          //  what's shown
      range:       H.range(-12, 66, 6),
      stamps:      null,
      mindoe:      NaN,
      maxdoe:      NaN,
      fmtDay:      '',
      fmtHour:     '',
    },

    unique = 100

  ;

  return self = {

    Models: {},

    time,
    models,
    datagrams,
    coordsPool,
    sunPosition,
    sunDirection,

    mom2doe: function (mom) {return mom.toDate() / 864e5},
    doe2mom: function (doe) {return moment.utc(doe * 864e5)},

    init: function () {

      var t0 = Date.now();

      coordsPool = self.coordsPool = new CoordsPool(CFG.Sim.coordspool.amount).generate();

      poolJetStream = new CoordsPool().latlonArray(5000);

      TIM.step('Pool.generate', Date.now() - t0, 'ms', CFG.Sim.coordspool.amount);

      // SIM.Charts.init();

    },
    setSimTime: function (val, what) {

      // var mom;

      if (val === undefined && what === undefined) {

        time.model  = CFG.Manager.urlMom;
        time.doe    = self.mom2doe(time.model);

        // debug: mod to 00, 06, 12, 18
        // time.model  = mom.clone().hours(mom.hours() - (mom.hours() % 6));  

        time.stamps = time.range.map( h => time.model.clone().add( h, 'hours') );
        time.length = time.stamps.length;

        time.mindoe = self.mom2doe(time.stamps[0]);
        time.maxdoe = self.mom2doe(time.stamps.slice(-1)[0]);

        TIM.step('SIM.time.set', 'model', time.model.format('YYYY-MM-DD HH[:]mm'), time.doe.toFixed(2));


      } else if (typeof val === 'number' && what === undefined) {

        // set hours directly
        time.model = time.start.clone().add(val, 'hours');

      } else if (typeof val === 'number' && ['minutes', 'hours', 'days'].indexOf(what) !== -1 ) {

        // add/sub some diff
        time.model.add(val, what);

      } else if (typeof val === 'number') {

        // set some delta
        debugger;
        time.model.add(val, what);
      
      } else if (val._isAMomentObject) {

        // have a moment
        time.model = val.clone();

      } else {
        debugger;
        console.log('WTF');

      }

      // don't overshoot
      time.model = (
        time.model.valueOf() > time.stamps[time.stamps.length -1].valueOf() ?
          time.stamps[time.stamps.length -1] :
          time.model
      );

      // display
      time.iso = time.model.format('YYYY-MM-DD HH');

      // gfs data
      time.doe = self.mom2doe(time.model);

      // hud
      time.fmtDay  = time.model.format('YYYY-MM-DD');
      time.fmtHour = time.model.format('HH:mm [UTC]');

      // enforce pushstate update
      IFC.urlDirty = true;

    },

    updateSun: function () {

      // TODO: adjust for ra
      // https://www.timeanddate.com/scripts/sunmap.php?iso=20170527T1200
      // image && (image.src = '//www.timeanddate.com/scripts/sunmap.php?iso=' + time.show.format('YYYYMMDD[T]HHmm'));

      var orbTime, orbSun, theta, phi;

      // query sun by time
      orbTime = new Orb.Time(time.model.toDate());
      orbSun  = sun.position.equatorial(orbTime);
      theta   = (time.model.hour() + time.model.minutes() / 60) * (TAU / 24);
      phi     = orbSun.dec * PI / 180 - PI2;

      //  Spherical( radius, phi, theta )
      sunSphererical.set(4, 0, -PI2);
      sunSphererical.theta -= theta;
      sunSphererical.phi   -= phi;

      // updates
      sunVector.setFromSpherical(sunSphererical);
      sunDirection.copy(sunVector).normalize();
      sunPosition.copy(sunDirection).multiplyScalar(CFG.Sun.radius);

    },
    calcVariTimes: function (name, cfg) {

      var 
        range = timeranges[cfg.sim.variable],
        step  = cfg.sim.step,
        times = {
          mindoe: NaN,
          maxdoe: NaN,
          does:   [],
          moms:   [],
        },
        mom      = moment.utc(range[0], 'YYYY-MM-DD-HH'),
        momLast  = moment.utc(range[1], 'YYYY-MM-DD-HH')
      ;

      while (mom.valueOf() <= momLast.valueOf()) {
        times.moms.push(mom.clone());
        times.does.push(SIM.mom2doe(mom));
        mom.add(step[0], step[1]);
      }

      times.length = times.does.length;
      times.mindoe = times.does[0];
      times.maxdoe = times.does[times.length -1];

      TIM.step('SIM.times', name, range, times.length, times.mindoe, times.maxdoe);

      return times;

    },

    loadVariableParallel: function (name, cfg, onloaded) {

      !SIM.Models[name] && console.log('Model: "' + name + '" not avail, have:', Object.keys(SIM.Models));

      var 
        times = self.calcVariTimes(name, cfg),
        model = SIM.Models[name].create(cfg, times)
      ;

      model.prepare(name, onloaded);

    },

    loadVariable: function (name, cfg, callback) {

      !SIM.Models[name] && console.log('Model: "' + name + '" not avail, have:', Object.keys(SIM.Models));

      var 
        vari, datagramm,
        times = self.calcVariTimes(name, cfg),
        model = SIM.Models[name].create(cfg, times)
      ;

      models[name] = model;

      RES.load({ urls: model.urls, onFinish: function (err, responses) {

        if (err) { throw err } else {

          responses.forEach(function (response) {

            datagramm = new SIM.Datagram(response.data);
            vari = datagramm.vari;

            if (!datagrams[vari]) {
              datagrams[vari] = datagramm;

            } else {
              datagrams[vari].append(datagramm);

            }

          });

          model.prepare();
          
          TIM.step('SIM.load', vari, time.doe);

          // return 3D object to scene
          callback(name, models[name].obj);

        }

      }});    

    },

  };

}());

/*

// https://stackoverflow.com/questions/44098678/how-to-rotate-a-vector3-using-vector2

//  For winds, the u wind is parallel to the x axis. 
// A positive u wind is from the west. 
// A negative u wind is from the east. 
// The v wind runs parallel to the y axis. 
// A positive v wind is from the south, and a negative v wind is from the north.

*/