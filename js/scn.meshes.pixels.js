
//  https://www.3dgep.com/texturing-and-lighting-with-opengl-and-glsl/
// http://adrianboeing.blogspot.de/2011/02/sphere-effect-in-webgl.html

'use strict'

SCN.Meshes.pixels = function (name, cfg, callback) {

  var
    geometry     = new THREE.PlaneGeometry( 2, 2, 1, 1 ),
    vertexShader = `

      uniform vec2 resolution;

      float aspect;
      vec3 pos;

      void main(void) {

        // aspect = resolution.x / resolution.y;

        // pos.x = position.x; 
        // pos.y = position.y * aspect * 2.0;

        // gl_Position = vec4(pos * 0.7, 1.0); 

        gl_Position = vec4(position * 0.98, 1.0); 

      }
    `,
    fragmentShader = `

      uniform float time, distance;
      uniform vec2 resolution;
      uniform sampler2D texture;
      uniform vec3 campos;

      uniform mat4 projectionMatrix;
      // uniform mat4 viewMatrix;
      
      vec2 p, uv, coords;

      float factor, radius, aspect;

      void main(void) {

        aspect = resolution.x / resolution.y;

        // SHADERTOY: vec2 p = (2.0 * fragCoord.xy - iResolution.xy ) / iResolution.y;
        // ORG:       vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;

        p   = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;   // */ => offset diagonal
        p.y = p.y / aspect;

        radius = sqrt(dot( p, p )) * aspect * distance / 2.6;      // sqrt: works with distance

        // radius close //


        factor = (1.0 - sqrt(1.0 - radius)) / ( radius ) * distance * aspect / 11.0;

        uv.x = 0.5 + p.x * factor;
        uv.y = 0.5 + p.y * factor * 2.0;

        // uv = ( viewMatrix * vec4(uv, 1.0, 1.0) ).xy;

        if (radius < 1.0) {
          gl_FragColor = vec4(texture2D(texture, uv).xyz, 0.5);

        } else {
          gl_FragColor = vec4(1.0, 0.5, 0.0, 0.2);

        }
      
      }
    `,

    uniforms = {
      // lightPos: { type: 'v3', value: new THREE.Vector3(4, 0, 0) },

      time:       { type: 'f',  value: 0.5 },
      texture:    { type: 't',  value: CFG.Textures[cfg.texture] },
      distance:   { type: 'f',  value: SCN.camera.position.length() },
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      campos:     { type: 'v3', value: SCN.camera.position}

    },

    material = new THREE.ShaderMaterial( {

      fragmentShader,
      vertexShader,
      uniforms,

      side:        THREE.DoubleSide,
      transparent : true,
      opacity :     0.5,

      // blending:     THREE.NormalBlending,
      // depthTest:    false,

    }),
    mesh = new THREE.Mesh( geometry, material ),

  end;

  mesh.onBeforeRender = function () {

    material.uniforms.time.value += .005;
    material.uniforms.campos.value = SCN.camera.position;
    material.uniforms.distance.value = SCN.camera.position.length();
    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

    material.uniforms.time.needsUpdate = true;
    material.uniforms.campos.needsUpdate = true;
    material.uniforms.distance.needsUpdate = true;
    material.uniforms.resolution.needsUpdate = true;

  };

  callback(name, mesh);

};


/*




//Script by Adrian Boeing
//www.adrianboeing.com
#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D tex;

void main(void) {

  vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
  vec2 uv;

  float r = sqrt(dot(p,p));
  float f =(3.0-sqrt(4.0-5.0*r*r))/(r*r+1.0);

  uv.x = p.x*f;
  uv.y = p.y*f;
  uv.x += 1.5*sin(time);
  uv.y += cos(time*0.5);

  float w = 1.7*(p.x+p.y+r*r-(p.x+p.y-1.0)*sqrt(4.0-5.0*r*r)/3.0)/(r*r+1.0);

  vec3 col =  texture2D(tex,uv).xyz;

  gl_FragColor = vec4(col*w,1.0);

}










*/