
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

        gl_FragColor = texture2D( map, vUv ).rgba;
        // gl_FragColor = vec4(0.8);

      }

    `,
    
    createMaterials = function (map, resolution) {

      return CFG.Faces.map( face => {

        var
          texkey   = `globe.${map}.${face}.${resolution}.png`,
          texture  = CFG.Textures[texkey],
          uniforms = {
            map: {type: 't', value: texture},
          }
        ;

        return new THREE.ShaderMaterial(
          Object.assign(cfg.material, {
            uniforms,
            vertexShader,
            fragmentShader,
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
    convid = function (param) {
      return typeof param === 'number' ? 
        cfg.maps[cfg.ids.indexOf(param)] :
        cfg.ids[cfg.maps.indexOf(param)]
      ;
    }

  ;

  // https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475

  cfg.maps.forEach(map => {

    var mesh = new THREE.Mesh( createGeometry(), createMaterials(map, cfg.resolution) );

    mesh.name        = map;
    mesh.visible     = mesh.name === convid(id);
    // mesh.renderOrder = 8; //~~(cfg.radius - CFG.earth.radius) * 1000;

    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    container.add(mesh);

  });

  Object.assign(container, {
    switchMap,
    getMapId,
    convid
  });

  container.renderOrder = 8;

  callback(name, container);

};
