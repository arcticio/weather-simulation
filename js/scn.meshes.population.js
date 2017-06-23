
'use strict'

SCN.Meshes.population = function (cfg) {

  // check shaders here:
  // http://www.neveroccurs.com/lab/three.js/gpu_particles/?particles=256
  // http://alteredqualia.com/three/examples/webgl_cubes.html
  // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

  // TODO: make cities facing away from origin, implement lights

  var 
    i, city, vec3, light, color, 
    amount    = CITIES.length,
    positions = new Float32Array( amount * 3 ),
    sizes     = new Float32Array( amount * 1 ),
    geometry  = new THREE.BufferGeometry(),
    texture   = new THREE.TextureLoader().load('images/red.dot.png', function () {
      material.uniforms.map.needsUpdate = true;
    }),
    toVec3    = function (lat, lon) {
      return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
    },
    clampScale = function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    vertexShader = `
      attribute float sizes;
      varying vec2 vUv;  
      uniform float radius;

      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize    = radius * sizes;
        gl_Position     = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader = `
      uniform sampler2D map;
      uniform vec3 ucolor;
      uniform float opacity;

      float factor = 0.8;

      void main() {
        vec3 color1 = texture2D( map, gl_PointCoord ).rgb;
        vec3 color2 = mix(ucolor, color1, factor);
        gl_FragColor    = vec4( color2, opacity );
      }
    `,
    material  = new THREE.ShaderMaterial({ 
      vertexShader,
      fragmentShader,
      vertexColors: THREE.VertexColors,
      blending:     THREE.AdditiveBlending,
      uniforms: {
        'map':      { type: 't', value: texture },
        'opacity':  { type: 'f', value: cfg.opacity },
        'radius':   { type: 'f', value: cfg.radius },
        'ucolor':   { type: 'c', value: cfg.ucolor },
      }
    }),
    points    = new THREE.Points( geometry, material ),

  end;

  for (i=0; i<amount; i++) {

    city = CITIES[i];

    vec3 = toVec3(city.lat, city.lon);

    positions[i*3 + 0] = vec3.x;
    positions[i*3 + 1] = vec3.y;
    positions[i*3 + 2] = vec3.z;

    sizes[i] = ~~clampScale(city.pop, 1e6, 160e6, 2.0, 160.0); // Tokyo = 22Mill

  }

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'sizes', new THREE.BufferAttribute( sizes, 1 ) );

  geometry.computeBoundingSphere();

  return points;

};
