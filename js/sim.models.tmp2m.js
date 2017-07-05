
SIM.Models.tmp2m = (function () {

  var 
    self, cfg, times, vari,
    model = {
      obj:      new THREE.Object3D(),
      urls:     [],
    }
  ;

  return self = {
    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;
      vari  = cfg.sim.variable;

      // expose 
      model.prepare = self.prepare;

      // prepare for loader
      self.calcUrls();

      // done
      return model;

    },
    calcUrls: function () {

      times.moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
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
        scaler   = (d) => self.clampScale(d, 243.15, 313.75, 0, 255)
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

      // doe < 0.25 ? texture2D( tex1, vUv ).r : 

      var 
        frags = {
          samplers2D:  '',
          val1Ternary: '',
          val2Ternary: '',
        },
        amount = Math.ceil(times.length / 4);

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

      return frags;

    },
    prepare: function ( ) {

      var
        t0 = Date.now(), 

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,

        geometry  = new THREE.SphereBufferGeometry(cfg.radius, 64, 32),
        textures  = self.prepareTextures(datagrams),
        fragments = self.prepareFragmentShader(),

        uniforms  = Object.assign(textures, {
          doe:          { type: 'f',   value: doe - mindoe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection },
        }),
        
        material  = new THREE.ShaderMaterial({
          uniforms,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(fragments),
          // lights:         true,
          // side:           THREE.FrontSide,
          // vertexColors:   THREE.NoColors,
        }),

        onBeforeRender =  function () {

          uniforms.doe.value = (
            SIM.time.doe >= times.mindoe && SIM.time.doe <= times.maxdoe ? 
            uniforms.doe.value = SIM.time.doe - times.mindoe :
            uniforms.doe.value = -9999.0
          );

          uniforms.doe.needsUpdate = true;

        },

        mesh = new THREE.Mesh( geometry, material )

      ;

      model.obj.add(mesh);
      mesh.onBeforeRender = onBeforeRender;

      TIM.step('Model.tmp2m.out', Date.now() -t0, 'ms');

      return model;

    },

    // https://stackoverflow.com/questions/37342114/three-js-shadermaterial-lighting-not-working
    // https://jsfiddle.net/2pha/h83py9gu/ fog + shadermaterial
    // https://github.com/borismus/webvr-boilerplate/blob/master/node_modules/three/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl

    vertexShader: function () {
      
      return `

        varying vec2 vUv;

        void main() {

          vUv = uv;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
      
      `;

    },
    fragmentShader: function (frags) {

      return `

        uniform float doe;

        ${frags.samplers2D}

        float frac, fac1, fac2, val1, val2, value;

        varying vec2 vUv;

        vec3 color;

        void main() {

          val1 = (
            ${frags.val1Ternary}
              -9999.0
          );

          val2 = (
            ${frags.val2Ternary}
              -9999.0
          );

          if (doe == -9999.0){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
          
          } else if (val1 == -9999.0) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 0.1);

          } else if (val2 == -9999.0) {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 0.1);

          } else {
            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = (val1 * fac1 + val2 * fac2) ;
            value = -30.01 + value * 70.0 ;

            color = (
              value < -30.0 ? vec3(0.666, 0.400, 0.666) : // dark violett
              value < -20.0 ? vec3(0.807, 0.607, 0.898) :
              value < -10.0 ? vec3(0.423, 0.807, 0.886) :
              value <  +0.0 ? vec3(0.423, 0.937, 0.423) :
              value < +10.0 ? vec3(0.929, 0.976, 0.423) :
              value < +20.0 ? vec3(0.984, 0.792, 0.384) :
              value < +30.0 ? vec3(0.984, 0.396, 0.305) :
              value < +40.0 ? vec3(0.800, 0.250, 0.250) :
                vec3(0.600, 0.150, 0.150)                  // dark red
            );

            gl_FragColor = vec4(color, 0.3);

          }
          
        }

      `;

    },

    vertexShaderXXX: function () {
      
      return `

        attribute float doe1;
        attribute float doe2;

        varying float vData1;
        varying float vData2;

        void main() {

          vData1 = doe1;
          vData2 = doe2;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
      
      `;

    },

  };

}());
