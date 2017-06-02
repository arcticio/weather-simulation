/*

  Borrowed from 
    https://github.com/spite/THREE.MeshLine/
  using MIT LICENCE

*/

function Multiline (trailsVectors, trailsColors, trailsWidths, options) {

  var idx = 0;

  this.frame      = 0;

  this.bytes      = NaN;
  this.amount     = trailsVectors.length;
  this.length     = trailsVectors[0].length;
  this.points     = this.amount * this.length;

  this.geometry   = new THREE.BufferGeometry();
  this.material   = this.createMaterial(options);
  this.attributes = {
    lineIndex: Float32Array,
    colors:    Float32Array,
    next:      Float32Array,
    position:  Float32Array,
    previous:  Float32Array,
    side:      Float32Array,
    uv:        Float32Array,
    width:     Float32Array,
    index:     Uint16Array,
  };

  this.lines = H.zip(trailsVectors, trailsColors, trailsWidths, (vectors, colors, widths) => {
    return new
     Multiline.line(idx++, vectors, colors, widths);
  });

  H.each(this.attributes, (name, bufferType) => {

    var
      target,
      pointer     = 0,
      indexOffset = 0,
      itemSize    = this.lines[0].attributes[name].itemSize,
      totalLength = this.lines[0].attributes[name].array.length * this.amount,
      positLength = this.lines[0].attributes['position'].count;

    this.attributes[name] = new THREE.BufferAttribute( new bufferType( totalLength ), itemSize );
    target = this.attributes[name].array;
    
    H.each(this.lines, (idx, mesh) => {

      var i,
        source = mesh.attributes[name].array,
        length = source.length;

      if (name === 'index'){
        for (i=0; i<length; i++) {
          target[pointer + i] = source[i] + indexOffset;
        }

      } else {
        for (i=0; i<length; i++) {
          target[pointer + i] = source[i];
        }
      }

      pointer     += length;
      indexOffset += positLength;

    });

    if (name !== 'index'){
      this.geometry.addAttribute( name, this.attributes[name] );
    } else {
      this.geometry.setIndex(this.attributes.index);
    }

  });

  this.mesh = new THREE.Mesh( this.geometry, this.material );

  this.bytes = Object
    .keys(this.attributes)
    .map(attr => this.attributes[attr].array.length)
    .reduce( (a, b) =>  a + b, 0) * 4
  ;

  console.log('Multiline.attributes.length', this.bytes, 'bytes');

}

Multiline.prototype = {
  constructor: Multiline,

  step: function () {

    // TODO: dTime math

    var i, pointer, head, offset = 1 / this.length;

    this.frame += 1;

    for (i=0; i<this.amount; i++) {

      head        = this.material.uniforms.heads.value[i],
      pointers    = this.material.uniforms.pointers.value;
      pointers[i] = (pointers[i] + offset) % 1;

      this.material.uniforms.pointers.needsUpdate = true;

    }

  },

  check: function (val, valDefault) {
    return val === undefined ? valDefault : val;
  },

  createMaterial: function (options) {

    // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

    var     
      color      = this.check(options.color, new THREE.Color('#ff0000')),
      opacity    = this.check(options.opacity, 0.8),
      lineWidth  = this.check(options.lineWidth, 0.01),

      heads      = new Array(this.amount).fill(0).map( n => Math.random() * this.length ),
      pointers   = heads.map( n => n),
      section    = this.check(options.section, 10 / this.length);    // length of trail in %

    return  new THREE.RawShaderMaterial({

      depthTest:       true,                    // false ignores planet
      blending:        THREE.NormalBlending,    // NormalBlending, AdditiveBlending
      side:            THREE.DoubleSide,        // FrontSide (start=skewed), DoubleSide (start=vertical)
      transparent:     true,                    // needed for alphamap, opacity + gradient
      lights:          false,                   // no deco effex, true tries to add scene.lights

      shading:         THREE.SmoothShading,     // *THREE.SmoothShading or THREE.FlatShading
      vertexColors:    THREE.NoColors,          // *THREE.NoColors, THREE.FaceColors and THREE.VertexColors.

      wireframe:       false,

      uniforms: {


        color:            { type: 'c',    value: color },
        opacity:          { type: 'f',    value: opacity },
        lineWidth:        { type: 'f',    value: lineWidth },

        heads:            { type: '1fv',  value: heads },
        pointers:         { type: '1fv',  value: pointers },
        section:          { type: 'f',    value: section },

      },

      vertexShader:   this.shaderVertex(),
      fragmentShader: this.shaderFragment(),

    });

  },

  shaderVertex: function () {

    return `

      precision highp float;

      attribute float side;
      attribute vec2  uv;
      attribute vec3  next;
      attribute vec3  position;
      attribute vec3  previous;

      attribute float width;
      attribute vec3  colors;
      attribute float lineIndex;

      uniform mat4  projectionMatrix;
      uniform mat4  modelViewMatrix;

      uniform float lineWidth;
      uniform vec3  color;
      uniform float opacity;

      uniform float pointers[  ${this.amount}  ];  // start for each line
      
      varying vec2  vUV;
      varying vec4  vColor;
      varying float vHead;
      varying float vCounter;

      vec2 dir;
      vec2 dir1;
      vec2 dir2;
      vec2 normal;
      vec4 offset;

      void main() {


          // vUV       = uv;
          vHead     = pointers[int(lineIndex)];   // get head for this segment
          vCounter  = fract(lineIndex);           // get pos of this segment 
          vColor    = vec4( colors, opacity );

          mat4 m = projectionMatrix * modelViewMatrix;

          vec4 finalPosition = m * vec4( position, 1.0 );
          vec4 prevPos       = m * vec4( previous, 1.0 );
          vec4 nextPos       = m * vec4( next, 1.0 );

          vec2 currP = finalPosition.xy / finalPosition.w;
          vec2 prevP = prevPos.xy       / prevPos.w;
          vec2 nextP = nextPos.xy       / nextPos.w;

          if      ( nextP == currP ) { dir = normalize( currP - prevP) ;}
          else if ( prevP == currP ) { dir = normalize( nextP - currP) ;}
          else {
              dir1 = normalize( currP - prevP );
              dir2 = normalize( nextP - currP );
              dir  = normalize( dir1  + dir2 );
          }

          normal  = vec2( -dir.y, dir.x );
          normal *= lineWidth * width;

          offset = vec4( normal * side, 0.0, 1.0 );
          finalPosition.xy += offset.xy;

          gl_Position = finalPosition;

      } 

    `;

  },

  shaderFragment: function () {

    return `

      precision mediump float;

      varying vec4  vColor;    // color from attribute, includes uni opacity
      varying float vHead;     // head of line segment
      varying float vCounter;  // current position, goes from 0 to 1 

      uniform float section;   // visible segment length
      
      bool  visible = true;    // frag part of segment

      void main() {

          vec4  color = vColor;
          float head  = vHead;
          float tail  = max(0.0, vHead - section);
          float pos   = vCounter;

          visible =  ( pos > tail ) && ( pos < head );  // pos within segment
          
          visible = visible && (pos > 0.0) && (pos < 0.999999);

          if( !visible ) discard;

          color.a = (pos - tail) / section;

          gl_FragColor = color;

      } 

    `;

  },

};

Multiline.line = function ( idx, vertices, colors, widths ) {

  this.idx       = idx;

  this.indices   = [];
  this.lineIndex = [];
  this.next      = [];
  this.positions = [];
  this.previous  = [];
  this.side      = [];
  this.uvs       = [];
  this.widths    = [];
  this.colors    = [];

  this.length = vertices.length;

  this.init(vertices, colors, widths);
  this.process();

  this.attributes = {
    index:     new THREE.BufferAttribute( new Uint16Array(  this.indices ),   1 ),
    lineIndex: new THREE.BufferAttribute( new Float32Array( this.lineIndex ), 1 ),
    next:      new THREE.BufferAttribute( new Float32Array( this.next ),      3 ),
    position:  new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ),
    previous:  new THREE.BufferAttribute( new Float32Array( this.previous ),  3 ),
    side:      new THREE.BufferAttribute( new Float32Array( this.side ),      1 ),
    uv:        new THREE.BufferAttribute( new Float32Array( this.uvs ),       2 ),
    width:     new THREE.BufferAttribute( new Float32Array( this.widths ),    1 ),
    colors:    new THREE.BufferAttribute( new Float32Array( this.colors ),    3 ),
  }

};

Multiline.line.prototype = {
  constructor:  Multiline.line,
  compareV3:    function( a, b ) {

    var aa = a * 6, ab = b * 6;

    return (
      ( this.positions[ aa     ] === this.positions[ ab     ] ) && 
      ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && 
      ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] )
    );

  },

  copyV3:       function( a ) {

    var aa = a * 6;
    return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ];

  },

  init:  function( vertices, colors, widths ) {

    var j, ver, cou, col;

    for( j = 0; j < this.length; j++ ) {

      ver = vertices[ j ];
      col = colors[ j ];
      wid = widths[ j ];
      cou = j / vertices.length;

      this.positions.push( ver.x, ver.y, ver.z );
      this.positions.push( ver.x, ver.y, ver.z );
      this.lineIndex.push(this.idx + cou);
      this.lineIndex.push(this.idx + cou);
      this.colors.push(col.r, col.g, col.b);
      this.colors.push(col.r, col.g, col.b);
      this.widths.push(wid);
      this.widths.push(wid);
    }

  },

  process:      function() {

    var j, c, v, n, w, l = this.positions.length / 6;

    for( j = 0; j < l; j++ ) {
      this.side.push(  1 );
      this.side.push( -1 );
      this.uvs.push( j / ( l - 1 ), 0 );
      this.uvs.push( j / ( l - 1 ), 1 );
    }

    if( this.compareV3( 0, l - 1 ) ){
      v = this.copyV3( l - 2 );
    } else {
      v = this.copyV3( 0 );
    }

    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );

    for( j = 0; j < l - 1; j++ ) {
      v = this.copyV3( j );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    for( j = 1; j < l; j++ ) {
      v = this.copyV3( j );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    if( this.compareV3( l - 1, 0 ) ){
      v = this.copyV3( 1 );
    } else {
      v = this.copyV3( l - 1 );
    }

    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

    for( j = 0; j < l - 1; j++ ) {
      n = j + j;
      this.indices.push( n, n + 1, n + 2 );
      this.indices.push( n + 2, n + 1, n + 3 );
    }

  },


};
