
//  https://www.3dgep.com/texturing-and-lighting-with-opengl-and-glsl/

'use strict'


SCN.Meshes.pixels = function (cfg) {

  var
    // geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1),
    vertexShader = `

      uniform float distance;
      uniform vec2  resolution;

      float aspect, fov;
      vec4  pos;
      
      void main(void) {

        fov = 5.1;

        aspect = resolution.x / resolution.y;
        pos    = vec4(position / distance * fov, 1.0); 
        pos.x /= aspect;

        gl_Position = pos;

      }
    `,
    fragmentShader = `

      uniform float time, distance;
      uniform vec2 resolution;
      uniform sampler2D texture;

      vec2 p, uv;

      float factor, radius, aspect;

      void main(void) {

        aspect = resolution.x / resolution.y;
        p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;

        radius = dot( p, p );

        radius = radius * (distance);

        factor = (1.0 - sqrt(1.0 - radius)) / ( radius );

        uv.x = p.x * factor * 1.5 + 0.5;
        uv.y = p.y * factor * 1.5 + 0.5;

        if (radius < 1.0) {
          gl_FragColor = vec4(texture2D(texture, uv).xyz, 0.5);

        } else {
          gl_FragColor = vec4(1.0, 0.5, 0.0, 0.5);

        }
      
      }
    `;

    var uniforms = {
      // lightPos: { type: 'v3', value: new THREE.Vector3(4, 0, 0) },

      time:       { type: 'f',  value: 0.5 },
      texture:    { type: 't',  value: CFG.Textures[cfg.texture] },
      distance:   { type: 'f',  value: SCN.camera.position.length() },
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
    };

    var material = new THREE.ShaderMaterial( {

      fragmentShader,
      vertexShader,
      uniforms,
      side:        THREE.DoubleSide,

      // blending:     THREE.NormalBlending,
      // depthTest:    false,
      transparent : true,
      opacity :     0.5,


    });

  var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
  // geometry = new THREE.Geometry();
  // geometry.vertices = [
  //   new THREE.Vector3(  1.0,  1.0,  0.0),
  //   new THREE.Vector3( -1.0,  1.0,  0.0),
  //   new THREE.Vector3(  1.0, -1.0,  0.0),
  //   new THREE.Vector3( -1.0, -1.0,  0.0)
  // ];

  // geometry.computeBoundingBox();
  // geometry.computeBoundingSphere();
  // geometry.computeFaceNormals();
  // geometry.computeFlatVertexNormals();
  // geometry.computeLineDistances();
  // geometry.computeMorphNormals();
  // geometry.computeFlatVertexNormals();

  plane = new THREE.Mesh( geometry, material );

  plane.onBeforeRender = function () {
    material.uniforms.time.value += .005;
    material.uniforms.time.needsUpdate = true;
    material.uniforms.distance.value = SCN.camera.position.length();
    material.uniforms.distance.needsUpdate = true;
    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    material.uniforms.distance.resolution = true;
  };

  return plane;

};


/*




//===================================================================================
//Vertex Shader
//===================================================================================
  attribute vec3 aVertexPosition;

  void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
  }

// Script by Adrian Boeing
// www.adrianboeing.com
// http://adrianboeing.blogspot.de/2011/02/sphere-effect-in-webgl.html

#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D tex;

void main(void) {
  vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
  vec2 uv;
  float r = sqrt(dot(p, p));
  float f =(3.0 - sqrt(4.0 - 5.0 * r * r))/(r * r + 1.0);
  uv.x = p.x * f;
  uv.y = p.y * f;
  uv.x += 1.5 * sin(time);
  uv.y += cos(time*0.5);
  float w = 1.7 * (p.x + p.y + r * r - (p.x + p.y - 1.0) * sqrt(4.0 - 5.0 * r * r) / 3.0) / (r * r + 1.0);
  vec3 col =  texture2D(tex,uv).xyz;
  gl_FragColor = vec4(col * w, 1.0);
}



//===================================================================================
//Javascript code for setting up WebGL
//===================================================================================
  var canvas;
  var startTime; 
  var gl;
  var squareVertexPositionBuffer;
  var shaderProgram;
  var neheTexture;

  function initGL(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
      alert("Could not initialise WebGL!");
    }
    startTime = (new Date()).getTime();
  }


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  function initShaders_sphere() {
    var fragmentShader = getShader(gl, "shader-fs-sphere");
    //var fragmentShader = getShader(gl, "simple-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pResolutionUniform = gl.getUniformLocation(shaderProgram, "resolution");
    shaderProgram.pTimeUniform = gl.getUniformLocation(shaderProgram, "time");
  }


  function setUniforms_sphere() {
  
   gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, neheTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
  
    gl.uniform2f(shaderProgram.pResolutionUniform, canvas.width, canvas.height);
    var time = (new Date()).getTime();
    gl.uniform1f(shaderProgram.pTimeUniform, (time - startTime) / 1000.0);
  }


  function initBuffers() {
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
  }

  function onWindowResize( event ) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport( 0, 0, canvas.width, canvas.height );
  }
  
  
function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

   function initTexture() {
    neheTexture = gl.createTexture();
    neheTexture.image = new Image();
    neheTexture.image.onload = function() {
      handleLoadedTexture(neheTexture)
    }
    neheTexture.image.src = "http://www.iquilezles.org/apps/shadertoy/presets/tex3.jpg";
   }
    

  function drawScene() {
    //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setUniforms_sphere();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  }


  function webGLStart_sphere() {
    canvas = document.getElementById("my-canvas-sphere");
    initGL(canvas);
    initShaders_sphere()
    initBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.disable(gl.DEPTH_TEST);

    setInterval(drawScene, 16);
  }
  




*/