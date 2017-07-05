
SCN.Tools = {

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

      if (err) {console.log(err);}

      materials = responses.map(response => {

        return new THREE.MeshPhongMaterial(Object.assign({ 
          map:         response.data,
          shininess:   0,
          alphaTest: 0.5,
        }), cfg.material);

      });

      // mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
      mesh = new THREE.Mesh( geometry, materials );

      cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

      callback(name, mesh);

    }});

  },

  loader: {

    // 'camera': (name, cfg, callback) => {
    //   SCN.camera = self.camera = cfg.cam;
    //   camera.position.copy(CFG.Objects.perspective.pos);
    //   self.add(name, cfg.cam);
    //   callback();
    // },

    'mesh': (name, cfg, callback) => {
      SCN.add(name, cfg.mesh);
      callback();
    },

    'light': (name, cfg, callback) => {
      cfg.light = cfg.light(cfg);
      cfg.pos && cfg.light.position.copy( cfg.pos ); 
      SCN.add(name, cfg.light);
      callback();
    },

    'mesh.calculated': (name, cfg, callback) => {
      SCN.add(name, SCN.Meshes.calculate(name, cfg));
      callback();
    },

    'mesh.module': (name, cfg, callback) => {
      SCN.Meshes[name](name, cfg, function (name, mesh) {
        SCN.add(name, mesh);
        callback();
      });
    },

    'simulation': (name, cfg, callback) => {
      SIM.loadVariable(name, cfg, (name, obj) => {
        cfg.rotation && obj.rotation.fromArray(cfg.rotation);
        SCN.add(name, obj);
        callback();
      });
    },

    'geo.json': (name, cfg, callback) => {

      RES.load({type: 'text', urls: [cfg.json], onFinish: (err, responses) => {

        var obj  = new THREE.Object3D();
        var json = JSON.parse(responses[0].data);

        drawThreeGeo(json, cfg.radius, 'sphere', {
          color: cfg.color, 
          lights: true, // grrrr
        }, obj); 

        cfg.rotation && obj.rotation.fromArray(cfg.rotation);

        SCN.add(name, obj);
        callback();

      }});

    },

    'cube.textured': (name, cfg, callback) => {
      SCN.Tools.loadCube(name, cfg, (name, obj) => {
        SCN.add(name, obj);
        callback();
      });
    },

  },
};
