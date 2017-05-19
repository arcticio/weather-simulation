'use strict';

var SIM = (function () {

  const COUNT  = 1000;
  const LENGTH = 361;

  var 
    self,
    renderer,
    camera,

    frame,
    sim,

    index = 0,
    trails = [],
    variables,

    end;


  return {
    boot: function () {
      return self = this;
    },
    init: function (data) {

      variables = data;
      sim = new THREE.Object3D();

      // first lat/lon [0/0] is last of trail


      var lats = new Array(COUNT)
        .fill(0)
        .map(() => Math.random())
        .map( n => -80 + 160 * n)
      ;

      var lons = new Array(COUNT)
        .fill(0)
        .map(() => Math.random())
        .map( n => 360 * n - 180)
      ;


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

      H.zip(lats, lons, (lat, lon) => {

        trails.push(new Trail(
          new Array(LENGTH).fill(lat),
          new Array(LENGTH).fill(lon),
          LENGTH
        ));

      });

      trails.forEach( trail => {
        sim.add(trail.mesh);
        for ( var i=0; i<LENGTH; i++){
          trail.move();
        }
      });

      SCENE.add('sim', sim);

      TIM.step('SIM.init.out');
      
    },
    step: function (frame) {

      // if (index < LENGTH){
      //   trails.forEach( t => t.move());

      // } else {
        trails.forEach( t => t.step());

      // }

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