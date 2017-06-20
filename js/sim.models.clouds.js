
'use strict';

SIM.Models = SIM.Models || {};

SIM.Models.clouds = (function () {

  var 
    self,     
    cfg,
    datagram,
    model = {
      obj:     new THREE.Object3D(),
      sectors: [],
      step:   function () {
        H.each(model.sectors, (_, sec) => sec.step() )
      },
      calcUrls: function (mom) {
        return cfg.sim.patterns.map( pattern => cfg.sim.dataroot + mom.format(pattern));
      }
    },
    worker= new Worker('js/sim.models.clouds.worker.js'),

  end;

  var payload = new Float32Array([1,2,3,4,5,6]);

  worker.postMessage({topic: 'quadratic', payload, id: Date.now() }, [payload.buffer]);

  worker.onmessage = function (event) {
    // console.log('answer', event.data);
  };


  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      return model;

    },
    prepare: function ( doe ) {

    
      TIM.step('Model.clouds.in');

      var
        t0 = Date.now(),
        i, p, c, m, ibp, ibc, coord, points, material, color, 
        // doe      = H.date2doeFloat(mom.toDate()),
        size     = cfg.size,
        amount   = cfg.amount,
        radius   = cfg.radius,
        pool     = SIM.coordsPool.slice(amount).pool,
        geometry = new THREE.BufferGeometry(),

        attributes = {
          color:    new THREE.BufferAttribute( new Float32Array( amount * 1), 1 ),
          position: new THREE.BufferAttribute( new Float32Array( amount * 3), 3 ),
        },

      end;

      for ( i=0, c=0, p=0; i < pool.length; i+=1, p+=3, c+=1 ) {

        coord = pool[i];
        color = datagram.tcdcclm.linearXY(doe, coord.lat, coord.lon) / 100;

        attributes.position.array[p + 0] = coord.x;
        attributes.position.array[p + 1] = coord.y;
        attributes.position.array[p + 2] = coord.z;

        attributes.color.array[c + 0] = color;

      }

      geometry.addAttribute( 'position', attributes.position );
      geometry.addAttribute( 'color',    attributes.color );
      
      material = new THREE.ShaderMaterial( {
        uniforms:       {
          size:     { type: 'f', value: size },
          radius:   { type: 'f', value: radius },
          distance: { type: 'f', value: SCN.camera.position.length() - CFG.earth.radius },
        },
        vertexShader:   self.vertexShader(),
        fragmentShader: self.fragmentShader(),
        transparent:    true,
      });
      
      points = new THREE.Points( geometry, material );

      points.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
        material.uniforms.distance.value = camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.needsUpdate = true;
      };

      model.obj.add(points);

      TIM.step('Model.clouds.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        attribute float color;

        uniform float  size;
        uniform float  radius;
        uniform float  distance;

        varying vec4  vColor;

        void main() {

          vec3 pos = position * radius;

          vColor = vec4(0.9, 0.0, 0.0, 1.0);

          vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

          gl_PointSize = size * color / (distance * 2.0);

          gl_Position  = projectionMatrix * mvPosition;

         }
      
      `;

    },
    fragmentShader: function () {

      return `

        varying vec4 vColor;

        void main() {

          gl_FragColor = vColor;

        }

      `;

    }

  };

}());
