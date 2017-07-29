
if( typeof importScripts === 'function') {

  var 

    name = 'jet.worker',

    cfg, topics, doe, pool,

    datagrams = {
      ugrd10m: null,
      vgrd10m: null
    },

    prelines = null  // pos, wid, col per sector

  ;

  importScripts(
    '../libs/async.js',
    'aws.helper.js', 
    'aws.tools.js',
    'aws.math.js',
    'aws.res.js',
    'sim.datagram.js'
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

    var i, coord, out = [], len = pool.length;

    for (i=0; i<amount && i<len; i++) {

      coord = pool[i];
      
      if ( 
          coord.lat < sector[0] && 
          coord.lon > sector[1] && 
          coord.lat > sector[2] && 
          coord.lon < sector[3] 
        ) {

        out.push(coord);
      
      }

    }

    return out;

  }


  topics = {

    quadratic: function (data) {
      return new Float32Array(data.map(n => n * n));
    },

    retrieve: function (id, payload, callback) {

      var datagramm, vari;

      cfg  = payload.cfg;
      doe  = cfg.doe;
      pool = cfg.pool;

      RES.load({ urls: payload.urls, onFinish: function (err, responses) {

        if (err) { throw err } else {

          responses.forEach(function (response) {

            datagramm = new SIM.Datagram(response.data);
            vari = datagramm.vari;
            datagrams[vari] = datagramm;

          });

          console.log(name + ': have datagrams', id, datagramm.info.data.avg);

          topics.prepare(id, payload, function () {

            callback(id, {}, [])

          });

        }

      }});

    },

    prepare: function (id, payload, callback) {

      var 
        t0        = Date.now(), 

        total = 0,

        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, positions, widths, colors, seeds,
        spcl      = new Spherical(),
        length    = cfg.length,
        amount    = NaN,
        filler    = () => []
      ;

      prelines = cfg.sim.sectors.map( sector => {

        seeds     = filterPool(sector, cfg.amount);
        amount    = seeds.length; 

        total +=  amount;

        positions = new Array(amount).fill(0).map(filler);
        colors    = new Array(amount).fill(0).map(filler);
        widths    = new Array(amount).fill(0).map(filler);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = latLonRadToVector3(lat, lon, cfg.radius);

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

        return {
          positions, 
          colors, 
          widths, 
        };

        // model.obj.add(multiline.mesh);
        // model.sectors.push(multiline);

      });

      console.log(name + ': build prelines', id, total, Date.now() - t0);
      callback(id, {}, [])

    },

  };


  // process something
  onmessage = function(event) {

    var 
      id      = event.data.id,
      topic   = event.data.topic,
      payload = event.data.payload;

    console.log('new worker.job', topic, id, typeof payload);

    if (topics[topic]) {

      topics[topic](id, payload, function (id, result, transferables) {
        postMessage({id, result}, transferables);
      });


    } else {
      console.warn(name + ': unknown topic', topic);

    }

  };


}
