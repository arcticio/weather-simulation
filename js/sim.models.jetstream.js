
SIM.Models.jetstream = (function () {

  var 
    self, cfg, datagram,
    model = {
      obj:      new THREE.Object3D(),
      sectors:  [],
      urls:     [],
      minDoe:   NaN,
      maxDoe:   NaN,
    };

  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    calcMinMax: function (moms) {
      // assumes sorted moms
      model.minDoe = SIM.mom2doe(moms[0]);
      model.maxDoe = SIM.mom2doe(moms.slice(-1)[0]);
    },
    calcUrls: function (moms) {

      moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },   
    create: function (config, moms, simdata) {

      cfg = config;
      datagram = simdata;
      model.prepare = self.prepare;

      self.calcUrls(moms);
      self.calcMinMax(moms);

      return model;

    },

    prepare: function (doe) {
      
      // TIM.step('Model.jets.in');

      var 
        t0         = Date.now(), 
        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, multiline, positions, widths, colors, seeds, hsl,
        spcl      = new THREE.Spherical(),
        length    = cfg.length,
        amount    = NaN,
        factor    = 0.0003,                       // TODO: proper Math, also sync with wind10m
        alt       = cfg.radius - CFG.earth.radius,      // 0.001
        pool      = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),

      end;

      if (CFG.Device.maxVertexUniforms < 4096){
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

            u = datagram.ugrdprs.linearXY(doe, lat, lon);
            v = datagram.vgrdprs.linearXY(doe, lat, lon);

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
