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
    trailsWind = [],

    end;


  return {
    boot: function () {
      return self = this;
    },
    createWind: function () {

      var i, j, lat, lon, col,
        amount = TRAIL_NUM,
        length = TRAIL_LEN,
        trailsCords  = new Array(amount).fill(0).map( () => []),
        trailsColors = new Array(amount).fill(0).map( () => []),
        latsStart = H.linspace(-80, 80, amount), 
        lonsStart = H.linspace(  -45, 45, amount), 
      end;

      for (i=0; i<amount; i++) {

        lat   = latsStart[i];
        lon   = lonsStart[i];
        col   = 0;

        for (j=0; j<length; j++) {

          trailsCords[i].push([lat, lon]);
          trailsColors[i].push(new THREE.Color('hsl(' + (col + 360/length) + ', 50%, 80%)'));

          lat += 0;
          lon += 90/length;
          col += 360/length;

        }

      }

      trailsWind = new Trails('wind10m', trailsCords, trailsColors);
      
      SCENE.add('wind10m', trailsWind.container);
      
      // renderer {
      //   "trails": 100,
      //   "length": 60,
      //   "children": 7,
      //   "geometries": 105,
      //   "calls": 110,
      //   "textures": 7,
      //   "faces": 14887,
      //   "vertices": 93053
      // }

      // SCENE.add('wind10m', trailsWind.meshMerged);


      // renderer {
      //   "trails": 100,
      //   "length": 60,
      //   "children": 7,
      //   "geometries": 5,
      //   "calls": 10,
      //   "textures": 6,
      //   "faces": 3087,
      //   "vertices": 57653
      // }



    },
    init: function () {

      TIM.step('SIM.init.in');

      self.createWind();

      // variables = data;
      sim = new THREE.Object3D();

      // first lat/lon [0/0] is last of trail

      var lats = new Array(TRAIL_NUM)
        .fill(0)
        .map(() => Math.random())
        .map( n => -80 + 160 * n)
      ;

      var lons = new Array(TRAIL_NUM)
        .fill(-30)
        // .map(() => Math.random())
        // .map( n => 360 * n - 180)
      ;

      // https://threejs.org/docs/#api/constants/Textures
      var alphamap = SCENE.loader.load('images/line.alpha.64.png')

      function genLons (lats, start) {
        return lats.map( (lat, idx) => idx <= 90 | idx > 270 ? start : 180 + start );
      }

      // var 
      //   lats = Array.prototype.concat(
      //     H.linspace(  0,  89, 90),
      //     H.linspace( 90,   1, 90),
      //     H.linspace(  0, -89, 90),
      //     H.linspace(-90,  -1, 90)
      //   ),
      //   alphamap = SCENE.loader.load('images/line.alpha.16.png');


      // H.linspace(0, 359, 24).forEach(start => {

      //   trails.push(new Trail(lats, genLons(lats, start), LEN, alphamap));

      // });

      // H.zip(lats, lons, (lat, lon) => {

      //   trails.push(new Trail(
      //     new Array(TRAIL_LEN).fill(lat),
      //     new Array(TRAIL_LEN).fill(lon),
      //     TRAIL_LEN,
      //     alphamap
      //   ));

      // });

      // trails.forEach( trail => {
      //   sim.add(trail.mesh);
      //   for ( var i=0; i<TRAIL_LEN; i++){
      //     trail.move();
      //   }
      // });

      // SCENE.add('sim', sim);

      TIM.step('SIM.init.out');
      
    },
    step: function (frame) {

      // trails.forEach( t => t.step());

      trailsWind.step();

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