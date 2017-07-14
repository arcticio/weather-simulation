
SCN.Meshes.basemaps = function (id, name, cfg, callback) {

  var
    maps = {
      'mask': '7',
      'topo': '8',
      'gmlc': '9',
    },
    container = new THREE.Object3D(),
    vertexShader = `

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }

    `,    
    fragmentShader = `

      uniform sampler2D map;
      varying vec2 vUv;

      void main () {

        // gl_FragColor = texture2D( map, gl_PointCoord ).rgba;
        gl_FragColor = texture2D( map, vUv ).rgba;
        // gl_FragColor = vec4(0.8);

      }

    `,
    
    createMaterials = function (map, resolution) {

      return CFG.Faces.map( face => {

        var
          texkey  = `globe.${map}.${face}.${resolution}.png`,
          texture = CFG.Textures[texkey]
        ;

        return new THREE.ShaderMaterial(
          Object.assign(cfg.material, {
            uniforms: {
              map: {type: 't', value: texture},
            },
            vertexShader,
            fragmentShader,
            transparent: true,
          })
        );

      });

    },
    createGeometry = function () {

      var idx, vertex, geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);

      for (idx in geometry.vertices) {
        vertex = geometry.vertices[idx];
        vertex.normalize().multiplyScalar(cfg.radius);
      }

      return geometry;

    },

    switchMap = function (map) {
      container.children.forEach( mesh => {
        mesh.visible = mesh.name === map;
      });
    },

    getMapId = function () {
      var id = NaN;
      container.children.forEach( mesh => {
        id = mesh.visible ? convid(mesh.name) : id;
      });
      return id;
    }, 
    convid = function (what) {
      return typeof what === 'number' ? 
        cfg.maps[cfg.ids.indexOf(what)] :
        cfg.ids[cfg.maps.indexOf(what)]
      ;
    }

  ;

  cfg.maps.forEach(map => {

    var mesh = new THREE.Mesh( createGeometry(), createMaterials(map, cfg.resolution) );

    mesh.name = map;
    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);
    mesh.visible = mesh.name === convid(id);
    container.add(mesh);

  });

  Object.assign(container, {
    switchMap,
    getMapId,
    convid
  });

  callback(name, container);

};
