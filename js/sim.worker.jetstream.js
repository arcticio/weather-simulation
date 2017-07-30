/*
  t=threads, m=stamps
  SIM.loaded jetstream t:  1 m: 10 ms: 15651
  SIM.loaded jetstream t:  2 m: 10 ms:  9348
  SIM.loaded jetstream t:  3 m: 10 ms:  8583
  SIM.loaded jetstream t:  4 m: 10 ms:  7969
  SIM.loaded jetstream t:  5 m: 10 ms:  7891
  SIM.loaded jetstream t:  6 m: 10 ms:  8037
  SIM.loaded jetstream t:  7 m: 10 ms:  7981
  SIM.loaded jetstream t:  8 m: 10 ms:  8594
  SIM.loaded jetstream t:  9 m: 10 ms:  9060
  SIM.loaded jetstream t: 10 m: 10 ms:  8797

*/

if( typeof importScripts === 'function') {

  var 

    name = 'jet.worker',

    cfg, topics, doe, pool,

    datagrams = {
      ugrd10m: null,
      vgrd10m: null
    },

    prelines   = null,  // pos, wid, col per sector
    multilines = null,  // lines per sector
    sectors    = null   // with attributes per sector

  ;

  importScripts(
    '../libs/async.js',
    'aws.helper.js', 
    'aws.tools.js',
    'aws.math.js',
    'aws.res.js',
    'sim.datagram.js',
    'sim.worker.jetstream.multiline.js'
  );


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
      id      = event.data.id,
      topic   = event.data.topic,
      payload = event.data.payload;

    // console.log('new worker.job', topic, id, typeof payload);

    if (topics[topic]) {
      topics[topic](id, payload, function (id, result, transferables) {
        postMessage({id, result}, transferables);
      });


    } else {
      console.warn(name + ': unknown topic', topic);

    }

  }

  topics = {

    quadratic: function (data) {
      return new Float32Array(data.map(n => n * n));
    },

    retrieve: function (id, payload, callback) {

      var datagramm, vari, t0 = Date.now();

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

          // console.log(name + ': retrieve', id, Date.now() - t0);

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

          // over points
          for (j=0; j<length; j++) {

            u = datagrams.ugrdprs.linearXY(doe, lat, lon);
            v = datagrams.vgrdprs.linearXY(doe, lat, lon);

            speed = Math.hypot(u, v);
            color = new Color().setHSL(cfg.hue, 0.4, speed / 100);
            width = H.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * cfg.factor;                   // east-direction
            spcl.phi   -= v * cfg.factor;                   // north-direction
            vec3 = vec3.setFromSpherical(spcl).clone();
            
            latlon = vector3ToLatLong(vec3, cfg.radius);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        // sectors with 512 lines * cfg.length
        // console.log(positions.length, colors.length, widths.length);

        return {
          positions, 
          colors, 
          widths, 
        };

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
          (vectors, colors, widths) => new Multiline.line(idx++, vectors, colors, widths)
        );

      });

      // debugger;
      // console.log(name + ': process', id, Date.now() - t0, multilines.reduce(counter, 0));

      callback(id, {}, []);

    },

    combine: function (id, payload, callback) { 

      var 
        transferables = [],
        t0 = Date.now(),
        counter = (a, b) => a + b.position.length,
        config = {
          colors:    Float32Array,
          index:     Uint16Array,
          lineIndex: Float32Array,
          next:      Float32Array,
          position:  Float32Array,
          previous:  Float32Array,
          side:      Float32Array,
          width:     Float32Array,
        }
      ;

      // over sectors (n=6)
      sectors = multilines.map( lines => {

        var totalLength, attributes = {};

        // over attributes (n=8)
        H.each(config, (name, type) => {

          // debugger;

          totalLength      = lines[0].attributes[name].length * lines.length;
          attributes[name] = new type(totalLength);

          var 
            pointer     = 0,
            indexOffset = 0,
            positLength = lines[0].attributes['position'].length / 3,
            target      = attributes[name]
          ;

          // over lines (n=512)
          H.each(lines, (_, line) => {

            var i,
              source = line.attributes[name],
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

      // debugger;
      // console.log(name + ': combine', id, Date.now() - t0, sectors.reduce(counter, 0));

      H.each(sectors, (_, sector) => {
        H.each(config, (name, _) => {
          transferables.push(sector[name].buffer);
        });
      });

      // TODO: check edge + transferable
      callback(id, sectors, transferables);

    }

  };


}
