
SCN.Meshes.basemaps = function (id, name, cfg, callback) {

  var
    maps = {
      'mask': '7',
      'topo': '8',
      'gmlc': '9',
    },
    curId  = id,
    lastId = id,
    materials,
    vertexShader = `

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }

    `,    
    fragmentShader = `

      uniform float opacity;
      uniform float facMask, facTopo, facGmlc;

      uniform sampler2D texMask, texTopo, texGmlc;

      vec3 color;

      varying vec2 vUv;

      void main () {

        color = (
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
    materials = createMaterials(cfg.resolution),
    geometry  = createGeometry(),
    mesh      = new THREE.Mesh( geometry, materials),

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

      curId = maps[map];

    },

    getMapId = function () {
      return curId;
    }

  ;


  mesh.name = 'basemaps';
  cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

  mesh.getMapId = getMapId;
  mesh.blendMap = blendMap;

  callback(name, mesh);

};
