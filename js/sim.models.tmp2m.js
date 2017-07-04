
SIM.Models.tmp2m = (function () {

  var 
    self, cfg, datagram,
    model = {
      obj:      new THREE.Object3D(),
      urls:     [],
      minDoe:   NaN,
      maxDoe:   NaN,
    }
  ;

  return self = {
    create: function (config, moms, simdata) {

      cfg = config;
      datagram = simdata;
      model.prepare = self.prepare;

      self.calcUrls(moms);
      self.calcMinMax(moms);

      return model;

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
    prepare: function ( doe ) {


      TIM.step('Model.variables.in', doe);

      var
        t0 = Date.now(), 
        
        doe1       = doe - (doe % 0.25),
        doe2       = doe1 + 0.25,
        doe3       = doe2 + 0.25,
        doe4       = doe3 + 0.25,
        
        geometry = new THREE.SphereBufferGeometry(cfg.radius, 48, 24),

        texture = datagram[cfg.sim.variable].doetexture(doe1, doe2, doe3, doe4),

        // texture = CFG.Textures['oceanmask.4096x2048.grey.png'],

        // textures = [
        //   datagram[cfg.sim.variable].datatexture(doe1),
        //   datagram[cfg.sim.variable].datatexture(doe2),
        // ],

        // ownuniforms   = {
        //   doe:          { type: 'f',   value: doe },
        //   opacity:      { type: 'f',   value: cfg.opacity },
        //   sunDirection: { type: 'v3',  value: SIM.sunDirection },

        //   texture:      { type: 't',   value: texture }, 
        // },


        // uniforms   = THREE.UniformsUtils.merge([
        //     ownuniforms       
        // ]),

        uniforms = {
          texture:      { type: 't',   value: texture }, 
          doe:          { type: 'f',   value: doe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection },
        },
        
        material   = new THREE.ShaderMaterial({
          uniforms,
          // lights:         true,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(),
          // side:           THREE.FrontSide,
          // vertexColors:   THREE.NoColors,
        }),

        mesh = new THREE.Mesh( geometry, material )

      ;

      model.obj.add(mesh);
      // mesh.onAfterRender = onAfterRender;

      TIM.step('Model.variables.out', Date.now() -t0, 'ms');

      return model;

    },


    prepareXXX: function ( doe ) {

      TIM.step('Model.variables.in', doe);

      var
        t0 = Date.now(), 
        
        doe1       = doe - (doe % 0.25),
        doe2       = doe1 + 0.25,
        
        geometry = new THREE.SphereBufferGeometry(cfg.radius, 359, 180),

        attributes = {
          doe1:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe1), 1 ),
          doe2:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe2), 1 ),
        },

        ownuniforms   = {
          doe:          { type: 'f',   value: doe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection },
        },

        uniforms   = THREE.UniformsUtils.merge([
            // THREE.UniformsLib[ 'lights' ],
            ownuniforms       
        ]),
        
        material   = new THREE.ShaderMaterial({
          uniforms,
          // lights:         true,
          transparent:    true,
          vertexShader:   self.vertexShader(),
          fragmentShader: self.fragmentShader(),
          // side:           THREE.FrontSide,
          // vertexColors:   THREE.NoColors,
        }),
      
        onAfterRender = function  () {

          var
            doe = SIM.time.doe, 
            datagramm = datagram[cfg.sim.variable];

          uniforms.doe.value = doe;

          // check bounds
          if ( doe >= model.minDoe && doe <= model.maxDoe ) {

            // check whether update needed
            if (doe < doe1 || doe > doe2) {

              doe1 = doe  - (doe % 0.25);
              doe2 = doe1 + 0.25;

              geometry.attributes.doe1.array = datagramm.attribute(doe1);
              geometry.attributes.doe2.array = datagramm.attribute(doe2);

              geometry.attributes.doe1.needsUpdate = true;
              geometry.attributes.doe2.needsUpdate = true;

            }

          } else {
            uniforms.doe.value = 0.0;

          }

          uniforms.doe.needsUpdate          = true;
          uniforms.sunDirection.value       = SIM.sunDirection;
          uniforms.sunDirection.needsUpdate = true;

        },

        mesh = new THREE.Mesh( geometry, material )

      ;

      geometry.addAttribute( 'doe1', attributes.doe1 );
      geometry.addAttribute( 'doe2', attributes.doe2 );

      model.obj.add(mesh);
      mesh.onAfterRender = onAfterRender;

      TIM.step('Model.variables.out', Date.now() -t0, 'ms');

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
    fragmentShader: function () {

      return `

        uniform float doe;

        uniform sampler2D texture;

        float frac, fac1, fac2, value;

        varying vec2 vUv;

        vec3 color;

        void main() {

          // vec4 lookup = texture2D( texture, vUv );
          // float val = lookup.x;

          float value = texture2D( texture, vUv ).x;
          // float g = texture2D( texture, vUv ).y;
          // float b = texture2D( texture, vUv ).z;

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



          gl_FragColor = vec4(color, 0.5);
          
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
