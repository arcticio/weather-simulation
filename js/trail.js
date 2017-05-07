
function Trail (lats, lons) {

  function calcWidth (cutoff) {
    return function (percent) {
      return percent > cutoff ? 1 - (percent - cutoff) / (1 - cutoff) : 1;
    };
  }

  var geometry   = new THREE.Geometry();
  var line       = new MeshLine();
  var vertices   = H.zip(lats, lons, (lat, lon) => TOOLS.latLongToVector3(lat, lon, 0.5, 0.01));
  var material   = new MeshLineMaterial( {
    blending:        THREE.AdditiveBlending,
    color:           new THREE.Color( "rgb(255, 2, 2)" ),
    depthTest:   true,
    far:        100000,
    lineWidth:       0.01,
    near:            0,
    opacity:         0.8,
    resolution:      new THREE.Vector2( window.innerWidth, window.innerHeight ),
    side:            THREE.DoubleSide,
    sizeAttenuation: 1, // 0 | 1
    transparent:     true,
  });

  geometry.vertices = vertices;
  line.setGeometry( geometry,  calcWidth(0.8) ); // makes width taper

  this.mesh = new THREE.Mesh( line.geometry, material ); 
  this.mesh.frustumCulled = false;

  this.advance = function (index) {
    line.advance(vertices[index]);
  }

}