
// https://github.com/spite/THREE.MeshLine

function Trail (lats, lons, length, alphamap) {

  var 
    width   = CFG.earth.radius / 180,
    cutoff  = 0.4,
    frame   = 0,
    pointer = 0,

    end;

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
    alphaMap:        SCENE.loader.load('images/line.alpha.16.png'),
    useAlphaMap:     1,
    blending:        THREE.AdditiveBlending,
    color:           new THREE.Color( 'rgb(250, 0, 0)' ),
    depthTest:       true,    // false ignores planet
    lineWidth:       width,
    opacity:         1.0,
    resolution:      new THREE.Vector2( window.innerWidth, window.innerHeight ),
    side:            THREE.DoubleSide,
    transparent:     true, // needed for alphamap
    head:            length -1,
    pointer:         0.0,
    lights:          false,
    // wireframe:       true,
  });

  geometry.vertices = vertices.slice(0, length);

  // line.setGeometry( geometry,  calcWidth(cutoff) ); // makes width taper
  line.setGeometry( geometry); // makes width taper

  this.mesh = new THREE.Mesh( line.geometry, material ); 
  this.mesh.name = 'simline';
  this.mesh.frustumCulled = false;

  this.head = [H.last(lats), H.last(lons)];
   
  this.advance = function (index) {
    line.advance(vertices[index]);
  }

  this.step = function () {
    frame += 1;
    material.uniforms.pointer.value = (frame % length) / length;
    material.uniforms.pointer.needsUpdate = true;
  }

  this.move = () => {

    var lat = H.clamp( (this.head[0] + ( [-1, +1][~~(Math.random() * 2)] * Math.random()) ), -89,   89 );
    // var lon = H.clamp( (this.head[1] + ( [-1, +1][~~(Math.random() * 2)] * Math.random()) ), -180, 180 );
    var lat = this.head[0] + 1.0;
    var lon = this.head[1] + 1.0;

    line.advance(TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, CFG.earth.radius / 45));
    this.head = [lat, lon];

  }

  // console.log('length', length);
  // console.log('lats', lats.length);
  // console.log('trail.vertices', vertices.length);

}
