
'use strict';

SIM.Models = SIM.Models || {};

SIM.Models.jetstream = (function () {

  var 
    self,     
    model = {
      obj:     new THREE.Object3D(),
      sectors: [],
      step:   function jetstep () {
        H.each(model.sectors, (_, sec) => sec.step() )
      },
    };

  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    create: function (cfg, datagramm) {
      
      // TIM.step('Model.jets.in');

      var 
        t0         = Date.now(), 
        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, tmp2m, multiline, positions, widths, colors, seeds, hsl,
        spcl      = new THREE.Spherical(),
        length    = cfg.length,
        amount    = NaN,
        factor    = 0.0003,                       // TODO: proper Math, also sync with wind10m
        alt       = cfg.radius - CFG.earth.radius,      // 0.001
        pool      = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),

      end;

      if (SCN.renderer.capabilities.maxVertexUniforms < 4096){
        cfg.amount = 200;
      }

      H.each(cfg.sim.sectors, (_, sector)  => {

        seeds     = pool.filter(sector).slice(0, cfg.amount);
        amount    = seeds.length; 

        positions = new Array(amount).fill(0).map( () => []);
        colors    = new Array(amount).fill(0).map( () => []);
        widths    = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = self.convLL(lat, lon, alt);

          for (j=0; j<length; j++) {

            u = datagramm.ugrdprs.linearXY(0, lat, lon);
            v = datagramm.vgrdprs.linearXY(0, lat, lon);

            speed = Math.hypot(u, v);

            hsl   = 'hsl(' + cfg.hue + ', 40%, ' +  ~~speed + '%)'
            color = new THREE.Color(hsl);

            width = self.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * factor;                   // east-direction
            spcl.phi   -= v * factor;                   // north-direction
            vec3 = vec3.setFromSpherical(spcl).clone();
            
            latlon = self.convV3(vec3, alt);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new Multiline (
          positions, 
          colors, 
          widths, 
          cfg
        );

        model.obj.add(multiline.mesh);
        model.sectors.push(multiline);

      });

      // TIM.step('Model.jets.out');

      return model;

    },
  };

}());
