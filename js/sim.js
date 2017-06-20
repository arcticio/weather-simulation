'use strict';

var SIM = (function () {

  var 
    self,
    renderer,
    camera,

    frame          = 0,
    sim,

    $$             = document.querySelectorAll.bind(document),

    image          = $$('.panel.image')[0],

    datagrams      = {}, // all models share GFS data
    models         = {},
    
    coordsPool     = null, 

    sunVector      = new THREE.Vector3(),
    sunSphererical = new THREE.Spherical(4, 0, -Math.PI / 2),
    sun            = Orb.SolarSystem().Sun(),

    timerange      = new TimeRange(),

    time = {
      iso:         '',
      doe:         NaN,
      start:       moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),  // give full year, no purpose
      end:         moment.utc('2017-12-31-18', 'YYYY-MM-DD-HH'),  // complete full year

      now:         moment.utc(),                                  // now, plus init show
      // show:        moment.utc('2017-06-13-12', 'YYYY-MM-DD-HH'),  // shown on screen
      model:       null,
      interval:    NaN,                                      // only calc full hours
      pointer:     NaN,                                           // coming from interface
    },

  end;


  return self = {

    time,
    models,
    datagrams,
    coordsPool,
    timerange,
    sunVector,

    init: function () {

      var t0 = Date.now();

      coordsPool = self.coordsPool = new CoordsPool(CFG.Sim.coordspool.amount).generate();

      time.interval = 6 * 60 * 60 * 1000; //SIM.Tools.minutesYear() * 60;

      time.now   = TIMENOW.clone();
      time.model = TIMENOW.clone();
      time.doe   = self.calcdoe(time.model);

      TIM.step('SIM.time', 'time.now',   time.now.format('YYYY-MM-DD HH[:]mm'));
      TIM.step('SIM.time', 'time.model', time.model.format('YYYY-MM-DD HH[:]mm'));

      TIM.step('Pool.generate', Date.now() - t0);

    },
    activate: function () {

      // IFC.controllers['DateTime']['choose'].setValue(time.pointer);
      // SCN.updateSun(sunVector);
      
      // self.setSimTime();

    },
    setSimTime: function (val, what) {

      if (val === undefined && what === undefined) {
        // init
        time.model = TIMENOW;

      } else if (typeof val === 'number' && what === undefined) {

        // set hours directly
        time.model = time.start.clone().add(val, 'hours');

      } else if (typeof val === 'number' && ['minutes', 'hours', 'days'].indexOf(what) !== -1 ) {

        // add/sub some diff
        // time.show = time.start.clone().add(val, what);
        time.model.add(val, what);

      } else if (typeof val === 'number') {

        // set some delta
        debugger;
        time.model.add(val, what);
      
      } else if (val._isAMomentObject) {

        // have a moment
        time.model = val.clone();

      } else {
        console.log('WTF');

      }

      // display
      time.iso = time.model.format('YYYY-MM-DD HH');

      // fixed at avail data
      time.doe = self.calcdoe(time.model);

      IFC.Hud.time.render();

      self.updateSun();
      self.updateModels();

    },
    calcdoe: function (mom) {
      // rstrict now at avail dods
      var tmp = mom.clone().hours(mom.hours() - (mom.hours() % 6));
      return H.date2doeFloat(tmp.toDate());
    },
    mom2doe: function (mom) {return mom.toDate() / 864e5},
    doe2mom: function (doe) {return moment.utc(doe * 864e5)},
    updateModels: function () {

      H.each(models, (name, model) => model.prepare(time.doe) );

      console.log('SIM.updateModelsel', time.doe, time.model.format('YYYY-MM-DD HH:mm'));

    },
    updateSun: function (val) {

      // TODO: adjust for ra
      // https://www.timeanddate.com/scripts/sunmap.php?iso=20170527T1200
      // image && (image.src = '//www.timeanddate.com/scripts/sunmap.php?iso=' + time.show.format('YYYYMMDD[T]HHmm'));

      var orbTime, orbSun;

      // query sun by time
      orbTime = new Orb.Time(time.model.toDate());
      orbSun  = sun.position.equatorial(orbTime);

      //  Spherical( radius, phi, theta )
      sunSphererical.set(4, 0, -Math.PI / 2);
      sunSphererical.phi    -= orbSun.dec * Math.PI / 180;             // raise sun
      sunSphererical.phi    += Math.PI / 2;                            // change coord system
      sunSphererical.theta  -= ( time.model.hour() * (Math.PI / 12) ) ; // rot by planet

      // updates
      sunVector.setFromSpherical(sunSphererical).normalize();
      SCN.updateSun(sunVector);

    },
    loadModel: function (name, cfg, callback) {

      var 
        vari, 
        factory = SIM.Models[name],
        model   = factory.create(cfg, datagrams),
        urls    = model.calcUrls(self.doe2mom(time.doe));

      models[name] = model;

      RES.load({ 
        urls,
        onFinish: function (err, responses) {

          if (err) { throw err } else {

            responses.forEach(function (response) {

              vari = response.url.split('.').slice(-3)[0];

              if (!datagrams[vari]) {
                datagrams[vari] = new SIM.Datagram(vari).parse(time.doe, response.data);

              } else {
                datagrams[vari].parse(time.doe, response.data);

              }

              factory.prepare(time.doe);

            });
            
            TIM.step('SIM.load', vari, time.doe);

            // return 3D object to scene
            callback(name, models[name].obj);

          }

        }
      });    

    },
    step: function (frame, deltatime) {

      H.each(models, (name, model) => model.step(frame, deltatime) );

      frame += 1;

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