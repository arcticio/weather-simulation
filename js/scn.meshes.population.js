
SCN.Meshes.population = function (name, cfg, callback) {

  var 
    i, city, vec3,
    amount    = CITIES.length,
    toVec3    = function (lat, lon) {
      return TOOLS.latLonRadToVector3(lat, lon, cfg.radius);
    },

    vertexShader = `

      attribute float size;

      uniform float radius;
      uniform float distance;

      void main() {
        gl_PointSize = size * mix(2.0, 0.3, distance);
        gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
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
          vec3 color2   = mix(ucolor, color1.rgb, 0.1);
          gl_FragColor  = vec4( color2, opacity);

        }

      }

    `,

    uniforms ={
      'map':        { type: 't', value: CFG.Textures['dot.white.128.png'] },
      'opacity':    { type: 'f', value: cfg.opacity },
      'distance':   { type: 'f', value: SCN.camera.distance },
      'ucolor':     { type: 'c', value: cfg.color },
    },

    material  = new THREE.ShaderMaterial({ 
      uniforms,
      vertexShader,
      fragmentShader,
      transparent:    true,
      blending:       THREE.AdditiveBlending,
    }),

    size      = new Float32Array( amount * 1 ),
    positions = new Float32Array( amount * 3 ),
    geometry  = new THREE.BufferGeometry(),
    mesh      = new THREE.Points( geometry, material ),

    onBeforeRender = function () {
      material.uniforms.distance.value = SCN.camera.distance;
      material.uniforms.distance.needsUpdate = true;
    }

  ;

  for (i=0; i<amount; i++) {

    city = CITIES[i];
    vec3 = toVec3(city.lat, city.lon);

    positions[i*3 + 0] = vec3.x;
    positions[i*3 + 1] = vec3.y;
    positions[i*3 + 2] = vec3.z;

    size[i] = H.clampScale(city.pop, 1e6, 22e6, 3.0, 22.0); // Tokyo = 22Mill / 22e6

  }

  geometry.addAttribute( 'size',     new THREE.BufferAttribute( size,      1 ) );
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

  mesh.onBeforeRender = onBeforeRender;

  callback(name, mesh);

};
