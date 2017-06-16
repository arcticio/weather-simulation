SCN.Meshes.background = function (cfg) {

  var
    geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1),
    vertexShader = `

      attribute vec3 colors;
      varying   vec2 vUv;  
      varying   vec3 vColor;  

      void main() {
        vUv         = uv;
        vColor      = colors;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader = `

      varying vec3 vColor;  

      uniform float opacity;

      void main() {
        gl_FragColor = vec4(vColor, opacity);
      }
    `,
    material = new THREE.ShaderMaterial( {
      fragmentShader,
      vertexShader,
      side: THREE.FrontSide,
      transparent: true,
      vertexColors: THREE.VertexColors,
      uniforms: {
        opacity: {type: 'f', value: 0.8}
      }
    }),
    plane = new THREE.Mesh( geometry, material )
  ;

  function updateColors(colors) {

    // 0, 1
    // 2, 3

    var pointer = 0, target = geometry.attributes.colors.array;

    colors.forEach( (col) => {

      target[pointer++] = col.r;
      target[pointer++] = col.g;
      target[pointer++] = col.b;

    });

    geometry.attributes.colors.needsUpdate = true;

  }

  function updatePosition () {

    var 
      camera = SCN.camera,
      aspect = window.innerWidth / window.innerHeight,
      vFov   = camera.fov * Math.PI / 180,
      height = 2 * Math.tan(vFov / 2) * camera.position.length() + 2,
      width  = height * aspect,
      factor = 1 / SCN.scene.scale.x * 1.0, // 0.9
    end;

    plane.position.copy(camera.position.clone().negate().normalize().multiplyScalar(2));
    plane.lookAt(camera.position);
    plane.scale.set(width * factor, height * factor, 1);

  }

  geometry.addAttribute( 'colors', new THREE.BufferAttribute( new Float32Array( 12 ), 3 ));

  updateColors(cfg.colors);

  plane.updateColors   = updateColors;
  plane.updatePosition = updatePosition;

  return plane;


};
