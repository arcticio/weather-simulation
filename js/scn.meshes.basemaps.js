
SCN.Meshes.basemaps = function (id, name, cfg, callback) {

  var
    curId = id,
    vertexShader = `

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }

    `,    
    fragmentShader = `

      uniform float opacity, facMask, facTopo, facGmlc;

      uniform sampler2D texMask, texTopo, texGmlc;

      varying vec2 vUv;

      void main () {

        vec3 color = (
          texture2D( texMask, vUv ).rgb * facMask + 
          texture2D( texGmlc, vUv ).rgb * facGmlc + 
          texture2D( texTopo, vUv ).rgb * facTopo
        );

        gl_FragColor = vec4(color, opacity);

      }

    `,
    
    createMaterials = function (resolution) {

      return CFG.Faces.map( face => {

        var
          keyMask  = `globe.mask.${face}.${resolution}.png`,
          keyTopo  = `globe.topo.${face}.${resolution}.png`,
          keyGmlc  = `globe.gmlc.${face}.${resolution}.png`,
          uniforms = {
            opacity: {type: 'f', value: 1.0},
            facMask: {type: 'f', value: 0.0},
            facTopo: {type: 'f', value: 0.0},
            facGmlc: {type: 'f', value: 1.0},
            texMask: {type: 't', value: CFG.Textures[keyMask]},
            texTopo: {type: 't', value: CFG.Textures[keyTopo]},
            texGmlc: {type: 't', value: CFG.Textures[keyGmlc]},
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

      var idx, vertex, geometry = cfg.geometry;

      for (idx in geometry.vertices) {
        vertex = geometry.vertices[idx];
        vertex.normalize().multiplyScalar(cfg.radius);
      }

      return geometry;

    },
    blendMap = function (map) {

      var 
        uniform  = 'fac' + H.titleCase(map),
        names    = ['facTopo', 'facMask', 'facGmlc']
      ;
        
      materials.forEach(mat => {
        names.forEach(name => {
          mat.uniforms[name].value = name === uniform ? 1.0 : 0.0;  
          mat.uniforms[name].needsUpdate = true;
        });
      });  

      curId = cfg.ids[cfg.maps.indexOf(map)];

    },
    id2map = function (id) {
      return cfg.maps[cfg.ids.indexOf(id)];
    },

    getMapId = function () {
      return ~~curId;
    },

    materials = createMaterials(cfg.resolution),
    geometry  = createGeometry(),
    mesh      = new THREE.Mesh( geometry, materials)

  ;


  mesh.name = 'basemaps';
  cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

  mesh.getMapId = getMapId;
  mesh.blendMap = blendMap;

  // activate requested map
  blendMap(id2map(id));

  callback(name, mesh);

};
