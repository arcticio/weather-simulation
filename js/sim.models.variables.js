
'use strict';

SIM.Models = SIM.Models || {};

SIM.Models.variables = (function () {

  var 
    self,     
    cfg,
    datagram,
    model = {
      obj: new THREE.Object3D(),
      calcUrls: function (moms) {

        var urls = [];

        moms.forEach(mom => {
          cfg.sim.patterns.forEach(pattern => {
            urls.push(cfg.sim.dataroot + mom.format(pattern))
          });
        });

        return urls;

      },
    },

  end;

  return self = {
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      model.prepare = self.prepare;

      return model;

    },
    prepare: function ( doe ) {

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

        uniforms = {
          doe:         { type: 'f',   value: doe },
          opacity:     { type: 'f',   value: cfg.opacity },
          sunPosition: { type: 'v3',  value: SIM.sunVector },
        },
        
        material = new THREE.ShaderMaterial( {
          uniforms,
          vertexShader:   self.vertexShader(),
          fragmentShader: self.fragmentShader(),
          transparent:    true,
          side:           THREE.FrontSide,
          vertexColors:   THREE.NoColors,
        }),
      
        mesh = new THREE.Mesh( geometry, material )

      end;

      geometry.addAttribute( 'doe1', attributes.doe1 );
      geometry.addAttribute( 'doe2', attributes.doe2 );

      model.obj.add(mesh);

      function updateDoe (doe) {

        var attrDoe1, attrDoe2, datagramm = datagram[cfg.sim.variable];

        uniforms.doe.value = doe;

        if (doe < doe1 || doe > doe2) {

          doe1 = doe  - (doe % 0.25);
          doe2 = doe1 + 0.25;

          attrDoe1 = datagramm.attribute(doe1);
          attrDoe2 = datagramm.attribute(doe2);

          if ( attrDoe1 && attrDoe2 ) {

            // console.log('updated', doe1, doe2, doe);

            geometry.attributes.doe1.array = attrDoe1;
            geometry.attributes.doe2.array = attrDoe2;

            geometry.attributes.doe1.needsUpdate = true;
            geometry.attributes.doe2.needsUpdate = true;

          } else {

            // out of range condition
            uniforms.doe.value = 0.0;
            // console.log('updated', 0);

          }

        }

      }

      mesh.onAfterRender = function () {
        updateDoe(SIM.time.doe);
        uniforms.doe.needsUpdate = true;
        uniforms.sunPosition.value = SIM.sunVector;
        uniforms.sunPosition.needsUpdate = true;

      };

      TIM.step('Model.variables.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
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
    fragmentShader: function () {

      return `

        // precision highp int;
        // precision highp float;

        uniform float doe;

        varying float vData1;
        varying float vData2;

        float frac, fac1, fac2, value;

        vec3 color;

        void main() {

          if (doe < 1.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4); // error

          } else {

            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = -273.15 + (vData1 * fac1 + vData2 * fac2) ;

            color = (
              value < -30.0 ? vec3(0.6666666, 0.4000000, 0.666666) : // dark violett
              value < -20.0 ? vec3(0.8078431, 0.6078431, 0.898039) :
              value < -10.0 ? vec3(0.4235294, 0.8078431, 0.886274) :
              value <  +0.0 ? vec3(0.4235294, 0.9372549, 0.423529) :
              value < +10.0 ? vec3(0.9294117, 0.9764705, 0.423529) :
              value < +20.0 ? vec3(0.9843137, 0.7921568, 0.384313) :
              value < +30.0 ? vec3(0.9843137, 0.3960784, 0.305882) :
                vec3(0.8000000, 0.2509803, 0.250980)                 // dark red
            );

              gl_FragColor = vec4(color, 0.4);

          }
          

        }

      `;

    }

  };

}());
