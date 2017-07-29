
SIM.Models.pjetstream = (function () {

  var 
    self
    model = {
      obj:          new THREE.Object3D(),
    }
  ;

  return self = {

    sample: function () {

    }

  };

}());

SIM.Models.pjetstream.sample = function (cfg, mom) {

  this.urls = [];

  cfg.sim.patterns.forEach(pattern => {
    this.urls.push(cfg.sim.dataroot + mom.format(pattern));
  });


}

SIM.Models.pjetstream.sample.prototype = {
  constructor: SIM.Models.pjetstream.sample,

}


SIM.Models.jetstream = (function () {

  var 
    self, cfg, times, vari,
    model = {
      obj:          new THREE.Object3D(),
      urls:         [],
      sectors:      [],
    },
    frags = {
      samplers2D:   '',
      val1Ternary:  '',
      val2Ternary:  '',
      palette:      '',
    }
  ;

  return self = {
    // convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    // convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    calcUrls: function () {

      times.moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },   
    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;
      vari  = cfg.sim.variable;

      if (CFG.Device.maxVertexUniforms < 4096){
        cfg.amount = 200;
      }

      // expose 
      model.prepare       = self.prepare;
      model.interpolateLL = self.interpolateLL;

      // prepare for loader
      self.calcUrls();

      // done
      return model;

    },

    prepare: function () {
      
      TIM.step('Model.jets.in');

      // console.profile('jetstream');

      var 
        t0        = Date.now(), 

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,

        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, multiline, positions, widths, colors, seeds,
        spcl      = new THREE.Spherical(),
        length    = cfg.length,
        amount    = NaN,
        pool      = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),
        material  = SCN.Meshes.Multiline.material(cfg),
        filler    = () => []
      ;


      //debug
      doe = 17336.75; var total = 0;


      H.each(cfg.sim.sectors, (_, sector)  => {

        seeds     = pool.filter(sector).slice(0, cfg.amount);
        amount    = seeds.length; 

        total +=  amount;

        positions = new Array(amount).fill(0).map(filler);
        colors    = new Array(amount).fill(0).map(filler);
        widths    = new Array(amount).fill(0).map(filler);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = TOOLS.latLonRadToVector3(lat, lon, cfg.radius);

          for (j=0; j<length; j++) {

            u = datagrams.ugrdprs.linearXY(doe, lat, lon);
            v = datagrams.vgrdprs.linearXY(doe, lat, lon);

            speed = Math.hypot(u, v);
            color = new THREE.Color().setHSL(cfg.hue, 0.4, speed / 100);
            width = H.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * cfg.factor;                   // east-direction
            spcl.phi   -= v * cfg.factor;                   // north-direction
            vec3 = vec3.setFromSpherical(spcl).clone();
            
            latlon = TOOLS.vector3ToLatLong(vec3, cfg.radius);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new SCN.Meshes.Multiline.mesh (
          positions, 
          colors, 
          widths, 
          material
        );

        model.obj.add(multiline.mesh);
        model.sectors.push(multiline);

      });

      model.obj.children[0].onAfterRender = function () {

        var i, 
          pointers = material.uniforms.pointers.value,
          offset   = 1 / cfg.length
        ;

        for (i=0; i<cfg.amount; i++) {
          pointers[i] = (pointers[i] + offset) % 1;
        }

        material.uniforms.pointers.needsUpdate = true;

        // material.uniforms.distance.value = SCN.camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.value = SCN.camera.distance;
        material.uniforms.distance.needsUpdate = true;
        
      }

      TIM.step('Model.jets.out', total, Date.now() - t0, 'ms');

      // console.profileEnd();

      return model;

    },

  };

}());
