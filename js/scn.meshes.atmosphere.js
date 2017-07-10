
// http://localhost:8765/1Y/2017-06-20-13-03/-0.19155;0.010723;5.670312

SCN.Meshes.atmosphere = function (name, cfg, callback) {

  var
    transparent  = true,
    geometry     = new THREE.SphereGeometry(cfg.radius, 128, 128),
    vertexShader = `

      varying vec3 vNormal, vPosition;
      
      void main() {

        vNormal   = normal;
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

        gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      }
    `,
    fragmentShader = `

      uniform float opacity;
      uniform vec3  sunPosition;
      uniform mat4  modelMatrix;       // = atmo model matrix
      uniform mat3  normalMatrix;      // = inverse transpose of modelViewMatrix

      varying vec3  vNormal, vPosition;

      float fresnel, atmoFactor, reflecting, dotLight;

      vec3 worldNormal, worldView;
      vec3 color, colorDay, colorDark, colorSunset, colorNight;

      void main() {
        
        worldNormal = normalize ( normalMatrix * vNormal );                            
        worldView   = normalize ( cameraPosition -  (modelMatrix * vec4(vPosition, 1.0)).xyz );

        // dot world space normal with world space sun vector
        dotLight    = dot(worldNormal, sunPosition);

        // fresnel factor
        fresnel     = 1.0 - max(dot(worldNormal, worldView), 0.0);
        reflecting  = max(0.0, dot(reflect(worldView, worldNormal), sunPosition));

        atmoFactor  = max(0.0, pow(fresnel * 1.5, 1.5)) - max(0.0, pow(fresnel, 15.0)) * 6.0;

        colorDay    = vec3( 0.3,  0.7,  1.0);
        colorDark   = vec3( 0.0,  0.0,  0.5);
        colorSunset = vec3( 1.0,  0.3,  0.1);
        colorNight  = vec3( 0.05, 0.05, 0.1);
        
        colorDark   = mix(
          colorDark, 
          colorSunset + colorSunset * reflecting * 2.0, 
          pow(reflecting, 16.0) * max(0.0, dotLight + 0.7)
        );
        
        // colorDark = vec3(1.0, 0.0, 0.0);

        color  = mix(colorDay, colorDark,  min(1.0, (dotLight / 2.0 + 0.6) * 1.7));
        color  = mix(color,    colorNight, min(1.0, (dotLight / 2.0 + 0.4) * 1.5));
        color *= atmoFactor;
        
        gl_FragColor = vec4(color, opacity);

      }
    `,

    uniforms = {
      sunPosition: {'type': 'v3', 'value': SIM.sunDirection},
      opacity:     {'type': 'f',  'value': cfg.opacity},
    },

    mesh = new THREE.Mesh( geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent,
        uniforms,
      }) 
    ),

    onBeforeRender = function () {
      uniforms.sunPosition.value = SIM.sunDirection;
      uniforms.sunPosition.needsUpdate = true;
    }
  ;

  mesh.onBeforeRender = onBeforeRender;

  cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

  callback(name, mesh);

};
