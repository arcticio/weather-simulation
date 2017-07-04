
SCN.Meshes.population = function (name, cfg, callback) {

  // check shaders here:
  // http://www.neveroccurs.com/lab/three.js/gpu_particles/?particles=256
  // http://alteredqualia.com/three/examples/webgl_cubes.html
  // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

  // TODO: make cities facing away from origin, implement lights

  var 
    i, city, vec3,
    amount    = CITIES.length,
    positions = new Float32Array( amount * 3 ),
    size      = new Float32Array( amount * 1 ),
    geometry  = new THREE.BufferGeometry(),
    toVec3    = function (lat, lon) {
      return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
    },
    clampScale = function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    vertexShader = `

      attribute float size;

      uniform float radius;

      void main() {
        gl_PointSize    = radius * size;
        gl_Position     = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }

    `,
    fragmentShader = `

      uniform sampler2D map;
      uniform vec3 ucolor;
      uniform float opacity;

      void main() {

        vec4 color1 = texture2D( map, gl_PointCoord ).rgba;

        if (color1.a <= 0.5 ) {
          discard;
        
        } else {
          vec3 color2   = mix(ucolor, color1.rgb, 0.5);
          gl_FragColor  = vec4( color2, opacity);

        }

      }

    `,
    material  = new THREE.ShaderMaterial({ 
      vertexShader,
      fragmentShader,
      transparent:    false,
      // vertexColors:   THREE.VertexColors,
      blending:       THREE.AdditiveBlending,
      uniforms: {
        'map':        { type: 't', value: CFG.Textures['dot.white.128.png'] },
        'opacity':    { type: 'f', value: cfg.opacity },
        'radius':     { type: 'f', value: cfg.radius },
        'ucolor':     { type: 'c', value: cfg.color },
      }
    }),
    points    = new THREE.Points( geometry, material )

  ;

  for (i=0; i<amount; i++) {

    city = CITIES[i];

    vec3 = toVec3(city.lat, city.lon);

    positions[i*3 + 0] = vec3.x;
    positions[i*3 + 1] = vec3.y;
    positions[i*3 + 2] = vec3.z;

    size[i] = ~~clampScale(city.pop, 1e6, 160e6, 2.0, 160.0); // Tokyo = 22Mill

  }

  geometry.addAttribute( 'size',     new THREE.BufferAttribute( size,     1 ) );
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

  geometry.computeBoundingSphere();

  callback(name, points);

};
