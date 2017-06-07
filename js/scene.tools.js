
'use strict'

SCN.tools = {

  calculate: function (name, cfg) {
    return SCN.tools[name](cfg);
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
      lats = H.linspace(-180, 180, 37),
      lons = H.linspace( -90,  90, 19),
      geometry = new THREE.Geometry(),
      material = new THREE.LineBasicMaterial(cfg.material),
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

    return new THREE.LineSegments(geometry, material);


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
