
SIM.Models.jetstream = (function () {

  var 
    self, cfg, times, poolJetStream,
    unique = 100,
    does   = {},
    model  = {
      obj:          new THREE.Object3D(),
    },
    materials
  ;

  return self = {

    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;

      poolJetStream = new CoordsPool().latlonArray(5000);

      // material = self.material(cfg)

      times.does.forEach( doe => does[doe] = []);

      model.prepare = self.prepare;

      return model;

    },

    prepare: function (name, onloaded) {

      var 
        t0      = Date.now(),
        threads = CFG.Device.threads,
        tasks   = [],
        results = []
      ;

      function process(worker, data, ondone) {
        worker.postMessage(data);
        worker.onmessage = ondone;
      }

      times.moms.forEach( mom => {

        var
          doe  = SIM.mom2doe(mom), 
          task = function (callback) {

            var 
              id      = String(unique++),
              worker  = new Worker(cfg.worker),
              urls    = cfg.sim.patterns.map( (pattern) => '/' + cfg.sim.dataroot + mom.format(pattern)),
              payload = Object.assign({cfg, urls}, {
                doe:    doe,
                pool:   poolJetStream,
                amount: CFG.Device.maxVertexUniforms < 4096 ? 200 : cfg.amount,
              })
            ;

            process(worker, {id, topic: 'importScripts', payload: {scripts: cfg.scripts} }, () => {

              process(worker, {id, topic: 'retrieve', payload }, (event) => {
                results.push({mom, result: event.data.result})
                callback();
              });
              
            });

          }
        ;

        tasks.push(task);

      });

      async.parallelLimit(tasks, threads, function () {
        // debugger;
        self.build(results);
        TIM.step('SIM.load', 'jetstream', 't:', threads, 'm:',  times.length, 'ms:', Date.now() - t0);
        onloaded(name, model.obj);
      });

    },
    build: function (results) {

      /*
        one mesh for each sector
        6 materials with unique static seed set, sharing dynamic uv textures
        set doe length as uniform (build time)

        results : []
          result : 
            mom : Moment
            result : {}
              textures: {u, v}
              sectors: [1...6]
                attributes: {colors, ...}
                uniforms: { seeds }

      */

      // prepare materials

      // debugger;

      materials = H.range(0, 6).map( idx => {
        return self.material(cfg, results[0].result.sectors[idx].uniforms.seeds);
      });

      // over time (moments)
      H.each(results, (_, result) => {

        // over space (sectors)
        H.each(result.result.sectors, (idx, sector) => {

          var 
            mesh, 
            material = materials[idx],
            geometry = new THREE.BufferGeometry()
          ;

          H.each(cfg.attributes, (name, attr) => {

            var attribute = new THREE.BufferAttribute( sector.attributes[name], attr.itemSize );

            if (name === 'index') {
              geometry.setIndex( attribute );

            } else {
              geometry.addAttribute( name, attribute );

            }

          });

          mesh = new THREE.Mesh( geometry, material );
          model.obj.add(mesh);

        });

      });

      model.obj.children[0].onAfterRender = self.onAfterRender;

    },

    material: function (cfg, seeds) {

      var     
        heads = new Array(cfg.amount).fill(0).map( () => Math.random() ),
        distance = SCN.camera.position.length() - CFG.earth.radius
      ;

      return new THREE.RawShaderMaterial(Object.assign(cfg.material, {

        vertexShader:    self.shaderVertex(cfg),
        fragmentShader:  self.shaderFragment(cfg),

        uniforms: {

          opacity:          { type: 'f',    value: cfg.opacity },
          lineWidth:        { type: 'f',    value: cfg.lineWidth },
          section:          { type: 'f',    value: cfg.section }, // length of trail in %
          seeds   :         { type: '3fv',  value: seeds },

          // these are updated on demand
          tex1u:            { type: 't',    value: null },
          tex1v:            { type: 't',    value: null },
          tex2u:            { type: 't',    value: null },
          tex2v:            { type: 't',    value: null },

          // these are updated each step
          heads:            { type: '1fv',  value: heads },
          distance:         { type: 'f',    value: distance },

        },

      }));

    },

    onAfterRender: function () {

      H.each(materials, (_, material) => {

        var i, 
          heads    = material.uniforms.heads.value,
          distance = SCN.camera.position.length() - CFG.earth.radius,
          offset   = 1 / cfg.length
        ;

        for (i=0; i<cfg.amount; i++) {
          heads[i] = (heads[i] + offset) % 1;
        }

        material.uniforms.heads.needsUpdate = true;

        material.uniforms.distance.value = distance;
        material.uniforms.distance.needsUpdate = true;


      });

    },

    shaderVertex: function (cfg) { return `

      const int length = ${cfg.length}; // verts per line

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
      uniform float opacity;

      uniform vec3  seeds[ ${cfg.amount} ];  // start vector for each line
      uniform float heads[ ${cfg.amount} ];  // heads for each line
      
      varying vec4  vColor;
      varying float vHead, vCounter;

      vec2 dir, dir1, dir2, normal;
      vec4 offset;

      int linenum;

      vec4 currPos, prevPos, nextPos;
      vec2 currP, nextP, prevP;

      mat4 matrix;

      void main() {

          matrix  = projectionMatrix * modelViewMatrix;
          linenum = int(lineIndex);

          // varys for fragment
          vHead    = heads[linenum];             // get head for this segment
          vCounter = fract(lineIndex);           // get pos of this segment 
          vColor   = vec4( colors, opacity );

          // position prepare
          currPos = vec4(seeds[linenum], 1.0);
          prevPos = vec4(seeds[linenum], 1.0);
          nextPos = vec4(seeds[linenum], 1.0);


          for( int i = 0; i <= length; i++ ) { 
            
            if ( i >= linenum + 1 ) break;

            prevPos = currPos;
            currPos = nextPos;
            nextPos = nextPos + vec4(0.9, 0.9, 0.9, 0.0);
            
          }

          prevPos = matrix * prevPos;
          currPos = matrix * currPos;
          nextPos = matrix * nextPos;

          currPos = matrix * vec4( position, 1.0 );
          prevPos = matrix * vec4( previous, 1.0 );
          nextPos = matrix * vec4( next, 1.0 );

          currP = currPos.xy / currPos.w;
          prevP = prevPos.xy / prevPos.w;
          nextP = nextPos.xy / nextPos.w;

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
          currPos.xy += offset.xy;

          gl_Position = currPos;

      }`;

    },
    shaderVertexXXX: function (amount) { return `

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
      uniform float opacity;

      uniform float heads[  ${amount}  ];  // start for each line
      
      varying vec4  vColor;
      varying float vHead, vCounter;

      vec2 dir, dir1, dir2, normal;
      vec4 offset;

      void main() {

          vHead     = heads[int(lineIndex)];   // get head for this segment
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
    shaderFragment: function (cfg) { return `

      precision mediump float;

      float alpha   = 0.0;
      float section = ${cfg.section}; // visible segment length

      varying vec4  vColor;    // color from attribute, includes uni opacity
      varying float vCounter;  // current position, goes from 0 to 1 = whole line/geometry
      varying float vHead;     // head position of this line, 

      void main() {

        // gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.9 ); return; // entire line in red

        vec4  color = vColor;
        float head  = vHead;
        float tail  = max(0.0, vHead - section);
        float pos   = vCounter;

        if ( pos > tail && pos < head ) {
          // 
          alpha = (pos - tail) / section;

        } else if ( pos > ( 1.0 - section ) && head < section ) {
          alpha = ( pos - section - head ) / section; 

        } else {
          discard;

        }

        gl_FragColor = vec4( color.rgb, alpha * color.a );

      }`;

    },

  };

}());
