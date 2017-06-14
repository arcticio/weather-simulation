'use strict';

var SIM = (function () {

  var 
    self,
    renderer,
    camera,

    frame = 0,
    sim,

    $$ = document.querySelectorAll.bind(document),

    image  = $$('.panel.image')[0],

    datagramm = {},
    models    = {},
    
    coordsPool     = new CoordsPool(100000).generate(),

    sunVector      = new THREE.Vector3(),
    sunSphererical = new THREE.Spherical(4, 0, -Math.PI / 2),
    sun            = Orb.SolarSystem().Sun(),

    time = {
      iso:   '',
      start: moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),
      now:   moment.utc(),
      show:  moment.utc('2017-06-13-12', 'YYYY-MM-DD-HH'),
      end:   moment.utc('2017-12-31-18', 'YYYY-MM-DD-HH'),
      model: null,
      interval: 365 * 24, 
      pointer:  NaN,
    },

  end;


  return self = {

    time,
    models,
    datagramm,
    coordsPool,

    init: function () {

      time.pointer = time.now.diff(time.start, 'hours');

      IFC.controllers['DateTime']['choose'].setValue(time.pointer);

    },
    activate: function () {},
    setSimTime: function (val, what) {

      if (typeof val === 'number' && what === undefined) {

        // set hours directly
        time.show = time.start.clone().add(val, 'hours');

      } else if (typeof val === 'number' && typeof what in ['hours', 'days']) {
        time.show = time.start.clone().add(val, what);


      } else if (typeof val === 'number') {

        // set some delta
        time.show.add(val, what);
      
      } else if (val._isAMomentObject) {

        // have a moment
        time.show = val.clone();

      } else {
        console.log('WTF');

      }

      time.iso     = time.show.format('YYYY-MM-DD HH');
      time.pointer = time.now.diff(time.start, 'hours');

      IFC.Hud.time.setSim(time.show);

      IFC.controllers['SimTime'].setValue(time.show.format('YYYY-MM-DD HH:mm'));

      self.updateSun();
      self.updateModels();

    },
    updateModels: function () {

      var hours = time.show.hours() % 6;

      time.model = time.show.clone().hours(hours);

      console.log(time.model.format('YYYY-MM-DD HH:mm'));


    },
    updateSun: function (val) {

      // TODO: adjust for ra
      // https://www.timeanddate.com/scripts/sunmap.php?iso=20170527T1200
      // image && (image.src = '//www.timeanddate.com/scripts/sunmap.php?iso=' + time.show.format('YYYYMMDD[T]HHmm'));

      var orbTime, orbSun;

      // query sun by time
      orbTime = new Orb.Time(time.show.toDate());
      orbSun  = sun.position.equatorial(orbTime);

      //  Spherical( radius, phi, theta )
      sunSphererical.set(4, 0, -Math.PI / 2);
      sunSphererical.phi    -= orbSun.dec * Math.PI / 180;             // raise sun
      sunSphererical.phi    += Math.PI / 2;                            // change coord system
      sunSphererical.theta  -= ( time.show.hour() * (Math.PI / 12) ) ; // rot by planet

      // updates
      sunVector.setFromSpherical(sunSphererical).normalize();
      SCN.updateSun(sunVector);

    },
    load: function (name, cfg, callback) {

      TIM.step('SIM.load.in');

      this.loadModel(cfg, function () {

        if (cfg.subtype === 'multiline'){
          if (SCN.renderer.capabilities.maxVertexUniforms < 4096){
            cfg.amount = 200;
          }
        }

        models[name] = SIM.Model[name].create(cfg, datagramm);
        callback(name, models[name].obj);

        TIM.step('SIM.load.out');

      });

    },
    loadModel: function (cfg, callback) {

      RES.load({
        urls: cfg.sim.data,
        onFinish: function (err, responses) {

          responses.forEach(function (response) {
            var vari, data;
            if (response){
              vari = response.url.split('.').slice(-3)[0];
              data = SIM.Model.parseMultiDods(vari, response.data);
              datagramm[vari] = new SIM.Datagram(data);
            } else {
              console.log('WTF');
            }
          });
          
          callback();

        }
      });    

    },
    step: function () {

      H.each(models, (name, model) => model.step() );

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