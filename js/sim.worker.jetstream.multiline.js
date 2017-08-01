
var Multiline = {};

Multiline.line = function ( idx, vertices, colors, widths ) {

  this.idx       = idx;

  this.index     = [];
  this.lineIndex = [];
  this.next      = [];
  this.positions = [];
  this.previous  = [];
  this.side      = [];
  this.widths    = [];
  this.colors    = [];

  this.length = vertices.length;

  this.init(vertices, colors, widths);
  this.process();


  // TODO: Needed?
  this.attributes = {
    index:     new Uint16Array(  this.index ),   
    lineIndex: new Float32Array( this.lineIndex ), 
    next:      new Float32Array( this.next ),      
    position:  new Float32Array( this.positions ), 
    previous:  new Float32Array( this.previous ),  
    side:      new Float32Array( this.side ),      
    width:     new Float32Array( this.widths ),    
    colors:    new Float32Array( this.colors ),    
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

    var j, ver, cnt, col, wid, n, len = this.length;

    for( j = 0; j < len; j++ ) {

      ver = vertices[ j ];
      col = colors[ j ];
      wid = widths[ j ];
      cnt = j / vertices.length;

      this.positions.push( ver.x, ver.y, ver.z );
      this.positions.push( ver.x, ver.y, ver.z );
      this.lineIndex.push(this.idx + cnt);
      this.lineIndex.push(this.idx + cnt);
      this.colors.push(col.r, col.g, col.b);
      this.colors.push(col.r, col.g, col.b);
      this.widths.push(wid);
      this.widths.push(wid);
      this.side.push(  1 );
      this.side.push( -1 );

    }

    for( j = 0; j < len - 1; j++ ) {
      n = j + j;
      this.index.push( n,     n + 1, n + 2 );
      this.index.push( n + 2, n + 1, n + 3 );
    }

  },

  process:      function() {

    var j, v, l = this.positions.length / 6;

    v = this.compareV3( 0, l - 1 ) ? this.copyV3( l - 2 ) : this.copyV3( 0 ) ;
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

    v = this.compareV3( l - 1, 0 ) ? this.copyV3( 1 ) : this.copyV3( l - 1 ) ;
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

  }

};
