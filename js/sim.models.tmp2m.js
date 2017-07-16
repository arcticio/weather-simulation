
SIM.Models.tmp2m = (function () {

  var 
    self, cfg, times, vari,
    model = {
      obj:          new THREE.Object3D(),
      urls:         [],
    },
    frags = {
      samplers2D:   '',
      val1Ternary:  '',
      val2Ternary:  '',
      palette:      '',
    }
  ;

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
    prepareFragmentShader: function () {

      var amount = Math.ceil(times.length / 4);

      frags.samplers2D = H.range(1, amount + 1).map( n => '\n  uniform sampler2D tex' + n + ';').join('');

      frags.val1Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4) + 1),
          p = {0:'r', 1:'g', 2:'b', 3:'a'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', vUv ).' + p + ' :';
      }).join('');

      frags.val2Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4 + 0.25) + 1),
          p = {0:'g', 1:'b', 2:'a', 3:'r'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', vUv ).' + p + ' :';
      }).join('');

      Object
        .keys(cfg.sim.palette)
        .sort( (a,b) => parseFloat(a)-parseFloat(b))
        .forEach( key => {

          var 
            col = cfg.sim.palette[key],
            t = parseFloat(key).toFixed(1),
            c = col.r.toFixed(3) + ', ' + col.g.toFixed(3) + ', ' + col.b.toFixed(3);

          if (t !== '999.0') {
            frags.palette += '  value < ' + t + ' ? vec3(' + c + ') : \n';

          } else {
            frags.palette += '    vec3(' + c + ')\n';
          }

        })
      ;

    },
    prepare: function ( ) {

      var
        t0 = Date.now(), 

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,

        geometry  = cfg.geometry,
        textures  = self.prepareTextures(datagrams),
        fragments = self.prepareFragmentShader(),

        uniforms  = Object.assign(textures, {
          doe:          { type: 'f',   value: doe - mindoe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection.clone() },
        }),
        
        material  = new THREE.ShaderMaterial({
          uniforms,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(fragments),
        }),

        onBeforeRender =  function () {

          uniforms.sunDirection.value.copy(SIM.sunDirection);
          uniforms.sunDirection.value.y *= -1; // why
          uniforms.sunDirection.needsUpdate = true;

          uniforms.doe.value = (
            SIM.time.doe >= times.mindoe && SIM.time.doe <= times.maxdoe ? 
              SIM.time.doe - times.mindoe :
              -9999.0
          );

          uniforms.doe.needsUpdate = true;

        },

        mesh = new THREE.Mesh( geometry, material )

      ;

      mesh.onBeforeRender = onBeforeRender;
      mesh.name = 'sector';
      model.obj.add(mesh);

      TIM.step('SIM.tmp2m.out', Date.now() -t0, 'ms');

      return model;

    },

    // https://stackoverflow.com/questions/37342114/three-js-shadermaterial-lighting-not-working
    // https://jsfiddle.net/2pha/h83py9gu/ fog + shadermaterial
    // https://github.com/borismus/webvr-boilerplate/blob/master/node_modules/three/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl

    vertexShader: function () {
      
      return `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;

          // wanted just y flipped
          vNormal = normal;

          // camera rotates, light doesn't
          // vNormal = normalize( normalMatrix * normal );



          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

    },
    fragmentShader: function () {

      return `

        uniform float opacity;
        uniform vec3 sunDirection;

        ${frags.samplers2D}

        varying vec2 vUv;
        varying vec3 vNormal;

        // light
        float dotNL;

        // temperatur and time
        const  float NODATA = -9999.0;
        vec3 color;
        uniform float doe;
        float frac, fac1, fac2, val1, val2, value;

        // day night
        float dnMix, dnZone;
        float dnSharpness = 4.0;
        float dnFactor    = 0.2; // 0.15;

        void main() {

          // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
          dotNL = dot(normalize(vNormal), sunDirection);

          // sharpen the edge beween the transition
          dnZone = clamp( dotNL * dnSharpness, -1.0, 1.0);

          // convert to 0 to 1 for mixing, 0.5 for full range
          dnMix = 0.5 - dnZone * dnFactor;

          val1 = (
            ${frags.val1Ternary}
              NODATA
          );

          val2 = (
            ${frags.val2Ternary}
              NODATA
          );

          if (doe == NODATA){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
          
          } else if (val1 == NODATA) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 0.1);

          } else if (val2 == NODATA) {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 0.1);

          } else {
            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = (val1 * fac1 + val2 * fac2) ;
            value = -30.01 + value * 70.0 ;

            color = (
              ${frags.palette}
            );

            // gl_FragColor = vec4(color * dnMix, opacity);
            gl_FragColor = vec4(color, opacity);

            // debug
            // gl_FragColor = vec4(dnMix, dnMix, dnMix, 0.5);

          }
          
        }

      `;

    },

  };

}());
