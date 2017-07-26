
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

  // var 
  //   self, cfg, datagram,
  //   model = {
  //     obj:      new THREE.Object3D(),
  //     sectors:  [],
  //     urls:     [],
  //     minDoe:   NaN,
  //     maxDoe:   NaN,
  //   };

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

      times.moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

      // moms.forEach(mom => {
      //   cfg.sim.patterns.forEach(pattern => {
      //     model.urls.push(cfg.sim.dataroot + mom.format(pattern));
      //   });
      // });

    },   
    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;
      vari  = cfg.sim.variable;

      // expose 
      model.prepare       = self.prepare;
      model.interpolateLL = self.interpolateLL;

      // prepare for loader
      self.calcUrls();

      // done
      return model;

    },
    createX: function (config, moms, simdata) {

      cfg = config;

      if (CFG.Device.maxVertexUniforms < 4096){
        cfg.amount = 200;
      }

      datagram = simdata;
      model.prepare = self.prepare;

      self.calcUrls(moms);
      self.calcMinMax(moms);

      return model;

    },

    prepare: function (doe) {
      
      TIM.step('Model.jets.in');

      var 
        t0        = Date.now(), 

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,


        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, multiline, positions, widths, colors, seeds, hsl,
        spcl      = new THREE.Spherical(),
        length    = cfg.length,
        amount    = NaN,
        alt       = cfg.radius - CFG.earth.radius,      // 0.001
        pool      = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),
        material  = SCN.Meshes.Multiline.material(cfg),
      end;

      //debug
      doe = 17336.75;


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

            u = datagrams.ugrdprs.linearXY(doe, lat, lon);
            v = datagrams.vgrdprs.linearXY(doe, lat, lon);

            speed = Math.hypot(u, v);

            hsl   = 'hsl(' + cfg.hue + ', 40%, ' +  ~~speed + '%)'
            color = new THREE.Color(hsl);

            width = self.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * cfg.factor;                   // east-direction
            spcl.phi   -= v * cfg.factor;                   // north-direction
            vec3 = vec3.setFromSpherical(spcl).clone();
            
            latlon = self.convV3(vec3, alt);
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

        material.uniforms.distance.value = SCN.camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.needsUpdate = true;
        
      }

      // TIM.step('Model.jets.out');

      return model;

    },






    // createMaterial: function (amount, options) {

    //   var     
    //     pointers = new Array(amount).fill(0).map( () => Math.random() * this.length ),
    //     distance = SCN.camera.position.length() - CFG.earth.radius
    //   ;

    //   // https://threejs.org/examples/webgl_materials_blending.html

    //   return  new THREE.RawShaderMaterial({

    //     vertexShader:    SCN.Meshes.Multiline.shaderVertex(cfg.amount),
    //     fragmentShader:  SCN.Meshes.Multiline.shaderFragment(),

    //     depthTest:       true,                    // false ignores planet
    //     depthWrite:      false,
    //     blending:        THREE.AdditiveBlending,    // NormalBlending, AdditiveBlending, MultiplyBlending
    //     side:            THREE.DoubleSide,        // FrontSide (start=skewed), DoubleSide (start=vertical)
    //     transparent:     true,                    // needed for alphamap, opacity + gradient
    //     lights:          false,                   // no deco effex, true tries to add scene.lights

    //     shading:         THREE.SmoothShading,     // *THREE.SmoothShading or THREE.FlatShading
    //     vertexColors:    THREE.NoColors,          // *THREE.NoColors, THREE.FaceColors and THREE.VertexColors.

    //     wireframe:       false,

    //     uniforms: {

    //       color:            { type: 'c',    value: options.color },
    //       opacity:          { type: 'f',    value: options.opacity },
    //       lineWidth:        { type: 'f',    value: options.lineWidth },
    //       section:          { type: 'f',    value: options.section }, // length of trail in %

    //       // these are updated each step
    //       pointers:         { type: '1fv',  value: pointers },
    //       distance:         { type: 'f',    value: distance },

    //     },

    //   });

    // },

  };

}());
