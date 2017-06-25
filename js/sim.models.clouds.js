
'use strict';

SIM.Models = SIM.Models || {};

SIM.Models.clouds = (function () {

  var 
    self,     
    cfg,
    datagram,
    model = {
      obj:     new THREE.Object3D(),
      objects: {},
      sectors: [],
      mindoe:  NaN,
      maxdoe:  NaN,
      step:   function () {
        H.each(model.sectors, (_, sec) => sec.step() )
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
    worker = new Worker('js/sim.models.clouds.worker.js'),

  end;

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
    // findDoes: function (target) {

    //   var doe1, doe2;

    //   Object.keys(model.objects)
    //     .sort( (a, b) =>  parseFloat(a) > parseFloat(b))
    //     .forEach( doe => {

    //       doe1 = doe < target          ? doe : doe1;
    //       doe2 = doe > target && !doe2 ? doe : doe2;

    //     });

    //     return [doe1, doe2];

    // },
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      model.show    = self.show;
      model.prepare = self.prepare;

      return model;

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
    prepare: function ( doe ) {
    
      TIM.step('Model.clouds.in', doe);

      if ( !datagram.tcdcclm.data[doe] ) {debugger;}

      var
        t0 = Date.now(),
        i, p, m, ibp, ibc, coord, points, material, percentage, 
        size     = cfg.size,
        amount   = cfg.amount,
        radius   = cfg.radius,
        pool     = SIM.coordsPool.slice(amount).pool,
        geometry = new THREE.BufferGeometry(),

        attributes = {
          percentage: new THREE.BufferAttribute( new Float32Array( amount * 1), 1 ),
          position:   new THREE.BufferAttribute( new Float32Array( amount * 3), 3 ),
        },

      end;

      for ( i=0, p=0; i < pool.length; i+=1, p+=3 ) {

        coord = pool[i];
        percentage = datagram.tcdcclm.linearXY(doe, coord.lat, coord.lon) / 100;

        attributes.position.array[p + 0] = coord.x;
        attributes.position.array[p + 1] = coord.y;
        attributes.position.array[p + 2] = coord.z;

        attributes.percentage.array[i + 0] = percentage;

      }

      geometry.addAttribute( 'position',   attributes.position );
      geometry.addAttribute( 'percentage', attributes.percentage );
      
      material = new THREE.ShaderMaterial( {
        uniforms:       {
          size:     { type: 'f', value: size },
          radius:   { type: 'f', value: radius },
          factor:   { type: 'f', value: 1.0 },
          seed:     { type: 'f', value: Math.random() },
          distance: { type: 'f', value: SCN.camera.position.length() - CFG.earth.radius },
        },
        vertexShader:   self.vertexShader(),
        fragmentShader: self.fragmentShader(),
        transparent:    true,
      });
      
      points = new THREE.Points( geometry, material );

      points.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
        material.uniforms.seed.value = Math.random();
        material.uniforms.seed.needsUpdate = true;
        material.uniforms.distance.value = camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.needsUpdate = true;
      };

      // model.obj.add(points);

      model.objects[doe] = points;
      self.updateMinMax();

      TIM.step('Model.clouds.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        attribute float percentage;

        uniform float  size;
        uniform float  radius;
        uniform float  distance;

        varying vec4  vColor;
        varying vec3  vPos;

        void main() {

          vec3 pos  = position * 2.0; // radius;
          vPos = position;

          vColor = vec4(1.0, 1.0, 1.0, percentage);

          gl_PointSize = size * percentage / (distance * 2.0);
          gl_Position  = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

         }
      
      `;

    },
    fragmentShader: function () {

      return `

        varying vec4 vColor;
        varying vec3 vPos;

        uniform float  factor;

        float rand(vec2 co){
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {

          if (rand(vPos.xy) > 0.5){
            gl_FragColor = vColor;

          } else {
            discard;

          }

        }

      `;

    }

  };

}());
