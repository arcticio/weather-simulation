
SIM.Models.clouds = (function () {

  var 
    self, cfg, times, vari,
    frags = {
      samplers2D:   '',
      val1Ternary:  '',
      val2Ternary:  '',
      palette:      '',
    },
    model = {
      obj:     new THREE.Object3D(),
      urls:         [],
    },

    worker = new Worker('js/sim.models.clouds.worker.js')

  ;

  var payload = new Float32Array([1,2,3,4,5,6]);

  worker.postMessage({topic: 'quadratic', payload, id: Date.now() }, [payload.buffer]);

  worker.onmessage = function (event) {
    // console.log('answer', event.data);
  };


  return self = {
    
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
    interpolateLL: function (lat, lon) {

      var doe = SIM.time.doe;
      var doe1 = doe - (doe % 0.25);
      var doe2 = doe1 + 0.25;
      var t1 = SIM.datagrams.tmp2m.linearXY(doe1, lat, lon -180);
      var t2 = SIM.datagrams.tmp2m.linearXY(doe2, lat, lon -180);
      var frac = doe - ~~ doe;
      var fac2 = (frac % 0.25) % 4;
      var fac1 = 1.0 - fac2;

      return (t1 * fac1 + t2 * fac2);

    },
    calcUrls: function () {

      times.moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },

    prepareFragmentShader: function () {

      var amount = Math.ceil(times.length / 4);

      frags.samplers2D = H.range(1, amount + 1).map( n => '\n  uniform sampler2D tex' + n + ';').join('');

      frags.val1Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4) + 1),
          p = {0:'r', 1:'g', 2:'b', 3:'a'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', uvSphere ).' + p + ' :';
      }).join('');

      frags.val2Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4 + 0.25) + 1),
          p = {0:'g', 1:'b', 2:'a', 3:'r'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', uvSphere ).' + p + ' :';
      }).join('');

    },
    prepareTextures: function (data) {

      /* tmp2m 
          low  = 273.15 - 30 = 243.15;
          high = low    + 70 = 313.75;
          ...  -30 -20 .... +30  +40  ...
      */

      var 
        does     = [],
        pointer  = 1,
        textures = {},
        scaler   = cfg.sim.scaler
      ;

      times.does.forEach( doe => {

        does.push(doe);

        if (does.length === 4){
          textures['tex' + pointer] = {type: 't', value: data[vari].dataTexture(does, scaler) };
          does = [];
          pointer += 1;
        }

      });

      // rest
      if (does.length) {
        textures['tex' + pointer] = {type: 't', value: data[vari].dataTexture(does, scaler) };
      } 

      return textures;

    },

    prepare: function ( ) {
    
      TIM.step('Model.clouds.in');

      var
        t0 = Date.now(),
        i, p, mesh, material, 
        pool      = SIM.coordsPool.slice(cfg.amount).pool,
        len       = pool.length,
        geometry  = new THREE.BufferGeometry(),

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,

        textures  = self.prepareTextures(datagrams),
        fragments = self.prepareFragmentShader(),

        position  = new THREE.BufferAttribute( new Float32Array( cfg.amount * 3), 3 ),

        uniforms  = Object.assign(textures, {
          doe:          { type: 'f',  value: doe - mindoe },
          opacity:      { type: 'f',  value: cfg.opacity },
          factor:       { type: 'f',  value: cfg.factor },
          radius:       { type: 'f',  value: cfg.radius },
          distance:     { type: 'f',  value: SCN.camera.distance },
          sunDirection: { type: 'v3', value: SIM.sunDirection },
        }),

        material  = new THREE.ShaderMaterial({
          uniforms,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(fragments),
        }),

        mesh = new THREE.Points( geometry, material ),

        onBeforeRender = function () {

          uniforms.sunDirection.value = SIM.sunDirection;
          uniforms.sunDirection.value.y = -uniforms.sunDirection.value.y; // why
          uniforms.sunDirection.needsUpdate = true;

          material.uniforms.distance.value = SCN.camera.distance;
          material.uniforms.distance.needsUpdate = true;

          uniforms.doe.value = (
            SIM.time.doe >= times.mindoe && SIM.time.doe <= times.maxdoe ? 
              SIM.time.doe - times.mindoe :
              -9999.0
          );

          uniforms.doe.needsUpdate = true;

        }
      ;

      for ( i=0, p=0; i < len; i+=1, p+=3 ) {
        position.array[p + 0] = pool[i].x;
        position.array[p + 1] = pool[i].y;
        position.array[p + 2] = pool[i].z;
      }

      geometry.addAttribute( 'position',   position );

      mesh.onBeforeRender = onBeforeRender;

      model.obj.add(mesh);

      TIM.step('Model.clouds.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        const float NODATA = -9999.0;
        const float PI     = 3.141592653589793;

        ${frags.samplers2D}

        uniform float doe, factor, radius, distance;

        varying float vValue;
        varying vec3  vNormal;
        
        vec2 uvSphere;

        float fac1, fac2, val1, val2, value;

        float saturate(float val) {
          return clamp(val, 0.0, 1.0);
        }

        void main() {

          uvSphere = vec2(
           saturate(((atan(position.x, position.z) / PI) + 1.0) / 2.0), 
           0.5 - (asin( position.y ) / PI )
          );

          val1 = (
            ${frags.val1Ternary}
              NODATA
          );

          val2 = (
            ${frags.val2Ternary}
              NODATA
          );

          if (doe != NODATA && val1 != NODATA && val2 != NODATA) {

            fac2 = mod(fract(doe), 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            vValue = (val1 * fac1 + val2 * fac2);

          } else {
            vValue = 0.0001;

          }

          vNormal = normalize(position);

          gl_PointSize = vValue * 1.0 * mix(4.0, 3.0, distance);

          // gl_PointSize = vSize / (distance) * 2.0;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4( position * radius, 1.0 );

         }
      
      `;

    },
    fragmentShader: function () {

      return `

        uniform float opacity;
        uniform vec3 sunDirection;

        varying float vValue;
        varying vec3 vNormal;

        // day night light
        float dotNL;
        float dnMix, dnZone;
        float dnSharpness = 4.0;
        float dnFactor    = 0.2; // 0.15;

        float rand(vec2 co){
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {

          // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
          dotNL = dot(normalize(vNormal), sunDirection);

          // sharpen the edge beween the transition
          dnZone = clamp( dotNL * dnSharpness, -1.0, 1.0);

          // convert to 0 to 1 for mixing, 0.5 for full range
          dnMix = 0.5 - dnZone * dnFactor;

          if (vValue < 0.01) discard;

          // gl_FragColor = vec4(1.0, 1.0, 1.0, dnMix); // works
          gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);

        }

      `;

    }

  };

}());
