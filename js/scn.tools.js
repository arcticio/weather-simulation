
'use strict'

SCN.tools = {

  calculate: function (name, cfg) {
    return SCN.tools[name](cfg);
  },
  // population: function (cfg) {

  //   // check shaders here:
  //   // http://www.neveroccurs.com/lab/three.js/gpu_particles/?particles=256
  //   // http://alteredqualia.com/three/examples/webgl_cubes.html
  //   // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

  //   // TODO: make cities facing away from origin, implement lights

  //   var 
  //     i, city, vec3, light, color, 
  //     amount    = CITIES.length,
  //     positions = new Float32Array( amount * 3 ),
  //     sizes     = new Float32Array( amount * 1 ),
  //     geometry  = new THREE.BufferGeometry(),
  //     texture   = new THREE.TextureLoader().load('images/red.dot.png', function () {
  //       material.uniforms.map.needsUpdate = true;
  //     }),
  //     toVec3    = function (lat, lon) {
  //       return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
  //     },
  //     clampScale = function (x, xMin, xMax, min, max) {
  //         var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
  //         return val < min ? min : val > max ? max : val;
  //     },
  //     vertexShader = `
  //       attribute float sizes;
  //       varying vec2 vUv;  
  //       uniform float radius;

  //       void main() {
  //         vUv = uv;
  //         vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  //         gl_PointSize    = radius * sizes;
  //         gl_Position     = projectionMatrix * mvPosition;
  //       }
  //     `,
  //     fragmentShader = `
  //       uniform sampler2D map;
  //       uniform vec3 ucolor;
  //       uniform float opacity;

  //       float factor = 0.8;

  //       void main() {
  //         vec3 color1 = texture2D( map, gl_PointCoord ).rgb;
  //         vec3 color2 = mix(ucolor, color1, factor);
  //         gl_FragColor    = vec4( color2, opacity );
  //       }
  //     `,
  //     material  = new THREE.ShaderMaterial({ 
  //       vertexShader,
  //       fragmentShader,
  //       vertexColors: THREE.VertexColors,
  //       blending:     THREE.AdditiveBlending,
  //       uniforms: {
  //         'map':      { type: 't', value: texture },
  //         'opacity':  { type: 'f', value: cfg.opacity },
  //         'radius':   { type: 'f', value: cfg.radius },
  //         'ucolor':   { type: 'c', value: cfg.ucolor },
  //       }
  //     }),
  //     points    = new THREE.Points( geometry, material ),

  //   end;

  //   for (i=0; i<amount; i++) {

  //     city = CITIES[i];

  //     vec3 = toVec3(city.lat, city.lon);

  //     positions[i*3 + 0] = vec3.x;
  //     positions[i*3 + 1] = vec3.y;
  //     positions[i*3 + 2] = vec3.z;

  //     sizes[i] = ~~clampScale(city.pop, 1e6, 160e6, 2.0, 160.0); // Tokyo = 22Mill

  //   }

  //   geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  //   geometry.addAttribute( 'sizes', new THREE.BufferAttribute( sizes, 1 ) );

  //   geometry.computeBoundingSphere();

  //   return points;

  // },
  // sector: function (cfg) {

  //   /*
  //         + - + - +
  //         |       |
  //         +   +   +
  //         |       |
  //         + - + - +
  //   */

  //   var 
  //     MAX_RANGE = 1000,
  //     mesh, range, 
  //     reso      = cfg.resolution,
  //     geometry  = new THREE.BufferGeometry(),
  //     material  = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
  //     mesh      = new THREE.Line( geometry, material ),
  //     positions = new Float32Array( MAX_RANGE * 3 ),
  //     colors    = new Float32Array( MAX_RANGE * 3 ),
  //     toVec3    = function (lat, lon) {
  //       return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
  //     },
  //   end;

  //   geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  //   geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  //   updateSector(cfg.sector);

  //   mesh.updateSector = updateSector;

  //   return mesh;

  //   function updateSector (sector) {

  //     var 
  //       v3, 
  //       pos  = 0,
  //       lat0 = sector[0],
  //       lon0 = sector[1],
  //       lat1 = sector[2],
  //       lon1 = sector[3],
  //       width     = (Math.abs(lon1 - lon0) + 1) * reso,
  //       height    = (Math.abs(lat1 - lat0) + 1) * reso,
  //       lons      = TOOLS.flatten([
  //         H.linspace(lon0, lon1, width),
  //         H.linspace(lon1, lon1, height - 2),
  //         H.linspace(lon1, lon0, width),
  //         H.linspace(lon0, lon0, height - 2),
  //         [lon0]
  //       ]),
  //       lats      = TOOLS.flatten([
  //         H.linspace(lat0, lat0, width),
  //         H.linspace(lat0, lat1, height -2),
  //         H.linspace(lat1, lat1, width),
  //         H.linspace(lat1, lat0, height -2),
  //         [lat0]
  //       ]),
  //     end;

  //     H.zip(lats, lons, (lat, lon) => {

  //       v3 = toVec3(lat, lon);

  //       positions[pos + 0] = v3.x;
  //       positions[pos + 1] = v3.y;
  //       positions[pos + 2] = v3.z;
        
  //       colors[pos + 0] = 0.9;
  //       colors[pos + 1] = 0.9;
  //       colors[pos + 2] = 0.3;
        
  //       pos += 3;

  //     });

  //     geometry.setDrawRange(0, lats.length);
  //     geometry.attributes.position.needsUpdate = true;
  //     geometry.attributes.color.needsUpdate = true;
  //     geometry.computeBoundingSphere();

  //   }

  //   function onBeforeRender () {

  //   }

  // },
  // graticule: function (cfg) {

  //   /*
  //         + - + - +
  //         |   |   |
  //         + - + - +
  //         |   |   |
  //         + - + - +
  //   */

  //   var 
  //     mesh,
  //     lats     = H.linspace(-180, 180, 37),
  //     lons     = H.linspace( -90,  90, 19),
  //     geometry = new THREE.Geometry(),
  //     material = new THREE.LineBasicMaterial(Object.assign({}, cfg.material, {
  //       // uniforms: {type: 'f', value: SCN.camera.position.length()}
  //     })),
  //     toVec3   = function (lat, lon) {
  //       return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
  //     },
  //   end;

  //   H.each(lats.slice(0, -1), (iLat, lat) => {
  //     H.each(lons.slice(0, -1), (iLon, lon) => {

  //       var 
  //         lat0 = lat,
  //         lat1 = lats[~~iLat + 1],
  //         lon0 = lon,
  //         lon1 = lons[~~iLon + 1],
  //         v1   = toVec3(lat0, lon0),
  //         v2   = toVec3(lat0, lon1),
  //         v3   = toVec3(lat0, lon0),
  //         v4   = toVec3(lat1, lon0),
  //       end;

  //     geometry.vertices.push(v1, v2, v3, v4);

  //     });
  //   });

  //   mesh =  new THREE.LineSegments(geometry, material);
  //   mesh.onBeforeRender = function () {
  //     // material.uniforms.distance.value = SCN.camera.position.length();
  //     // material.uniforms.distance.needsUpdate = true;
  //   };

  //   return mesh;

  // },
  loadCube: function (name, cfg, callback) {

    var
      idx, vertex,  materials, mesh,
      geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
      urls = CFG.Faces.map( face => {

        if (cfg.cube.type === 'globe'){
          return H.replace(cfg.cube.texture, 'FACE', face);

        } else if (cfg.cube.type === 'polar') {
           return (face === 'top' || face === 'bottom') ? 
            H.replace(cfg.cube.texture, 'FACE', face) : 'images/transparent.face.512.png';
        }

      });

    for (idx in geometry.vertices) {
      vertex = geometry.vertices[idx];
      vertex.normalize().multiplyScalar(cfg.cube.radius);
    }

    geometry.computeVertexNormals();

    RES.load({urls, type: 'texture', onFinish: function (err, responses) {

      materials = responses.map(response => {

        return new THREE.MeshPhongMaterial(Object.assign({ 
          map:         response.data,
          shininess:   0,
          alphaTest: 0.5,
        }), cfg.material);

      });

      mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

      cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

      callback(name, mesh);

    }});

  },

};
