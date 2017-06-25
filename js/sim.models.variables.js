
'use strict';

SIM.Models = SIM.Models || {};

SIM.Models.variables = (function () {

  var 
    self,     
    cfg,
    basedoe,
    datagram,
    model = {
      obj:     new THREE.Object3D(),
      step:   function () {
        // H.each(model.sectors, (_, sec) => sec.step() )
      },
      url2doe: function (url) {

        // "data/gfs/tcdcclm/2017-06-15-12.tcdcclm.10.dods"
        // TODO: deal with multiple patterns

        var 
          file = url.split('/').slice(-1)[0],
          mom  = moment.utc(file, cfg.sim.patterns[0]);

        return mom.toDate() / 864e5;

      },
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
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    findDoes: function (target) {

      var doe1, doe2;

      Object.keys(model.objects)
        .sort( (a, b) =>  parseFloat(a) > parseFloat(b))
        .forEach( doe => {

          doe1 = doe < target          ? doe : doe1;
          doe2 = doe > target && !doe2 ? doe : doe2;

        });

        return [doe1, doe2];

    },
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      model.show    = self.show;
      model.prepare = self.prepare;

      return model;

    },
    show: function (doe) {

      var 
        mesh = model.obj.children[0],
        doe1 = doe - (doe % 0.25),
        doe2 = doe1 + 0.25;

      if (doe1 !== basedoe){

        mesh.geometry.attributes.doe1.array = datagram['tmp2m'].attribute(doe1);
        mesh.geometry.attributes.doe2.array = datagram['tmp2m'].attribute(doe2);

        mesh.geometry.attributes.doe1.needsUpdate = true;
        mesh.geometry.attributes.doe2.needsUpdate = true;

      }

      mesh.material.uniforms.doe.value = doe;
      mesh.material.uniforms.doe.needsUpdate = true;

    },
    prepare: function ( doe ) {

      TIM.step('Model.variables.in', doe);

      var
        t0 = Date.now(),
        i, material, 
        doe1     = doe - (doe % 0.25),
        doe2     = doe1 + 0.25,
        amount   = 180 * 360,
        radius   = cfg.radius,
        geometry = new THREE.SphereBufferGeometry(cfg.radius, 359, 180),
 
        attributes = {
          doe1:    new THREE.BufferAttribute( datagram['tmp2m'].attribute(doe1), 1 ),
          doe2:    new THREE.BufferAttribute( datagram['tmp2m'].attribute(doe2), 1 ),
        },

        uniforms = {
          sunPosition: {'type': 'v3', 'value': SIM.sunVector},
          opacity:     {'type': 'f',  'value': cfg.opacity},
          doe:         {'type': 'f',  'value': cfg.doe},
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

      basedoe = doe1;
      model.obj.add(mesh);

      mesh.onBeforeRender = function () {
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

        uniform float doe;

        varying float vValue;
        varying vec3 vNormal, vPosition;
        
        void main() {

          vNormal   = normal;
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

          vValue = doe1;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
      
      `;

    },
    fragmentShader: function () {

      return `

        // precision highp int;
        // precision highp float;

        uniform float opacity, doe;
        uniform vec3  sunPosition;
        uniform mat4  modelMatrix;       // = object.matrixWorld
        uniform mat3  normalMatrix;      // = inverse transpose of modelViewMatrix

        varying float vValue;
        varying vec3  vNormal, vPosition;

        float value, fresnel, atmoFactor, reflecting, dotLight;

        vec3 worldNormal, worldView;
        vec3 color, colorDay, colorDark, colorSunset, colorNight;

        float scale (float x, float xMin, float xMax, float min, float max) {

          return (max - min) * (x - xMin) / (xMax - xMin) + min;

        }

        void main() {
          
          worldNormal = normalize ( normalMatrix * vNormal );                            
          worldView   = normalize ( cameraPosition -  (modelMatrix * vec4(vPosition, 1.0)).xyz );

          // dot world space normal with world space sun vector
          dotLight    = dot(worldNormal, sunPosition);

          value = scale(-273.15 + vValue, -40.0, +40.0, 0.0, 1.0);

          value = (
            value < 0.1 ? 0.1 :
            value < 0.2 ? 0.2 :
            value < 0.3 ? 0.3 :
            value < 0.4 ? 0.4 :
            value < 0.5 ? 0.5 :
            value < 0.6 ? 0.6 :
            value < 0.7 ? 0.7 :
            value < 0.8 ? 0.8 :
            value < 0.9 ? 0.9 :
            1.0
          );

          // value = (vValue) * 1.0; //(vValue + 1.0 ) / 2.0;

          gl_FragColor = vec4(value, value * 0.5, 0.0, 0.8);

        }

      `;

    }

  };

}());
