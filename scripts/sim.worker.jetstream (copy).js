/*
  6 sectors * 512 lines * 60 vertices, t=threads, m=stamps
  jetstream t:  1 m: 10 ms: 15651
  jetstream t:  2 m: 10 ms:  9348
  jetstream t:  3 m: 10 ms:  8583
  jetstream t:  4 m: 10 ms:  7969
  jetstream t:  5 m: 10 ms:  7891
  jetstream t:  6 m: 10 ms:  8037
  jetstream t:  7 m: 10 ms:  7981
  jetstream t:  8 m: 10 ms:  8594
  jetstream t:  9 m: 10 ms:  9060
  jetstream t: 10 m: 10 ms:  8797

*/

if( typeof importScripts === 'function') {

  const 
    PI     = Math.PI,
    TAU    = 2 * PI,
    PI2    = PI / 2,
    RADIUS = 1.0,
    DEGRAD = PI / 180.0
  ;

  var 

    name = 'jet.worker',

    cfg, topics, doe, pool,

    datagrams = {
      ugrdprs: null,
      vgrdprs: null
    },

    prelines   = null,  // pos, wid, col per sector
    multilines = null,  // lines per sector
    sectors    = null   // with attributes per sector

  ;

  function vec3toLat (v, radius) {return 90 - (Math.acos(v.y / radius))  * 180 / PI;}
  function vec3toLon (v, radius) {return ((270 + (Math.atan2(v.x , v.z)) * 180 / PI) % 360);}

  function vector3ToLatLong (v, radius) {

    return {
      lat: 90 - (Math.acos(v.y / radius))  * 180 / Math.PI,
      lon: ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360)
    };

  }

  function latLonRadToVector3 (lat, lon, radius) {

    var phi   = lat * Math.PI / 180;
    var theta = (lon - 180) * Math.PI / 180;

    var x = -radius * Math.cos(phi) * Math.cos(theta);
    var y =  radius * Math.sin(phi);
    var z =  radius * Math.cos(phi) * Math.sin(theta);

    return new Vector3(x, y, z);

  }

  function filterPool (sector, amount) {

    var i, j = 0, coord, out = [], len = pool.length;

    for (i=0; j<amount && i<len; i++) {

      coord = pool[i];
      
      if ( 
          coord.lat < sector[0] && 
          coord.lon > sector[1] && 
          coord.lat > sector[2] && 
          coord.lon < sector[3] 
        ) {

        out.push(coord);
        j += 1;
      
      }

    }

    return out;

  }

  function onmessage (event) {

    var 
      id       = event.data.id,
      topic    = event.data.topic,
      payload  = event.data.payload,
      callback = function (id, result, transferables) {
        postMessage({id, result}, transferables);
      }
    ;

    if (topics[topic]) {
      topics[topic](id, payload, callback);

    } else {
      console.warn(name + ': unknown topic', topic);

    }

  }

  topics = {

    importScripts: function (id, payload, callback) {
      importScripts.apply(null, payload.scripts);
      callback(id, null);
    },

    retrieve: function (id, payload, callback) {

      var datagramm, vari;

      cfg  = payload.cfg;
      doe  = payload.doe;
      pool = payload.pool;

      RES.load({ urls: payload.urls, onFinish: function (err, responses) {

        if (err) { throw err } else {

          responses.forEach(function (response) {

            datagramm = new SIM.Datagram(response.data);
            vari = datagramm.vari;
            datagrams[vari] = datagramm;

          });

          topics.prepare(id, payload, function () {
            topics.process(id, payload, function () {
              topics.combine(id, payload, function (id, result, transferables) {

                callback(id, result, transferables)

              });
            });
          });

        }

      }});

    },

    prepare: function (id, payload, callback) {

      var 
        t0        = Date.now(), 
        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, positions, widths, colors, seeds,
        sat       = 0.4,
        spcl      = new Spherical(),
        length    = cfg.length,
        amount    = NaN,
        filler    = () => [],
        counter   = (a, b) => a + b.positions.length
      ;

      // over sectors
      prelines = cfg.sim.sectors.map( sector => {

        seeds     = filterPool(sector, cfg.amount);
        amount    = seeds.length; 

        positions = new Array(amount).fill(0).map(filler);
        colors    = new Array(amount).fill(0).map(filler);
        widths    = new Array(amount).fill(0).map(filler);

        // over lines
        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = latLonRadToVector3(lat, lon, cfg.radius);

          // over vertices
          for (j=0; j<length; j++) {

            u     = datagrams.ugrdprs.linearXY(doe, lat, lon);
            v     = datagrams.vgrdprs.linearXY(doe, lat, lon);
            speed = Math.hypot(u, v);

            u /= Math.cos(lat * DEGRAD);

            color = new Color().setHSL(cfg.hue, sat, speed / 100);
            width = H.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * cfg.factor;                   // east-direction
            spcl.phi   -= v * cfg.factor;                   // north-direction

            vec3 = vec3.setFromSpherical(spcl).clone();
            lat  = vec3toLat(vec3, cfg.radius);
            lon  = vec3toLon(vec3, cfg.radius);

          }

        }

        return { positions, colors, widths };

      });

      // debugger;
      // console.log(name + ': prepare', id, Date.now() - t0, prelines.reduce(counter, 0));

      callback(id, {}, [])

    },

    process: function (id, payload, callback) {

      var 
        t0 = Date.now(),
        idx = 0,
        counter = (a, b) => a + b.length
      ;

      multilines = prelines.map(preline => {

        idx = 0;

        return H.zip(
          preline.positions,
          preline.colors,
          preline.widths,
          (vectors, colors, widths) => new Multiline(idx++, vectors, colors, widths)
        );

      });

      // debugger;
      // console.log(name + ': process', id, Date.now() - t0, multilines.reduce(counter, 0));

      callback(id, {}, []);

    },

    combine: function (id, payload, callback) { 

      var 
        config = {
          colors:    Float32Array,
          index:     Uint16Array,
          lineIndex: Float32Array,
          next:      Float32Array,
          position:  Float32Array,
          previous:  Float32Array,
          side:      Float32Array,
          width:     Float32Array,
        },
        textures = {
          u: datagrams.ugrdprs.data[doe], 
          v: datagrams.vgrdprs.data[doe], 
        },
        transferables = [textures.u.buffer, textures.v.buffer]
      ;

      // debugger;

      // over sectors (n=6)
      sectors = multilines.map( lines => {

        var totalLength, attributes = {};

        // over attributes (n=8)
        H.each(config, (name, type) => {

          // debugger;

          totalLength      = lines[0].attributes[name].length * lines.length;
          attributes[name] = new type(totalLength);

          var 
            i, source, length,
            pointer     = 0,
            indexOffset = 0,
            positLength = lines[0].attributes['position'].length / 3,
            target      = attributes[name]
          ;

          // over lines (n=512)
          H.each(lines, (_, line) => {

            source = line.attributes[name];
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

        });

        return attributes;

      });

      H.each(sectors, (_, sector) => {
        H.each(config, (name) => {
          transferables.push(sector[name].buffer);
        });
      });

      // TODO: check edge + transferable
      callback(id, {sectors, textures}, transferables);

    }

  };


}


function Multiline ( idx, vertices, colors, widths ) {

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


  // TODO: Needed? ~15% faster
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

Multiline.prototype = {
  constructor:  Multiline,
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
