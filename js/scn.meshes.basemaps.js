
//  https://www.3dgep.com/texturing-and-lighting-with-opengl-and-glsl/

SCN.Meshes.basemaps = function (cfg) {

  var
    geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1),
    vertexShader = `

      varying vec4 vPosition;

      void main()
      {
        vPosition    = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 1600.0;
        gl_Position  = projectionMatrix * vPosition;
      }

    `,
    fragmentShader = `

      uniform sampler2D texture;
      uniform vec3 lightPos;
      varying vec4 vPosition;

      float intensity;
      float zSqr;
      float x, y, z;

      void main() {  
        
        // map the point coordinates onto a sphere surface
        x =    2.0 * gl_PointCoord.x - 1.0;
        y = +( 2.0 * gl_PointCoord.y - 1.0 ); // + puts light atop
        
        zSqr = 1.0 - x * x - y * y;
        
        if (zSqr <= 0.0){
          gl_FragColor = vec4(0); // early reject: outside the circle

        } else {
          z = sqrt(zSqr); // (x,y,z) is the surface normal of the sphere at the current fragment
        
          // this can be made a lot cheaper with a directional light source instead of a point light
          intensity = dot(normalize((viewMatrix * vec4(lightPos, 1.0) - vPosition).xyz), vec3(x, y, z));

          if (intensity > 0.0) {
            gl_FragColor = vec4(intensity, intensity, intensity, 1.0) * texture2D(texture, gl_PointCoord); // light

          } else {
            discard;
            // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // shadow

          }

        }
      }
    
    `;

    var uniforms = {
      lightPos: { type: 'v3', value: new THREE.Vector3(4, 0, 0) },
      texture:  { type: 't',  value: CFG.Textures[cfg.texture] }
    };

    var material = new THREE.ShaderMaterial( {

      fragmentShader,
      vertexShader,
      uniforms,

      // blending:     THREE.NormalBlending,
      // depthTest:    false,
      // transparent : true,
      // opacity :     0.5,


    }),

  geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(0,0,0));


  plane = new THREE.Points( geometry, material );

  return plane;

};
