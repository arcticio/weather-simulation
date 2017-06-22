
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