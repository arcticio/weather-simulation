
// https://github.com/spite/THREE.MeshLine

function Trail (lats, lons, length) {

  var 
    width  = CFG.earth.radius / 90;
    cutoff = 0.4;

  function calcWidth (cutoff) {
    return function (percent) {
      var  res = percent < cutoff ? 1 - (cutoff - percent) / 0.2 : 1;
      return res ;
    };
  }

  var geometry   = new THREE.Geometry();
  var line       = new MeshLine();
  var vertices   = H.zip(lats, lons, (lat, lon) => TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, CFG.earth.radius / 45));
  var material   = new MeshLineMaterial( {
    alphaMap:        new THREE.TextureLoader().load('images/line.alpha.png'),
    useAlphaMap:     1,
    blending:        THREE.AdditiveBlending,
    color:           new THREE.Color( 'rgb(250, 0, 0)' ),
    depthTest:       true,    // false ignores planet
    lineWidth:       width,
    opacity:         1.0,
    resolution:      new THREE.Vector2( window.innerWidth, window.innerHeight ),
    side:            THREE.FrontSide,
    sizeAttenuation: 1,
    transparent:     true, // needed for alphamap
  });

  geometry.vertices = vertices.slice(0, length);

  line.setGeometry( geometry,  calcWidth(cutoff) ); // makes width taper

  this.mesh = new THREE.Mesh( line.geometry, material ); 
  this.mesh.frustumCulled = false;
   
  this.advance = function (index) {
    line.advance(vertices[index]);
  }

  // console.log('length', length);
  // console.log('lats', lats.length);
  // console.log('trail.vertices', vertices.length);

}
