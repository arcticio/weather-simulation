'use strict';

var SIM = (function () {

  var 
    self,
    renderer,
    camera,

    frame,
    sim,

    index = 0,
    trails = [],
    
    trailsWind,
    trailsBetterWind,

    model = {

    },

    end;


  return {
    boot: function () {
      return self = this;
    },
    createWind: function () {

      var i, j, lat, lon, col,
        amount = TRAIL_NUM,
        length = TRAIL_LEN,
        trailsVectors = new Array(amount).fill(0).map( () => []),
        trailsColors  = new Array(amount).fill(0).map( () => []),
        latsStart = H.linspace(-80, 80, amount), 
        lonsStart = H.linspace(  -45, 45, amount), 
        convert    = function (latlon) {
          return TOOLS.latLongToVector3(latlon[0], latlon[1], CFG.earth.radius, CFG.earth.radius / 45);
        },
        color = new THREE.Color('hsl(200, 80%, 50%)')
      end;

      for (i=0; i<amount; i++) {

        lat   = latsStart[i];
        lon   = lonsStart[i];
        col   = 0;

        for (j=0; j<length; j++) {

          trailsVectors[i].push(convert([lat, lon]));
          trailsColors[i].push(new THREE.Color('hsl(' + (col + 360/length) + ', 50%, 80%)'));

          lat += 0;
          lon += 90/length;
          col += 360/length;

        }

      }

      trailsWind = new Trails('wind10m', trailsVectors, trailsColors, color);
      
      SCENE.add('wind10m', trailsWind.container);
      
    },
    loadBetterWind: function () {

      // https://stackoverflow.com/questions/44098678/how-to-rotate-a-vector3-using-vector2
      
      TIM.step('Model.loaded');

      var i, j, lat, lon, col, vector3, vecWind, sphericalPosition,  latlon, 
        amount = 20,
        length = 60,
        trailsVectors = new Array(amount).fill(0).map( () => []),
        trailsColors  = new Array(amount).fill(0).map( () => []),
        latsStart = H.linspace(10, 40, amount), 
        lonsStart = H.linspace(10, 40, amount), 
        convertLL    = function (latlon) {
          return TOOLS.latLongToVector3(latlon[0], latlon[1], CFG.earth.radius, CFG.earth.radius / 45);
        },
        convertV3 = function (v3) {
          return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + CFG.earth.radius / 45);
        },
        factor = 0.0008,
        color = new THREE.Color(0xff00ff);

      end;

      for (i=0; i<amount; i++) {

        col   = 0;
        lat   = latsStart[i];
        lon   = lonsStart[i];

        for (j=0; j<length; j++) {

          vector3 = convertLL([lat, lon]);
          trailsVectors[i].push(vector3);

          sphericalPosition = new THREE.Spherical().setFromVector3(vector3);
          sphericalPosition.theta += model.ugrd10.linearXY(0, lat, lon) * factor; // east-direction
          sphericalPosition.phi   += model.vgrd10.linearXY(0, lat, lon) * factor; // north-direction
          vector3 = vector3.setFromSpherical(sphericalPosition).clone();
          
          latlon = convertV3(vector3);
          lat = latlon.lat;
          lon = latlon.lon;

          trailsColors[i].push(new THREE.Color('hsl(' + (col + 360/length) + ', 50%, 80%)'));
          col += 360/length;

        }

      }

      trailsBetterWind = new Trails('nicewind10m', trailsVectors, trailsColors, color);
      
      SCENE.add('nicewind10m', trailsBetterWind.container);

    },
    init: function () {

      TIM.step('SIM.init.in');

      self.loadModel(self.loadBetterWind);
      // self.createWind();

      TIM.step('SIM.init.out');
      
    },
    loadModel: function (callback) {

      // quick async hack
      var 
        requests = 3,
        interval = setInterval(function () {
          if (requests === 0){
            clearInterval(interval);
            callback();
          }
        }, 100);

      RES.load({
        urls: ['data/ugrd10.1x180x360.dods'],
        onFinish: function (err, responses) {
          requests -= 1;
          var data = SIM.Model.parseMultiDods('ugrd10', responses[0].data);
          model['ugrd10'] = new SIM.Datagram(data);
        }
      });      

      RES.load({
        urls: ['data/vgrd10.1x180x360.dods'],
        onFinish: function (err, responses) {
          requests -= 1;
          var data = SIM.Model.parseMultiDods('vgrd10', responses[0].data);
          model['vgrd10'] = new SIM.Datagram(data);
        }
      });      

      RES.load({
        urls: ['data/tmp2m.1x180x360.dods'],
        onFinish: function (err, responses) {
          requests -= 1;
          var data = SIM.Model.parseMultiDods('tmp2m', responses[0].data);
          model['tmp2m'] = new SIM.Datagram(data);
        }
      }); 

    },
    step: function (frame) {

      // trailsWind && trailsWind.step();

      trailsBetterWind && trailsBetterWind.step();

      index += 1;

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