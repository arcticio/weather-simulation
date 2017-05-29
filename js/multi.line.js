

function Multiline (meshlines, lineLength) {

  // meshlines = nonindexed

  const vertCount = 3; // duplicate fist/last vertices + data

  this.loader     = new THREE.TextureLoader();
  this.bytes      = NaN;
  this.frame      = 0;
  this.lineLength = lineLength;
  this.amount     = meshlines.length;
  this.extras     = (this.amount -1) * 2 * vertCount;
  this.geometry   = new THREE.BufferGeometry();
  this.material   = this.createMaterial();

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

  var itemLength   = meshlines[0].geometry.attributes['colors'].count;
  var lineIndexLength = this.amount * (itemLength) + this.extras;
  this.lineIndex =  new THREE.BufferAttribute( new Float32Array( lineIndexLength ), 1 );
  this.geometry.addAttribute( 'lineIndex', this.lineIndex );

  // var first = meshlines[0].geometry.attributes.counters.array;
  // var last  = meshlines[this.amount-1].geometry.attributes.counters.array;
  // console.log('trails', TRAIL_NUM, 'length', TRAIL_LEN, last.length);
  // console.log('first', first.slice(0, 12));
  // console.log('last',  last.slice(-12));

  H.each(this.attributes, (name, bufferType) => {

    var
      target,
      pointer     = 0,
      itemSize    = meshlines[0].geometry.attributes[name].itemSize,
      copyCount   = itemSize * vertCount,
      totalLength = this.amount * (itemLength * itemSize) + this.extras,
      lineIndexes = this.geometry.attributes['lineIndex'].array;

    this.attributes[name] = new THREE.BufferAttribute( new bufferType( totalLength ), itemSize );
    target = this.attributes[name].array;

    H.each(meshlines, (idx, mesh) => {

      var 
        i,
        source  = mesh.geometry.attributes[name].array,
        length  = source.length;

      // double first vertice data, but not from first line 
      if (idx !== '0'){
         
        for (i=0; i<copyCount; i++) {
          target[pointer + i]      = source[i];
          lineIndexes[pointer + i] = idx;
        }
        pointer += copyCount;

      }

      // copy vertice data, from all lines
      for (i=0; i<length; i++) {
        target[pointer + i]      = source[i];
        lineIndexes[pointer + i] = idx;
      }
      pointer += length;


      // double last vertice data, but not from last line
      if (idx !== String(this.amount -1)) {

        for (i=0; i<copyCount; i++) {
          target[pointer + i]      = source[length - copyCount + i];
          lineIndexes[pointer + i] = idx;

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

  this.bytes = Object
    .keys(this.attributes)
    .map(attr => this.attributes[attr].array.length)
    .reduce(function(a, b){ return a + b; }, 0) * 4
  ;

  console.log('Multiline.length', this.bytes, 'bytes');

}

Multiline.prototype = {
  constructor: Multiline,

  step: function () {

    // TODO: calc offset upfront

    var i, pointer, head;

    this.frame += 1;

    for (i=0; i<this.amount; i++) {

      head        = this.material.uniforms.heads.value[i],
      pointers    = this.material.uniforms.pointers.value;
      pointers[i] = ((head + this.frame) % this.lineLength) / this.lineLength;

      this.material.uniforms.pointers.needsUpdate = true;

    }

  },

  createMaterial: function () {

    var     
      alphaMap   = this.loader.load('images/line.alpha.64.png'),
      opacity    = 0.8,
      alphaTest  = 0.5,
      color      = new THREE.Color('#ff0000'),

      lineWidth  = CFG.earth.radius / 45,
      resolution = new THREE.Vector2( window.innerWidth, window.innerHeight ),

      heads      = new Array(this.amount).fill(0).map( n => Math.random() * this.lineLength ),
      pointers   = heads.map( n => n),
      section    = 10 / this.lineLength,    // length of trail in %

      material   = new THREE.RawShaderMaterial( {
      uniforms: {

        alphaMap:         { type: 't',  value: alphaMap },
        alphaTest:        { type: 'f',  value: alphaTest },
        color:            { type: 'c',  value: color },
        opacity:          { type: 'f',  value: opacity },

        lineWidth:        { type: 'f',  value: lineWidth },
        resolution:       { type: 'v2', value: resolution },

        heads:            { type: '1fv', value: heads },
        pointers:         { type: '1fv', value: pointers },
        section:          { type: 'f',   value: section },

      },
      vertexShader:   this.shaderVertex(),
      fragmentShader: this.shaderFragment(),
    });

    Object.assign(material, {

      depthTest:       true,                    // false ignores planet
      blending:        THREE.NormalBlending,    // NormalBlending, AdditiveBlending
      side:            THREE.FrontSide,         // FrontSide, DoubleSide
      transparent:     true,                    // needed for alphamap
      lights:          false,                   // no deco effex

      wireframe:       false,

    });

    return material;


  },

  shaderVertex: function (lineLength) {
    
    return [

      'precision highp float;',

      'attribute float side;',
      'attribute float width;',
      'attribute vec2  uv;',
      'attribute vec3  next;',
      'attribute vec3  position;',
      'attribute vec3  previous;',

      'attribute vec3  colors;',
      'attribute float lineIndex;',
      'attribute float counters;',

      'uniform mat4  projectionMatrix;',
      'uniform mat4  modelViewMatrix;',
      'uniform vec2  resolution;',
      'uniform float lineWidth;',

      'uniform vec3  color;',
      'uniform float opacity;',

      'uniform float heads[    ' + this.amount + ' ];',  // start for each line
      'uniform float pointers[ ' + this.amount + ' ];',  // start for each line
      
      'varying vec2  vUV;',
      'varying vec4  vColor;',

      'varying float vPointer;',
      'varying float vCounters;',

      'vec2 fix( vec4 i, float aspect ) {',

      '    vec2 res = i.xy / i.w;',
      '    res.x *= aspect;',
      '    return res;',

      '}',

      'void main() {',

      '    vUV       = uv;',

      '    vPointer    = pointers[int(lineIndex)];',

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

      'varying vec2  vUV;',
      'varying vec4  vColor;',
      'varying float vCounters;',

      'varying float vPointer;',
      'uniform float section;',
      
      'float alpha;',
      'float alphaTest = 0.5;',

      'void main() {',

      '    vec4  color   = vColor;',
      '    float counter = vCounters  ;',

      '    alpha = texture2D( alphaMap, vUV).a;',

      '    if (counter > vPointer ) alpha = 0.0;',
      '    if (counter < (vPointer - section) ) alpha = 0.0;',

      '    if( alpha < alphaTest ) discard;',
      '    color.a = alpha;',

      '    gl_FragColor    = color;',

      '}' 

    ].join( '\r\n' );

  }

}
