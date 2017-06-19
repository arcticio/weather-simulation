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
      now:         moment.utc(),                                  // now, plus init show
      // show:        moment.utc('2017-06-13-12', 'YYYY-MM-DD-HH'),  // shown on screen
      end:         moment.utc('2017-12-31-18', 'YYYY-MM-DD-HH'),  // complete full year
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

      coordsPool = self.coordsPool = new CoordsPool(100000).generate();

      time.interval = 60 * 60 * 1000; //SIM.Tools.minutesYear() * 60;

      time.now   = TIMENOW.clone();
      time.model = TIMENOW.clone();
      time.doe   = H.date2doeFloat(time.model.toDate());

      // time.pointer = time.now.diff(time.start, 'hours');
      // timerange.push(dataTimeRanges['3d-simulation'][0]);

      console.log('time.now',  time.now.format('YYYY-MM-DD HH[:]mm'));
      console.log('time.model', time.model.format('YYYY-MM-DD HH[:]mm'));

      TIM.step('Pool.generate', Date.now() - t0);

    },
    activate: function () {

      // IFC.controllers['DateTime']['choose'].setValue(time.pointer);
      // SCN.updateSun(sunVector);

    },
    setSimTime: function (val, what) {

      if (typeof val === 'number' && what === undefined) {

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

      // time.show    = SIM.Tools.momRestrictToInterval(time.show, time.interval);
      time.iso  = time.model.format('YYYY-MM-DD HH');
      time.doe  = H.date2doeFloat(time.model.toDate());

      // time.pointer = time.now.diff(time.start, 'hours');

      IFC.Hud.time.render();

      // IFC.controllers['SimTime'].setValue(time.show.format('YYYY-MM-DD HH:mm'));

      self.updateSun();
      self.updateModels();

    },
    updateModels: function () {

      // time.model = SIM.Tools.momRestrictToInterval(time.show, time.interval * 6);

      // var hours = time.show.hours() % 6;

      // time.model = time.show.clone().hours(-time.show.hours()).hours(hours);

      console.log(time.model.format('YYYY-MM-DD HH:mm'));

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
    adjust: function (mom) {
      return mom.clone().hours(mom.hours() - (mom.hours() % 6));
    },
    loadModel: function (name, cfg, callback) {

      var 
        urls, 
        model, 
        factory = SIM.Models[name];

      model = models[name] = factory.create(cfg, datagrams);
      urls  = factory.calcUrls(self.adjust(SIM.time.model));

      RES.load({ urls,
        onFinish: function (err, responses) {

          responses.forEach(function (response) {

            var vari, data;

            if (response){

              vari = response.url.split('.').slice(-3)[0];
              // data = SIM.Parser.parseMultiDods(vari, response.data);

              datagrams[vari] = new SIM.Datagram(vari).parse(time.doe, response.data);

              factory.prepare(SIM.time.model, datagrams);

            } else {
              console.log('WTF');
            }

          });
          
          console.log(factory.calcUrls(SIM.time.model));

          // return 3D object to scene
          callback(name, model.obj);

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