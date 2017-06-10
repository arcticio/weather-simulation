
'use strict'

SCN.tools = {

  calculate: function (name, cfg) {
    return SCN.tools[name](cfg);
  },
  population: function (cfg) {

    var 
      i, city, vec3, light, color, 
      amount    = CITIES.length,
      geometry  = new THREE.BufferGeometry(),
      positions = new Float32Array( amount * 3 ),
      colors    = new Float32Array( amount * 3 ),
      material  = new THREE.PointsMaterial( { size: 0.004, vertexColors: THREE.VertexColors } ),
      points    = new THREE.Points( geometry, material ),
      toVec3    = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      },
      clampScale = function (x, xMin, xMax, min, max) {
          var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
          return val < min ? min : val > max ? max : val;
      }
    ;

    for (i=0; i<amount; i++) {

      city = CITIES[i];

      vec3 = toVec3(city.lat, city.lon);

      positions[i*3 + 0] = vec3.x;
      positions[i*3 + 1] = vec3.y;
      positions[i*3 + 2] = vec3.z;

      light = ~~clampScale(city.pop, 0, 40000000, 30, 90);
      color = new THREE.Color('hsl(10, 70%, ' + light + '%)');
      // color = new THREE.Color(0xffffff);

      colors[ i*3 + 0 ] = color.r;
      colors[ i*3 + 1 ] = color.g;
      colors[ i*3 + 2 ] = color.b;

    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    return points;

  },
  sector: function (cfg) {

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
  graticule: function (cfg) {

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
