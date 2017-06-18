
'use strict'

SCN.Meshes = {

  calculate:  function (name, cfg) { return SCN.Meshes[name](cfg) },
  atmosphere: function (cfg, callback) {

    var
      geometry     = new THREE.SphereGeometry(cfg.radius, 128, 128),
      vertexShader = `

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 cameraVector;
        varying vec3 vPosition;
        
        void main() {

          vNormal = normal;
          vUv     = uv;

          vec4 vPosition4 = modelMatrix * vec4(position, 1.0);
          vPosition = vPosition4.xyz;
          cameraVector = cameraPosition - vPosition;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,

/*

      float PI       = 3.14159265358979323846264;
      vec3 light     = pointLightPosition - vPosition;
      vec3 cameraDir = normalize(cameraVector);
      vec3 newNormal = bumpNormal(normalMap, vUv);
      
      light = normalize(light);
      
      float lightAngle = max(0.0, dot(newNormal, light));
      float viewAngle  = max(0.0, dot(vNormal, cameraDir));

      float adjustedLightAngle = min(0.6, lightAngle) / 0.6;
      float adjustedViewAngle  = min(0.65, viewAngle) / 0.65;
      float invertedViewAngle  = pow(acos(viewAngle), 3.0) * 0.4;
      
      float dProd = 0.0;
      dProd += 0.5 * lightAngle;
      dProd += 0.2 * lightAngle * (invertedViewAngle - 0.1);
      dProd += invertedViewAngle * 0.5 * (max(-0.35, dot(vNormal, light)) + 0.35);
      dProd *= 0.7 + pow(invertedViewAngle/(PI/2.0), 2.0);
      dProd *= 0.5;

      vec4 atmColor = vec4(dProd, dProd, dProd, 1.0);
      
      vec4 texelColor = texture2D(map, vUv) * min(asin(lightAngle), 1.0);
      gl_FragColor = texelColor + min(atmColor, 0.8);

*/

      fragmentShader = `

        uniform vec3  sunPosition;
        uniform vec3  color;
        uniform float intensity;

        varying vec2 vUv;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 cameraVector;

        vec3 dNormalW;
        vec3 dViewDirW;

        uniform mat4 modelMatrix;       // = object.matrixWorld
        uniform mat4 modelViewMatrix;   // = camera.matrixWorldInverse * object.matrixWorld
        uniform mat3 normalMatrix;      // = inverse transpose of modelViewMatrix
        uniform mat4 projectionMatrix;  // = camera.projectionMatrix
        // uniform mat4 viewMatrix;     // = camera.matrixWorldInverse


        mat3 inverse(mat3 m) {
          float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
          float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
          float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

          float b01 = a22 * a11 - a12 * a21;
          float b11 = -a22 * a10 + a12 * a20;
          float b21 = a21 * a10 - a11 * a20;

          float det = a00 * b01 + a01 * b11 + a02 * b21;

          return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
                      b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
                      b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
        }

        vec3 idNormalW;

        float fresnel;
        float atmoFactor;
        float reflecting;

        vec3 atmoColorDay;
        vec3 atmoColorDark;
        vec3 atmoColorSunset;
        vec3 atmoColorNight;
        vec3 atmoColor;

        vec3 camPos;
        vec3 sunPos;

        vec4 getEmission() {
          
          sunPos = sunPosition;
          camPos = cameraPosition;

          dNormalW  = normalize ( normalMatrix * vNormal );                             // org
          dViewDirW = normalize ( camPos -  (modelMatrix * vec4(vPosition, 1.0)).xyz ); // org


          // idNormalW  = normalize ( inverse(normalMatrix) * vNormal );    // better;                          
          // // dNormalW  = vNormal;                                       // stopps fx from rotating with planet
          // dViewDirW = normalize( vPosition - (viewMatrix * vec4(camPos, 1.0)).xyz ); 


          // Dot the world space normal with the world space directional light vector
          float nDotL = dot(dNormalW, sunPos);

          // fresnel factor
          fresnel = 1.0 - max(dot(dNormalW, dViewDirW), 0.0);

          atmoFactor      = max(0.0, pow(fresnel * 1.5, 1.5)) - max(0.0, pow(fresnel, 15.0)) * 6.0;
          atmoColorDay    = vec3(0.3, 0.7, 1);
          atmoColorDark   = vec3(0, 0, 0.5);
          atmoColorSunset = vec3(1, 0.3, 0.1);
          atmoColorNight  = vec3(0.05, 0.05, 0.1);
          
          reflecting = max(0.0, dot(reflect(dViewDirW, dNormalW), sunPos));
          
          atmoColorDark = mix(atmoColorDark, atmoColorSunset + atmoColorSunset * reflecting * 2.0, pow(reflecting, 16.0) * max(0.0, nDotL + 0.7));
          
          // atmoColorDark = vec3(1.0, 0.0, 0.0);

          atmoColor = mix(atmoColorDay, atmoColorDark,  min(1.0, (nDotL / 2.0 + 0.6) * 1.7));
          atmoColor = mix(atmoColor,    atmoColorNight, min(1.0, (nDotL / 2.0 + 0.4) * 1.5));
          atmoColor *= atmoFactor;
          
          return vec4(atmoColor, intensity);

        }


        void main() {

          gl_FragColor = getEmission();

        }

      `,
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          sunPosition: {'type': 'v3', 'value': SIM.sunVector.clone()},
          color:       {'type': 'c',  'value': new THREE.Color(cfg.color)},
          intensity:   {'type': 'f',  'value': cfg.intensity},
        },
      }),
      mesh = new THREE.Mesh( geometry, material ),

    end;


    mesh.update = function (cfg) {

      if (cfg.intensity !== undefined) {
        material.uniforms.intensity.value = cfg.intensity;
        material.uniforms.intensity.needsUpdate = true;
      }
      
      if (cfg.color !== undefined) {
        material.uniforms.color.value = cfg.color;
        material.uniforms.color.needsUpdate = true;
      }

      if (cfg.sunPosition !== undefined){
        material.uniforms.sunPosition.value = cfg.sunPosition;
        material.uniforms.sunPosition.needsUpdate = true;
      }

    }

    // cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    return mesh;

  },
  sector: function (cfg, callback) {

    /*
          + - + - +
          |       |
          +   +   +
          |       |
          + - + - +
    */

    var 
      MAX_RANGE = 1000,
      mesh, range, 
      reso      = cfg.resolution,
      geometry  = new THREE.BufferGeometry(),
      material  = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
      mesh      = new THREE.Line( geometry, material ),
      positions = new Float32Array( MAX_RANGE * 3 ),
      colors    = new Float32Array( MAX_RANGE * 3 ),
      toVec3    = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      },
    end;

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    updateSector(cfg.sector);

    mesh.updateSector = updateSector;

    return mesh;

    function updateSector (sector) {

      var 
        v3, 
        pos  = 0,
        lat0 = sector[0],
        lon0 = sector[1],
        lat1 = sector[2],
        lon1 = sector[3],
        width     = (Math.abs(lon1 - lon0) + 1) * reso,
        height    = (Math.abs(lat1 - lat0) + 1) * reso,
        lons      = TOOLS.flatten([
          H.linspace(lon0, lon1, width),
          H.linspace(lon1, lon1, height - 2),
          H.linspace(lon1, lon0, width),
          H.linspace(lon0, lon0, height - 2),
          [lon0]
        ]),
        lats      = TOOLS.flatten([
          H.linspace(lat0, lat0, width),
          H.linspace(lat0, lat1, height -2),
          H.linspace(lat1, lat1, width),
          H.linspace(lat1, lat0, height -2),
          [lat0]
        ]),
      end;

      H.zip(lats, lons, (lat, lon) => {

        v3 = toVec3(lat, lon);

        positions[pos + 0] = v3.x;
        positions[pos + 1] = v3.y;
        positions[pos + 2] = v3.z;
        
        colors[pos + 0] = 0.9;
        colors[pos + 1] = 0.9;
        colors[pos + 2] = 0.3;
        
        pos += 3;

      });

      geometry.setDrawRange(0, lats.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();

    }

    function onBeforeRender () {

    }

  },
  graticule: function (cfg, callback) {

    /*
          + - + - +
          |   |   |
          + - + - +
          |   |   |
          + - + - +
    */

    var 
      mesh,
      lats     = H.linspace(-180, 180, 37),
      lons     = H.linspace( -90,  90, 19),
      geometry = new THREE.Geometry(),
      material = new THREE.LineBasicMaterial(Object.assign({}, cfg.material, {
        // uniforms: {type: 'f', value: SCN.camera.position.length()}
      })),
      toVec3   = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      },
    end;

    H.each(lats.slice(0, -1), (iLat, lat) => {
      H.each(lons.slice(0, -1), (iLon, lon) => {

        var 
          lat0 = lat,
          lat1 = lats[~~iLat + 1],
          lon0 = lon,
          lon1 = lons[~~iLon + 1],
          v1   = toVec3(lat0, lon0),
          v2   = toVec3(lat0, lon1),
          v3   = toVec3(lat0, lon0),
          v4   = toVec3(lat1, lon0),
        end;

      geometry.vertices.push(v1, v2, v3, v4);

      });
    });

    mesh =  new THREE.LineSegments(geometry, material);
    mesh.onBeforeRender = function () {
      // material.uniforms.distance.value = SCN.camera.position.length();
      // material.uniforms.distance.needsUpdate = true;
    };

    return mesh;

  },

};
