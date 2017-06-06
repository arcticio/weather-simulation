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
    models = {},
    
    vectorSun = new THREE.Vector3(),

    coordsPool = new CoordsPool(100000).generate(),

    image,

    sun   = Orb.SolarSystem().Sun(),

    time = {
      start: moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),
      now:   moment.utc('2017-05-30-12', 'YYYY-MM-DD-HH'),
      show:  moment.utc('2017-09-30-12', 'YYYY-MM-DD-HH'),
      end:   moment.utc('2017-12-31-00', 'YYYY-MM-DD-HH'),
      interval: 365 * 24, 
    },

    // sectors = [
    //   [ 89.9, -180,  45.0,  180 ], // top
    //   [-45.0, -180, -89.9,  180 ], // bottom
    //   [ 45.0, -180, -45.0,  -90 ], // left back
    //   [ 45.0,  -90, -45.0,    0 ], // left front
    //   [ 45.0,    0, -45.0,   90 ], // right front
    //   [ 45.0,   90, -45.0,  180 ], // right back
    // ],

  end;


  return {

    vectorSun,
    coordsPool,

    boot: function () {
      return self = this;
    },
    init: function () {

      var diff = time.now.diff(time.start, 'hours');

      IFC.controllers['DateTime']['choose'].setValue(diff);

    },
    updateDatetime: function (val) {

      // TODO: adjust for ra
      // https://www.timeanddate.com/scripts/sunmap.php?iso=20170527T1200

      var iso, orbTime, orbSun, sphererical;

      time.show = (typeof val === 'string') ? 
        time.show.clone().add(~~val, 'hours') : 
        time.start.clone().add(val, 'hours') ;

      iso = time.show.format('YYYY-MM-DD HH');
      // image && (image.src = '//www.timeanddate.com/scripts/sunmap.php?iso=' + time.show.format('YYYYMMDD[T]HHmm'));

      // query sun by time
      orbTime = new Orb.Time(time.show.toDate());
      orbSun  = sun.position.equatorial(orbTime);

      //  Spherical(                      radius, phi, theta )
      sphererical = new THREE.Spherical(4, 0, -Math.PI / 2);
      sphererical.phi    -= orbSun.dec * Math.PI / 180;             // raise sun
      sphererical.phi    += Math.PI / 2;                            // change coord system
      sphererical.theta  -= ( time.show.hour() * (Math.PI / 12) ) ; // rot by planet

      // updates
      vectorSun.setFromSpherical(sphererical).normalize();
      SCN.objects.spot.visible       && SCN.objects.spot.position.copy(vectorSun).multiplyScalar(10);
      SCN.objects.sun.visible        && SCN.objects.sun.position.copy(vectorSun).multiplyScalar(10);
      SCN.objects.sunPointer.visible && SCN.objects.sunPointer.setDirection(vectorSun);

      IFC.controllers['SimTime'].setValue(time.show.format('YYYY-MM-DD HH:mm'));

      // console.log(iso, 'dec', posSun.dec, 'ra', posSun.ra);

    },
    load: function (name, config, callback) {

      TIM.step('SIM.load.in');

      // this is testing MultiLInes
      // trailsWind = self.createWind();
      // callback(name, trailsWind.mesh);

      this.loadModel(config, function () {

        models[name] = SIM.Model[name].create(config, datagramm);
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
    createWind: function () {

      var i, j, lat, lon, col,

        amount = TRAIL_NUM,
        length = TRAIL_LEN,
        
        color         = new THREE.Color('rgb(255, 0, 0)'),
        latsStart     = H.linspace( -80,  80, amount), 
        lonsStart     = H.linspace( -60,  60, amount), 

        trailsVectors = new Array(amount).fill(0).map( () => []),
        trailsColors  = new Array(amount).fill(0).map( () => []),
        trailsWidths  = new Array(amount).fill(0).map( () => []),

        convert       = function (latlon) {
          return TOOLS.latLongToVector3(latlon[0], latlon[1], CFG.earth.radius, 0.01);
        },

      end;

      for (i=0; i<amount; i++) {

        col   = 0;
        lat   = latsStart[i];
        lon   = lonsStart[i];

        for (j=0; j<length; j++) {

          trailsVectors[i].push(convert([lat, lon]));
          trailsColors[i].push(new THREE.Color('hsl(' + (col + 360/length) + ', 60%, 45%)'));  // 45=nice
          trailsWidths[i].push(1);

          lat += (90 - 80) / length;
          lon += 240/length;
          col += 360/length;

        }

      }

      // preset uniforms, etc
      trailsWind = new Multiline(trailsVectors, trailsColors, trailsWidths, {
        color:     new THREE.Color('#ff0000'),
        opacity:   0.8,
        section:   10 / length, // %
        lineWidth: (CFG.earth.radius * Math.PI) / amount,  // world coords
      });

      return trailsWind;
      
    },
    createClouds: function () {

      var t0 = Date.now(), i, j, lat, lon, 


      end;





    },

    step: function () {

      H.each(models, (name, model) => model.step() )

      frame += 1;

    },
    start: function () {},
    stop: function () {},
    pause: function () {},
    activate: function () {
    },
    resize: function () {
    },
    Pool: function (sector, ) {

      //  1     256
      //  4    1024
      // 16    4096
      // 64   16384
      //    + =====
      // 85   21760



      // if only 1 pool visible exannd

      // toggle() , adds/subs self to/from scene

      // sector[4],
      // coords[n],
      // meshlines[n], // max length 
      // isInView(),
      // deepness {0, }, // one sec to full

      // expand(), shrink(),

    },


  };

}()).boot();






/*



// https://stackoverflow.com/questions/44098678/how-to-rotate-a-vector3-using-vector2

//  For winds, the u wind is parallel to the x axis. 
// A positive u wind is from the west. 
// A negative u wind is from the east. 
// The v wind runs parallel to the y axis. 
// A positive v wind is from the south, and a negative v wind is from the north.











*/