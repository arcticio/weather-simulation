

function Multiline (meshlines) {

  // meshlines = nonindexed

  const vertCount = 3; // duplicate fist/last vertices + data

  this.frame  = 0;

  this.amount = meshlines.length;
  this.extras = (this.amount -1) * 2 * vertCount;

  this.geometry  = new THREE.BufferGeometry();
  this.material  = meshlines[0].material;
  // this.material  = meshlines[0].material.clone();

  this.attributes = {

    colors:    Float32Array,
    counters:  Float32Array,
    next:      Float32Array,
    position:  Float32Array,
    previous:  Float32Array,
    side:      Float32Array,
    uv:        Float32Array,
    width:     Float32Array,

  };

  var first = meshlines[0].geometry.attributes.counters.array;
  var last  = meshlines[this.amount-1].geometry.attributes.counters.array;

  // console.log('trails', TRAIL_NUM, 'length', TRAIL_LEN, last.length);
  // console.log('first', first.slice(0, 12));
  // console.log('last',  last.slice(-12));

  H.each(this.attributes, (name, bufferType) => {

    var
      target, pointer = 0,
      bufferLength   = meshlines[0].geometry.attributes[name].count,
      bufferItemSize = meshlines[0].geometry.attributes[name].itemSize,
      copyCount      = bufferItemSize * vertCount,
      totalLength    = this.amount * (bufferLength * bufferItemSize) + this.extras;

    this.attributes[name] = new THREE.BufferAttribute( new bufferType( totalLength ), bufferItemSize );
    target = this.attributes[name].array;

    H.each(meshlines, (idx, mesh) => {

      var 
        i, j,
        source  = mesh.geometry.attributes[name].array,
        length  = source.length;


      // double first vertice data, but not from first line 
      if (idx !== '0'){
         
        for (j=0; j<copyCount; j++) {
          target[pointer + j] = source[j];
        }
        pointer += copyCount;

      }

      // copy vertice data, from all lines
      for (i=0; i<length; i++) {
        target[pointer + i] = source[i];
      }
      pointer += length;


      // double last vertice data, but not from last line
      if (idx !== String(this.amount -1)) {

        for (j=0; j<copyCount; j++) {
          target[pointer + j] = source[length - copyCount + j];
        }
        pointer += copyCount;

      }


    });

    this.geometry.addAttribute( name, this.attributes[name] );

  });

  // console.log(this.attributes.counters.array.slice(0, 12));
  // console.log(this.attributes.counters.array.slice(-12));

  // debugger;

  this.mesh = new THREE.Mesh( this.geometry, this.material );

}

Multiline.prototype = {
  constructor: Multiline,

  step: function () {

    var i, pointer, head;

    this.frame += 1;

    head = this.material.uniforms.head.value,
    pointer = this.material.uniforms.pointer;
    pointer.value = ((head + this.frame) % this.length) / this.length;
    pointer.needsUpdate = true;

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

    };


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


  },

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