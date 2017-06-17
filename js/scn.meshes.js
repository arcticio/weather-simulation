
'use strict'

SCN.Meshes = {

  calculate: function (name, cfg) {
    return SCN.Meshes[name](cfg);
  },
  atmosphere: function (cfg, callback) {

    var
      geometry     = new THREE.SphereGeometry(cfg.radius, 128, 128),
      vertexShader = `

        varying vec3 vNormal;
        varying vec3 cameraVector;
        varying vec3 vPosition;
        // varying vec2 vUv;
        
        void main() {
          vNormal = normal;
          vec4 vPosition4 = modelMatrix * vec4(position, 1.0);
          vPosition = vPosition4.xyz;
          cameraVector = cameraPosition - vPosition;
          // vUv = uv;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,
      fragmentShader = `

        uniform vec3  sunPosition;
        uniform vec3  color;
        uniform float intensity;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 cameraVector;
        // varying vec2 vUv;

        void main() {

          // vec3 sunPosition = vec3(20.0, 0.0, 0.0);

          float PI = 3.14159265358979323846264;
          vec3 light = sunPosition - vPosition;
          vec3 cameraDir = normalize(cameraVector);
          
          light = normalize(light);
          
          float lightAngle = max(0.0, dot(vNormal, light));
          lightAngle = 1.0;
          float viewAngle = max(0.0, dot(vNormal, cameraDir));
          float adjustedLightAngle = min(0.6, lightAngle) / 0.6;
          float adjustedViewAngle = min(0.65, viewAngle) / 0.65;
          float invertedViewAngle = pow(acos(viewAngle), 3.0) * 0.4;
          
          float dProd = 0.0;
          dProd += 0.5 * lightAngle;
          dProd += 0.2 * lightAngle * (invertedViewAngle - 0.1);
          dProd += invertedViewAngle * 0.5 * (max(-0.35, dot(vNormal, light)) + 0.35);
          dProd *= 0.7 + pow(invertedViewAngle / ( PI / 2.0 ), 2.0);
          
          dProd *= 0.5;
          // vec4 atmColor = vec4(dProd * 0.7, dProd * 0.7, dProd * 1.3, dProd);

          vec4 atmColor = vec4(color, intensity * dProd);

          // vec4 texelColor = vec4(0.8, 0.5, 0., 0.5) * min(asin(lightAngle), 1.0);
          // gl_FragColor = texelColor + min(atmColor, 0.8);

          gl_FragColor = atmColor;
          // gl_FragColor = texelColor;

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
      mesh = new THREE.Mesh( geometry, material );

      mesh.onBeforeRender = function () {
        material.uniforms.sunPosition.value = SIM.sunVector.clone();
        material.uniforms.sunPosition.needsUpdate = true;
      }

      mesh.update = function (cfg) {

        if (cfg.intensity !== undefined) {
          material.uniforms.intensity.value = cfg.intensity;
          material.uniforms.intensity.needsUpdate = true;
        }
        
        if (cfg.color !== undefined) {
          material.uniforms.color.value = cfg.color;
          material.uniforms.color.needsUpdate = true;
        }

      }



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
