
var TOOLS = {

  createLatLonsRectRandom: function (ul, lr, amount) {

    var i, lat, lon, latlons = [];

    for (i=0; i<amount; i++) {

      lon = ul[1] + Math.random() * (lr[1] - ul[1]);
      lat = ul[0] + Math.random() * (lr[0] - ul[0]);
      // lat = lat * Math.cos((lat + 90) * Math.PI/180) * -1.8;
      // lat = lat > 89.5 ? 89.5 : lat;

      latlons.push([lat, lon]);

    }

    return latlons;

  },
  createLatLonsRect: function (ul, lr, res) {

    /*
        3 4, 3 5, 3 6, 3 7;
        4 4, 4 5, 4 6, 4 7;
        5 4, 5 5, 5 6, 5 7;
    */


    var 
      i, j, res = res || 1, 
      latlons = [],

      rowLen = (lr[1] - ul[1] +1) / res,
      colLen = (lr[0] - ul[0] +1) / res,
      
      rowLon = H.linspace(ul[1], lr[1], rowLen),
      allLon = TOOLS.flatten(H.repeat(rowLon, colLen)),
      
      colLat = H.linspace(ul[0], lr[0], colLen),
      allLat = TOOLS.flatten(TOOLS.transpose(H.repeat(colLat, rowLen)));
      
    
    return H.zip(allLat, allLon, (lat, lon) => [lat, lon] );


  }, transpose :  function (m) { 

      return m[0].map((x,i) => m.map(x => x[i]));

  
  }, flatten : function (array, mutable) {

      var result = [];
      var nodes = (mutable && array) || array.slice();
      var node;

      if (!array.length) {
          return result;
      }

      node = nodes.pop();
      
      do {
          if (Array.isArray(node)) {
              nodes.push.apply(nodes, node);
          } else {
              result.push(node);
          }
      } while (nodes.length && (node = nodes.pop()) !== undefined);

      result.reverse(); // we reverse result to restore the original order, TRY: Float.Revese
      return result;

  },

  placeMarker: function (object, options) {

    var position = TOOLS.latLongToVector3(options.latitude, options.longitude, options.radius, options.height);
    var marker   = TOOLS.createMarker(options.size, options.color, position);
    
    object.add(marker);

  },

  createMarker: function (size, color, vector3Position) {

    var markerGeometry = new THREE.SphereGeometry(size);
    var markerMaterial = new THREE.MeshLambertMaterial({color: color});
    var markerMesh     = new THREE.Mesh(markerGeometry, markerMaterial);

    markerMesh.position.copy(vector3Position);

    return markerMesh;

  },
  vector3toScreenXY: function (pos, width, height) {

    var p = new THREE.Vector3(pos.x, pos.y, pos.z);
    var vector = p.project(SCN.camera);

    vector.x = (vector.x + 1) / 2 * width;
    vector.y = -(vector.y - 1) / 2 * height;

    return vector;
  },
  vector3ToLatLong: function (v, radius) {

    // var lon = ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360) - 180;

    return {
      lat: 90 - (Math.acos(v.y / radius))  * 180 / Math.PI,
      // lon: ((Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360
      lon: ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360)
    };

  },

  vector3ToLatLongMem: function (v, radius, lat, lon) {

    lat = 90 - (Math.acos(v.y / radius))  * 180 / Math.PI,
    lon = ((Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360

  },

  latLongToVector3: function (lat, lon, radius, height) {

    var phi   = lat * Math.PI / 180;
    var theta = (lon - 180) * Math.PI / 180;

    var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    var y =  (radius + height) * Math.sin(phi);
    var z =  (radius + height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);

  },

  placeMarkerAtAddress: function (mesh, address, color) {

    var encodedLocation = address.replace(/\s/g, '+');
    var XHR = new XMLHttpRequest();

    XHR.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedLocation);
    XHR.send(null);
    XHR.onreadystatechange = function () {

      if (XHR.readyState == 4 && XHR.status == 200) {

        var result = JSON.parse(XHR.responseText);

        if (result.results.length > 0) {

          var latitude  = result.results[0].geometry.location.lat;
          var longitude = result.results[0].geometry.location.lng;

          Tools.placeMarker(mesh.getObjectByName('surface'), {
            latitude:  latitude,
            longitude: longitude,
            radius:    0.5,
            height:    0,
            size:      0.01,
            color:     color
          });

        }

      }

    };
  
  },

};
