
// http://localhost:8765/1Y/2017-06-20-13-03/-0.19155;0.010723;5.670312

SCN.Meshes.atmosphere = function (name, cfg, callback) {

  var
    geometry     = new THREE.SphereGeometry(cfg.radius, 128, 128),
    vertexShader = `

      varying vec3 vNormal, vPosition;
      
      void main() {

        vNormal     = normalize((modelMatrix * vec4(normal, 0.0)).xyz); 
        vPosition   = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      }
    `,
    fragmentShader = `

      const vec4 lightDay   = vec4(0.1, 0.05, 0.0, 0.1);
      const vec4 lightNight = vec4(0.0, 0.0,  0.1, 0.6);

      uniform float opacity;
      uniform vec3  sunDirection;
      uniform mat4  modelMatrix;       // = atmo model matrix
      uniform mat3  normalMatrix;      // = inverse transpose of modelViewMatrix

      varying vec3  vNormal, vPosition;

      float fresnel, atmoFactor, reflecting, dotLight;

      vec3 worldNormal, worldView;
      vec3 color, colorDay, colorDark, colorSunset, colorNight;

      // light
      float dotNL;

      float dnMix, dnZone;
      float dnSharpness = 8.0;  // was 4.0, 1.0 very soft, 8.0 
      float dnFactor    = 0.5;  // 
      float dnOffset    = 0.8;

      void main() {

        // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
        dotNL = dot(vNormal, sunDirection);

        // sharpen the edge beween the transition
        dnZone = clamp( dotNL * dnSharpness, -1.0, 1.0);

        // convert to 0 to 1 for mixing, 0.5 for full range
        dnMix = dnOffset - dnZone * dnFactor;
        dnMix = 0.5 - dnZone * 0.5;
        
        gl_FragColor = mix(lightDay, lightNight, dnMix);

        return ;



        // worldNormal  = normalize ( normalMatrix * vNormal );     
        // sunDirection = normalize(sunDirection);                       

        vec3 eyeDirection = normalize(cameraPosition);

        dotLight     = dot(vNormal, sunDirection); 

        fresnel      = 1.0 - max(dot(vNormal, sunDirection), 0.0);
        reflecting   = max(0.0, dot(reflect(sunDirection, vNormal), eyeDirection));
        atmoFactor   = max(0.0, pow(fresnel * 1.5, 1.5)) - max(0.0, pow(fresnel, 15.0)) * 6.0;


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

        return;

        vec3 color   = vec3(0.1, 0.2, 0.5) * atmoFactor;

        gl_FragColor = vec4(color, dotLight < 0.13 ? 0.8  : 0.8 * atmoFactor );

        return;

        
        worldNormal = normalize ( normalMatrix * vNormal );                            
        worldView   = normalize ( cameraPosition -  (modelMatrix * vec4(vPosition, 1.0)).xyz );


        // fresnel factor
        fresnel     = 1.0 - max(dot(worldNormal, worldView), 0.0);
        reflecting  = max(0.0, dot(reflect(worldView, worldNormal), sunDirection));

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

    fragmentShaderXX = `

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
      sunDirection: {'type': 'v3', 'value': SIM.sunDirection.clone()},
      opacity:      {'type': 'f',  'value': cfg.opacity},
    },

    mesh = new THREE.Mesh( geometry, new THREE.ShaderMaterial(
      Object.assign(cfg.material, {
        uniforms,
        vertexShader,
        fragmentShader,
      })
    )),

    onBeforeRender = function () {
      uniforms.sunDirection.value.copy(SIM.sunDirection);
      uniforms.sunDirection.needsUpdate = true;
    }
  ;

  mesh.onBeforeRender = onBeforeRender;

  callback(name, mesh);

};
