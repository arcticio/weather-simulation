
SIM.Models.jetstream = (function () {

  var 
    self, cfg, times, poolJetStream, material,
    model = {
      obj:          new THREE.Object3D(),
    },
    does = {},
  end;

  return self = {

    onAfterRender: function () {

      var i, 
        pointers = material.uniforms.pointers.value,
        distance = SCN.camera.position.length() - CFG.earth.radius,
        offset   = 1 / cfg.length
      ;

      for (i=0; i<cfg.amount; i++) {
        pointers[i] = (pointers[i] + offset) % 1;
      }

      material.uniforms.pointers.needsUpdate = true;

      material.uniforms.distance.value = distance;
      material.uniforms.distance.needsUpdate = true;

    },

    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;

      poolJetStream = new CoordsPool().latlonArray(5000);

      material = self.material(cfg)

      times.does.forEach( doe => does[does] = []);

      model.prepare = self.prepare;

      model.obj.name = 'jetstream';

      return model;

    },

    prepare: function (name, onloaded) {

      // get number of stamps
      // create urls for stamp from pattern
      // init workers

      // models does update, adjusting samples visibility, has material

      // samples have sectors, spatially
      // go from url to geometry attributes
      // build meshs from worker's attributes + model's material

      // http://0.0.0.0:8765/16FE/2017-06-20-12-00/2.49928;3.108127;-0.305199

      var 
        t0      = Date.now(),
        threads = CFG.Device.threads,
        tasks   = [],
        unique  = 100,
      end;

      times.moms.forEach( mom => {

        var
          doe  = SIM.mom2doe(mom), 
          task = function (callback) {

            var 
              t0      = Date.now(),
              id      = String(unique++),
              worker  = new Worker(cfg.worker),
              urls    = cfg.sim.patterns.map( (pattern) => '/' + cfg.sim.dataroot + mom.format(pattern)),
              payload = Object.assign({cfg, urls}, {
                doe:    doe,
                pool:   poolJetStream,
                amount: CFG.Device.maxVertexUniforms < 4096 ? 200 : cfg.amount,
              })
            ;

            worker.postMessage({id, topic: 'retrieve', payload });

            worker.onmessage = function (event) {
              // console.log('answered', id, Date.now() - t0);
              self.build(mom, event.data.result);
              callback();
            };

          }
        ;

        tasks.push(task);

      });

      async.parallelLimit(tasks, threads, function () {
        TIM.step('SIM.load', 'jetstream', 't:', threads, 'm:',  times.length, 'ms:', Date.now() - t0);
        onloaded(name, model.obj);
      });

    },
    build: function (mom, sectors) {

      var attribute, geometry, mesh;

      H.each(sectors, (_, data) => {

        geometry = new THREE.BufferGeometry();

        H.each(cfg.attributes, (name, attr) => {

          attribute = new THREE.BufferAttribute( data[name], attr.itemSize );

          console.log(name, data[name].length, attr.itemSize, attribute.count);

          if (name === 'index') {
            // geometry.setIndex( attribute );

          } else {
            geometry.addAttribute( name, attribute );
          }

        });

        mesh = new THREE.Mesh( geometry, material );
        model.obj.add(mesh);

      });

      model.obj.children[0].onAfterRender = self.onAfterRender;

    },

    material: function (cfg) {

        var     
          pointers = new Array(cfg.amount).fill(0).map( () => Math.random() * cfg.length ),
          distance = SCN.camera.position.length() - CFG.earth.radius
        ;

        return  new THREE.RawShaderMaterial(Object.assign(cfg.material, {

          vertexShader:    self.shaderVertex(cfg.amount),
          fragmentShader:  self.shaderFragment(),

          uniforms: {

            // color:            { type: 'c',    value: cfg.color },
            opacity:          { type: 'f',    value: cfg.opacity },
            lineWidth:        { type: 'f',    value: cfg.lineWidth },
            section:          { type: 'f',    value: cfg.section }, // length of trail in %

            // these are updated each step
            pointers:         { type: '1fv',  value: pointers },
            distance:         { type: 'f',    value: distance },

          },

        }));

    },

    shaderVertex: function (amount) { return `

      // precision highp float;

      attribute float side;
      attribute vec3  next;
      attribute vec3  position;
      attribute vec3  previous;

      attribute float width;
      attribute vec3  colors;
      attribute float lineIndex;

      uniform mat4  projectionMatrix;
      uniform mat4  modelViewMatrix;

      uniform float distance;
      uniform float lineWidth;
      // uniform vec3  color;
      uniform float opacity;

      uniform float pointers[  ${amount}  ];  // start for each line
      
      varying vec4  vColor;
      varying float vHead, vCounter;

      vec2 dir, dir1, dir2, normal;
      vec4 offset;

      void main() {

          vHead     = pointers[int(lineIndex)];   // get head for this segment
          vCounter  = fract(lineIndex);           // get pos of this segment 
          vColor    = vec4( colors, opacity );

          mat4 m = projectionMatrix * modelViewMatrix;

          vec4 finalPosition = m * vec4( position, 1.0 );
          vec4 prevPos       = m * vec4( previous, 1.0 );
          vec4 nextPos       = m * vec4( next, 1.0 );

          vec2 currP = finalPosition.xy / finalPosition.w;
          vec2 prevP = prevPos.xy       / prevPos.w;
          vec2 nextP = nextPos.xy       / nextPos.w;

          if      ( nextP == currP ) { dir = normalize( currP - prevP) ;}
          else if ( prevP == currP ) { dir = normalize( nextP - currP) ;}
          else {
              dir1 = normalize( currP - prevP );
              dir2 = normalize( nextP - currP );
              dir  = normalize( dir1  + dir2 );
          }

          normal  = vec2( -dir.y, dir.x );
          normal *= lineWidth * width * distance;

          offset = vec4( normal * side, 0.0, 1.0 );
          finalPosition.xy += offset.xy;

          gl_Position = finalPosition;

      }`;

    },
    shaderFragment: function () { return `

      precision mediump float;

      float alpha  = 0.0;

      uniform float section;   // visible segment length

      varying vec4  vColor;    // color from attribute, includes uni opacity
      varying float vHead;     // head of line segment
      varying float vCounter;  // current position, goes from 0 to 1 

      void main() {

        gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.9 );
        return;

        vec4  color = vColor;
        float head  = vHead;
        float tail  = max(0.0, vHead - section);
        float pos   = vCounter;

        if ( pos > tail && pos < head ) {
          alpha = (pos - tail) / section;

        } else if ( pos > ( 1.0 - section ) && head < section ) {
          alpha = ( pos - section - head ) / section; 

        } else {
          discard;

        }

        gl_FragColor = vec4( color.rgb, alpha * color.a );

      }`;

    },

    prepareX: function () {
      
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
