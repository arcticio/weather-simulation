
SCN.Meshes.mask = function (name, cfg, callback) {

  debugger;

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

    })
  ;

  for (idx in geometry.vertices) {
    vertex = geometry.vertices[idx];
    vertex.normalize().multiplyScalar(cfg.radius);
  }

  geometry.computeVertexNormals();

  RES.load({urls, type: 'texture', onFinish: function (err, responses) {

    materials = responses.map(response => {

      return new THREE.MeshLambertMaterial(Object.assign({ 
        map:         response.data,
        alphaTest:   0.99,
      }), cfg.material);

    });

    mesh = new THREE.Mesh( geometry, materials );

    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    callback(name, mesh);

  }});

};
