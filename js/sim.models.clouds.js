
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
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    updateMinMax: function () {
      model.mindoe = Math.min.apply(Math, Object.keys(model.objects));
      model.maxdoe = Math.max.apply(Math, Object.keys(model.objects));
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
    show: function (doe) {

      var doe1, doe2;

      // that's probaby to much
      while (model.obj.children.length) {
        model.obj.remove(model.obj.children[0]);
      }

      if (model.objects[doe]) {

        // that's a hit
        model.obj.add(model.objects[doe]);
        model.objects[doe].material.uniforms.factor.value = 1.0;
        model.objects[doe].material.uniforms.factor.needsUpdate = true;

      } else if (doe > model.mindoe && doe < model.maxdoe) {

        // mix them!
        doe1 = doe  % 0.25;
        doe2 = doe1 + 0.25;
        model.obj.add(model.objects[doe1]);
        model.obj.add(model.objects[doe2]);

        model.objects[doe1].material.uniforms.factor.value = parseFloat(doe)  - parseFloat(doe1);
        model.objects[doe2].material.uniforms.factor.value = parseFloat(doe2) - parseFloat(doe);
        model.objects[doe1].material.uniforms.factor.needsUpdate = true;
        model.objects[doe2].material.uniforms.factor.needsUpdate = true;

        console.log('clouds.show.mix', doe1, doe, doe2);

      } else {

        // bail out!
        console.warn('clouds.show.error', 'doe', doe, model.mindoe, model.maxdoe);

      }

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

    prepare: function ( doe ) {
    
      TIM.step('Model.clouds.in', doe);

      var
        t0 = Date.now(),
        i, p, coord, mesh, material, 
        size     = cfg.size,
        amount   = cfg.amount,
        radius   = cfg.radius,
        pool     = SIM.coordsPool.slice(amount).pool,
        geometry = new THREE.BufferGeometry(),

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,

        textures  = self.prepareTextures(datagrams),
        fragments = self.prepareFragmentShader(),

        position  = new THREE.BufferAttribute( new Float32Array( amount * 3), 3 ),

        uniforms  = Object.assign(textures, {
          doe:          { type: 'f',  value: doe - mindoe },
          opacity:      { type: 'f',  value: cfg.opacity },
          sunDirection: { type: 'v3', value: SIM.sunDirection },
          size:         { type: 'f',  value: size },
          radius:       { type: 'f',  value: radius },
          distance:     { type: 'f',  value: SCN.camera.distance },
        }),

        material  = new THREE.ShaderMaterial({
          uniforms,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(fragments),
        })

      ;

      for ( i=0, p=0; i < pool.length; i+=1, p+=3 ) {

        coord = pool[i];

        position.array[p + 0] = coord.x;
        position.array[p + 1] = coord.y;
        position.array[p + 2] = coord.z;

      }

      geometry.addAttribute( 'position',   position );
      
      mesh = new THREE.Points( geometry, material );

      mesh.onBeforeRender = function (renderer, scene, camera, geometry, material) {

        uniforms.sunDirection.value = SIM.sunDirection;
        uniforms.sunDirection.value.y = -uniforms.sunDirection.value.y; // why

        material.uniforms.distance.value = SCN.camera.distance;
        material.uniforms.distance.needsUpdate = true;

        uniforms.doe.value = (
          SIM.time.doe >= times.mindoe && SIM.time.doe <= times.maxdoe ? 
            SIM.time.doe - times.mindoe :
            -9999.0
        );

        uniforms.doe.needsUpdate = true;
        uniforms.sunDirection.needsUpdate = true;


      };

      model.obj.add(mesh);

      TIM.step('Model.clouds.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        float PI = 3.141592653589793;

        uniform float  doe;
        uniform float  size;
        uniform float  radius;
        uniform float  distance;

        varying float vSize;

        const  float NODATA = -9999.0;

        float saturate(float val) {
          return clamp(val, 0.0, 1.0);
        }

        vec2 uvSphere;

        float frac, fac1, fac2, val1, val2, value;

        ${frags.samplers2D}

        varying vec3 vNormal;

        void main() {

          uvSphere = vec2(
           saturate(((atan(position.x, position.z) / PI) + 1.0) / 2.0), 
           (0.5-(asin(position.y)/PI)) 
          );

          val1 = (
            ${frags.val1Ternary}
              NODATA
          );

          val2 = (
            ${frags.val2Ternary}
              NODATA
          );

          if (doe == NODATA){
            vSize = 0.0;
          
          } else if (val1 == NODATA) {
            vSize = 0.0;

          } else if (val2 == NODATA) {
            vSize = 0.0;

          } else {
            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            vSize = (val1 * fac1 + val2 * fac2) * 10.0;

          }

          // vSize = texture2D(tex1, uv).r;

          vNormal = normalize(position);

          gl_PointSize = vSize / (distance * distance) * 4.0;
          gl_Position  = projectionMatrix * modelViewMatrix * vec4( position * 1.01, 1.0 );

         }
      
      `;

    },
    fragmentShader: function () {

      return `

        uniform float opacity;
        uniform vec3 sunDirection;

        varying float vSize;
        varying vec3 vNormal;

        // light
        float dotNL;

        // day night
        float dnMix, dnZone, grey;
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


          if (vSize < 0.15) discard;

          // gl_FragColor = vec4(1.0, 1.0, 1.0, dnMix); // works
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

        }

      `;

    }

  };

}());
