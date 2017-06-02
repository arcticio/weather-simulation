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

    trails = [],
    
    trailsWind = {
      obj:     new THREE.Object3D(),
      sectors: [],
    },

    trailsBetterWind,
    multiline,

    vectorSun = new THREE.Vector3(),

    image,

    model = {

    },

    sun   = Orb.SolarSystem().Sun(),

    time = {
      start: moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),
      now:   moment.utc('2017-05-30-12', 'YYYY-MM-DD-HH'),
      show:  moment.utc('2017-09-30-12', 'YYYY-MM-DD-HH'),
      end:   moment.utc('2017-12-31-00', 'YYYY-MM-DD-HH'),
      interval: 365 * 24, 
    },

    sectors = [
      [ 89.9, -180,  45.0,  180 ], // top
      [-45.0, -180, -89.9,  180 ], // bottom
      [ 45.0, -180, -45.0,  -90 ], // left back
      [ 45.0,  -90, -45.0,    0 ], // left front
      [ 45.0,    0, -45.0,   90 ], // right front
      [ 45.0,   90, -45.0,  180 ], // right back
    ],

    end;


  return {

    vectorSun,

    boot: function () {
      return self = this;
    },
    init: function () {

      var diff = time.now.diff(time.start, 'hours');

      IFC.controllers['DateTime']['choose'].setValue(diff);

    },
    load: function (name, config, callback) {

      TIM.step('SIM.load.in');

      // this is testing MultiLInes
      // trailsWind = self.createWind();
      // callback(name, trailsWind.mesh);

      this.loadModel(function () {

        self.createModelWind();
        callback(name, trailsWind.obj);

        TIM.step('SIM.load.out');

      });

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
    loadModel: function (callback) {

      RES.load({
        urls: [
          'data/gfs/permanent.landsfc.05.dods',
          'data/gfs/2017-05-30-12.tcdcclm.05.dods',
          'data/gfs/2017-05-30-12.tmp2m.05.dods',
          'data/gfs/2017-05-30-12.ugrd10m.05.dods',
          'data/gfs/2017-05-30-12.vgrd10m.05.dods',
        ],
        onFinish: function (err, responses) {

          responses.forEach(function (response) {
            var vari, data;
            if (response){
              vari = response.url.split('.').slice(-3)[0];
              data = SIM.Model.parseMultiDods(vari, response.data);
              model[vari] = new SIM.Datagram(data);
            } else {
              console.log('WTF');
            }
          });
          
          callback();

        }
      });    

    },
    createModelClouds: function () {

      var t0 = Date.now(), i, j, lat, lon, 


      end;





    },
    createModelWind: function () {
      
      TIM.step('Model.loaded');

      var t0 = Date.now(), i, j, lat, lon, col, vec3, latlon, 

        multiline, trailsPos, trailsWidths, trailsColors, latlonsStart, 

        radius    = CFG.earth.radius, 
        spherical = new THREE.Spherical(),

        length = TRAIL_LEN,
        amount = TRAIL_NUM,
        factor = 0.001,                    // TODO: proper Math
        alt    = 0.08,                     // 0.001

        color     = new THREE.Color('#ff0000'),
        lineWidth = radius * Math.PI / 180 * 0.7,  // deg°
        section   = 0.33,
        opacity   = 0.9,

        convertLL     = (lat, lon) => TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt),
        convertV3     = (v3)       => TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt),

      end;

      H.each(sectors, (_, sector)  => {

        latlonsStart = TOOLS.createLatLonsSectorRandom(sector, amount); 

        trailsPos     = new Array(amount).fill(0).map( () => []);
        trailsColors  = new Array(amount).fill(0).map( () => []);
        trailsWidths  = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat   = latlonsStart[i][0];
          lon   = latlonsStart[i][1];

          for (j=0; j<length; j++) {

            vec3 = convertLL(lat, lon);

            trailsPos[i].push(vec3);
            // trailsColors[i].push(new THREE.Color('hsl(' + Math.abs(~~lat) + ', 50%, 50%)'));
            trailsColors[i].push(new THREE.Color('hsl(' + Math.abs(~~(model.landsfc.linearXY(0, lat, lon) * 180)) + ', 50%, 50%)'));
            trailsWidths[i].push(0.6);

            spherical.setFromVector3(vec3);
            spherical.theta += model.ugrd10m.linearXY(0, lat, lon) * factor; // east-direction
            spherical.phi   += model.vgrd10m.linearXY(0, lat, lon) * factor; // north-direction
            vec3.setFromSpherical(spherical).clone();
            
            latlon = convertV3(vec3);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new Multiline (
          trailsPos, 
          trailsColors, 
          trailsWidths, 
          {color, opacity, section, lineWidth}
        );

        trailsWind.obj.add(multiline.mesh);
        trailsWind.sectors.push(multiline);

      });

      TIM.step('Wind.created');

      return trailsWind;

    },
    step: function () {

      H.each(trailsWind.sectors, (_, sec) => sec.step() );

      frame += 1;

    },
    start: function () {},
    stop: function () {},
    pause: function () {},
    activate: function () {
    },
    resize: function () {
    },
    render: function () {

    }
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