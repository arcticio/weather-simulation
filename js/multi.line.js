

function Multiline (meshlines, material) {

  this.amount = meshlines.length;
  this.length = meshlines[0].positions.length / 2;
  this.extras = (this.length -1) * 2;
  this.totals = this.amount * this.length + this.extras;

  this.attributes = {

    colors:   new THREE.BufferAttribute( new Float32Array( this.total ), 3 ),
    counters: new THREE.BufferAttribute( new Float32Array( this.total ), 1 ),
    index:    new THREE.BufferAttribute( new Uint16Array(  this.total ), 1 ),
    next:     new THREE.BufferAttribute( new Float32Array( this.total ), 3 ),
    position: new THREE.BufferAttribute( new Float32Array( this.total ), 3 ),
    previous: new THREE.BufferAttribute( new Float32Array( this.total ), 3 ),
    side:     new THREE.BufferAttribute( new Float32Array( this.total ), 1 ),
    uv:       new THREE.BufferAttribute( new Float32Array( this.total ), 2 ),
    width:    new THREE.BufferAttribute( new Float32Array( this.total ), 1 ),

  };

  H.each(this.attributes, (name, buffer) => {

    H.each(meshlines, (idx, mesh) => {

      var 
        i, j,
        pointer = 0,
        source  = mesh.attributes[name].array,
        target  = buffer.array,
        length  = source.length,
        size    = mesh.attributes[name].itemSize


      if (idx !== '0'){
        
        // double first
        for (j=0, j<size; j++) {
          target[pointer + j] = source[j];
        }
        pointer += itemsize;

      }


      // all data
      for (i=0; i<length; i++) {
        target[i] = source[i];
      }
      pointer += length;


      if (idx !== String(this.amount)) {

        // double last
        for (j=0, j<size; j++) {
          target[pointer + j] = source[length - itemsize + j];
        }
        pointer += itemsize;

      }


    });

  });

}

Multiline.prototype = {
  constructor: Multiline,
  
  concat: function () {

    H.each(meshlines,  line => {


    });



  },

  material: function () {

    this.prototype = Object.create( THREE.Material.prototype );
    this.prototype.constructor = Multiline.material;

    THREE.Material.call( this );

    var uniforms = {

      alphaMap:         { type: 't',  value: this.alphaMap },
      repeat:           { type: 'v2', value: this.repeat },
      offset:           { type: 'v2', value: this.offset },

      color:            { type: 'c',  value: this.color },
      lineWidth:        { type: 'f',  value: this.lineWidth },
      opacity:          { type: 'f',  value: this.opacity },
      resolution:       { type: 'v2', value: this.resolution },

      head:             { type: 'f',  value: this.head },
      pointer:          { type: 'f',  value: this.pointer },
      section:          { type: 'f',  value: this.section },

    },


  },

  shaderVertex: function () {
    
    return [

      'precision highp float;',

      'attribute float counters;',
      'attribute float side;',
      'attribute float width;',
      'attribute vec2  uv;',
      'attribute vec3  next;',
      'attribute vec3  position;',
      'attribute vec3  previous;',

      'attribute vec3  colors;',

      'uniform mat4  projectionMatrix;',
      'uniform mat4  modelViewMatrix;',
      'uniform vec2  resolution;',
      'uniform float lineWidth;',
      'uniform vec3  color;',
      'uniform float opacity;',
      
      'varying vec2  vUV;',
      'varying vec4  vColor;',
      'varying float vCounters;',

      'vec2 fix( vec4 i, float aspect ) {',

      '    vec2 res = i.xy / i.w;',
      '    res.x *= aspect;',
      '    return res;',

      '}',

      'void main() {',

      '    vUV       = uv;',
      // '    vColor    = vec4( (color + colors) * 0.5, opacity );',
      '    vColor    = vec4( colors, opacity );',
      '    vCounters = counters;',

      '    float aspect = resolution.x / resolution.y;',

      '    mat4 m = projectionMatrix * modelViewMatrix;',

      '    vec4 finalPosition = m * vec4( position, 1.0 );',
      '    vec4 prevPos = m * vec4( previous, 1.0 );',
      '    vec4 nextPos = m * vec4( next, 1.0 );',

      '    vec2 currP = fix( finalPosition, aspect );',
      '    vec2 prevP = fix( prevPos, aspect );',
      '    vec2 nextP = fix( nextPos, aspect );',

      '    float w = 1.8 * lineWidth * width;',

      '    vec2 dir;',
      '    vec2 dir1;',
      '    vec2 dir2;',
      '    vec2 normal;',
      '    vec4 offset;',

      '    if      ( nextP == currP ) dir = normalize( currP - prevP );',
      '    else if ( prevP == currP ) dir = normalize( nextP - currP );',
      '    else {',
      '        dir1 = normalize( currP - prevP );',
      '        dir2 = normalize( nextP - currP );',
      '        dir  = normalize( dir1 + dir2 );',
      '    }',

      '    normal = vec2( -dir.y, dir.x );',
      '    normal.x /= aspect;',
      '    normal *= lineWidth * width;',

      '    offset = vec4( normal * side, 0.0, 1.0 );',
      '    finalPosition.xy += offset.xy;',

      '    gl_Position = finalPosition;',

      '}' 
    
    ].join( '\r\n' );


  }

  shaderFragment: function () {

    return [

      'precision mediump float;',

      'uniform sampler2D alphaMap;',
      'uniform vec2  repeat;',
      'uniform vec2  offset;',

      'uniform float pointer;',
      'uniform float section;',

      'varying vec2  vUV;',
      'varying vec4  vColor;',
      'varying float vCounters;',
      
      'float alpha;',
      'float alphaTest = 0.5;',

      'void main() {',

      '    vec4  color   = vColor;',
      '    float counter = vCounters  ;',

      '    alpha = texture2D( alphaMap, vUV).a;',

      '    if (counter > pointer ) alpha = 0.0;',
      '    if (counter < (pointer - section) ) alpha = 0.0;',

      '    if( alpha < alphaTest ) discard;',
      '    color.a = alpha;',

      '    gl_FragColor    = color;',


      '}' 

    ].join( '\r\n' );


  }


}