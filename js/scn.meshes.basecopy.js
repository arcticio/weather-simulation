
'use strict'

SCN.Meshes.basecopy = function (name, cfg, callback) {

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

    }),

    vertexShader = `

      varying   vec2 vUv;  
      varying   vec3 vNormal;  
      varying   vec3 vPosition;  

      void main() {
        vUv         = uv;
        vNormal     = normal;
        vPosition   = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader = `

      // Note that for mobiles you'll probably want to replace this by mediump since highp might be slower.

      // precision highp int;
      // precision highp float;

      varying   vec2 vUv;  
      varying   vec3 vNormal;  
      varying   vec3 vPosition;  

      uniform float opacity;

      void main() {
        gl_FragColor = vec4(vColor, opacity);
      }
    `,

  end;

  for (idx in geometry.vertices) {
    vertex = geometry.vertices[idx];
    vertex.normalize().multiplyScalar(cfg.cube.radius);
  }

  geometry.computeVertexNormals();

  RES.load({urls, type: 'texture', onFinish: function (err, responses) {

    materials = responses.map(response => {

      return new THREE.MeshPhongMaterial(Object.assign({ 
        map:         response.data,
        alphaTest:   0.99,
      }), cfg.material);

    });

    mesh = new THREE.Mesh( geometry, new THREE.MultiMaterial( materials ) );

    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    callback(name, mesh);

  }});

};
