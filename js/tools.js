
var TOOLS = {

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

  latLongToVector3: function latLongToVector3(latitude, longitude, radius, height) {

    var phi   = latitude * Math.PI / 180;
    var theta = (longitude - 180) * Math.PI / 180;

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
