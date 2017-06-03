
'use strict';

SIM.Model.clouds = (function () {

  var self;


  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    create: function (cfg) {
      
      TIM.step('Model.clouds.in');

      TIM.step('Model.clouds.out');

    },
  };


}());
