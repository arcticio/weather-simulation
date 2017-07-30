
SCN.Tools = {

  determineObject: function (obj) {

    return {
      children:    obj.children.length ? obj.children.length : null,
      order:       obj.renderOrder,
      type:        SCN.Tools.determineType(obj),
      material:    SCN.Tools.determineMaterial(obj.material),
      blending:    SCN.Tools.determineBlending(obj.material),
      depth:       SCN.Tools.determineDepth(obj),
      transparent: obj.material ? obj.material.transparent : '-',
    };

  },
  determineDepth: function (obj) {

    var 
      depth = obj.renderDepth ? 'render' : '';

      depth += !obj.material ? '' : 
        (obj.material.depthTest  ? '-test'  : '') + 
        (obj.material.depthWrite ? '-write' : '')
      ;

    return depth;

  },
  determineType: function (obj) {

    return (
      obj instanceof THREE.Scene                ? 'Scene':                         
      obj instanceof THREE.Camera               ? 'Camera':                        
      obj instanceof THREE.AmbientLight         ? 'AmbientLight':                  
      obj instanceof THREE.HemisphereLight      ? 'HemisphereLight':               
      obj instanceof THREE.SpotLight            ? 'SpotLight':                     
      obj.geometry instanceof THREE.SphereBufferGeometry ? 'SphereBufferGeometry': 
      obj.geometry instanceof THREE.BufferGeometry       ? 'BufferGeometry':       
      obj.geometry instanceof THREE.SphereGeometry       ? 'SphereGeometry':       
      obj.geometry instanceof THREE.BoxGeometry          ? 'BoxGeometry':          
      obj instanceof THREE.Object3D             ? 'Container':                     
        'unknown'
    );

  },

  determineMaterial: function (mat) {

    return (
      mat === undefined                        ? null :
      mat instanceof THREE.ShaderMaterial      ? 'ShaderMaterial' :
      mat instanceof THREE.RawShaderMaterial   ? 'RawShaderMaterial' :
      mat instanceof THREE.LineBasicMaterial   ? 'LineBasicMaterial' :
      mat instanceof THREE.MeshLambertMaterial ? 'MeshLambertMaterial' :
      mat instanceof THREE.MeshBasicMaterial   ? 'MeshBasicMaterial' :
      mat instanceof THREE.MeshPhongMaterial   ? 'MeshPhongMaterial' :
      mat instanceof THREE.Material            ? 'Material' :
        null
    );

  },

  determineBlending: function (mat) {

    return (
      mat === undefined                       ? null :
      mat.blending === undefined              ? null :
      mat.blending === THREE.AdditiveBlending ? 'Additive':
      mat.blending === THREE.MultiplyBlending ? 'Multiply':
      mat.blending === THREE.NormalBlending   ? 'Normal':
        'wtf'
    );

  },

  loadCube: function (name, cfg, callback) {

    var
      idx, vertex, materials, mesh,
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
      vertex.normalize().multiplyScalar(cfg.radius);
    }

    geometry.computeVertexNormals();

    RES.load({urls, type: 'texture', onFinish: function (err, responses) {

      if (err) {console.log(err);}

      materials = responses.map(response => {

        return new THREE.MeshPhongMaterial(Object.assign({ 
          map:         response.data,
          shininess:   0,
          alphaTest:   0.5,
        }), cfg.material);

      });

      mesh = new THREE.Mesh( geometry, materials );

      cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

      callback(name, mesh);

    }});

  },


  // loaders interface to app load AND icon click to load assets

  loader: {

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

    'basemaps': (ids, name, cfg, callback) => {
      SCN.Meshes[name](ids, name, cfg, function (name, mesh) {
        SCN.add(name, mesh);
        callback();
      });
    },

    'cube.textured': (name, cfg, callback) => {
      SCN.Tools.loadCube(name, cfg, (name, obj) => {
        SCN.add(name, obj);
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

    'simulation.parallel': (name, cfg, callback) => {
      SIM.loadVariableParallel(name, cfg, (name, obj) => {
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


  },
};
