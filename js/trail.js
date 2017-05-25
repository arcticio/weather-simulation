
// https://github.com/spite/THREE.MeshLine


function Trails(name, trailsVectors, trailsColors, color) {

  var 
    index      = 0,
    alphamap   = SCN.loader.load('images/line.alpha.64.png'),
    // alphamap   = SCN.loader.load('images/line.alpha.32.61.png'),
    // alphamap   = SCN.loader.load('images/line.alpha.64.64.png'),
    // convert    = function (latlon) {
    //   return TOOLS.latLongToVector3(latlon[0], latlon[1], CFG.earth.radius, CFG.earth.radius / 45);
    // },
    nonIndexed,
  end;

  
  this.frame      = 0;
  this.geometries = [];
  this.materials  = [];
  this.trails     = [];
  this.amount     = trailsVectors.length;
  this.length     = trailsVectors[0].length;
  this.container  = new THREE.Object3D();

  H.zip(trailsVectors, trailsColors, (vectors, colors) => {

    var line       = new MeshLine();
    var geometry   = new THREE.Geometry();
    var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
    var lineWidth  = CFG.earth.radius / 45;
    var start      = ~~(Math.random() * this.length);

    var material   = new MeshLineMaterial( {

      // https://threejs.org/docs/index.html#api/constants/Materials

      alphaMap:        alphamap,
      alphaTest:       0.5,
      repeat:          new THREE.Vector2(2.0, 1.0),
      offset:          new THREE.Vector2(0.0, 0.0),

      color:           color,
      lineWidth:       lineWidth,
      opacity:         0.8,
      resolution:      resolution,

      depthTest:       true,                    // false ignores planet
      blending:        THREE.NormalBlending,    // NormalBlending, AdditiveBlending
      side:            THREE.FrontSide,         // FrontSide, DoubleSide
      transparent:     true,                    // needed for alphamap
      lights:          false,                   // no deco effex

      head:            start,                   // begin of line
      pointer:         start,                   // current head of trail 
      section:         10 / this.length,        // length of trail in %

      // wireframe:       true,

    });


    geometry.vertices = vectors;
    geometry.colors   = colors;

    line.setGeometry( geometry );
    nonIndexed = line.geometry.toNonIndexed();

    var mesh = new THREE.Mesh( nonIndexed, material );
    mesh.name = name + '.' + index;

    this.geometries.push(geometry);
    this.materials.push(material);
    this.trails.push(mesh);

    this.container.add(mesh);

    index += 1;

  });

  // this.meshMerged = new THREE.Mesh(this.geoMerged, new THREE.MultiMaterial(this.materials));

}

Trails.prototype = {
  construcor: Trails,
  step: function () {
    var i, pointer, head, len = this.materials.length;
    this.frame += 1;
    for (i=0; i<len; i++){

      head = this.materials[i].uniforms.head.value,
      pointer = this.materials[i].uniforms.pointer;
      pointer.value = ((head + this.frame) % this.length) / this.length;
      pointer.needsUpdate = true;

      // this.materials[i].uniforms.offset.value.y = (this.frame % TRAIL_LEN) / TRAIL_LEN;
      // this.materials[i].uniforms.offset.value.x = (this.frame % TRAIL_LEN) / TRAIL_LEN * 0.5;
      // this.materials[i].uniforms.offset.needsUpdate = true;


    }
  }
}

function Trail (lats, lons, length, alphamap) {

  var 
    width   = CFG.earth.radius / 180,
    cutoff  = 0.4,
    frame   = 0,
    pointer = 0,
    length  = lats.length,
    section = 1 / length,

    end;

  function rndColor() {

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    var h = rand(1, 360);
    var s = 80; // rand(0, 100);
    var l = 50; // rand(0, 100);
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';

  }

  function calcWidth (cutoff) {
    return function (percent) {
      var  res = percent < cutoff ? 1 - (cutoff - percent) / 0.2 : 1;
      return res ;
    };
  }

  var line       = new MeshLine();
  var geometry   = new THREE.Geometry();
  var color      = new THREE.Color(rndColor());
  var vertices   = H.zip(lats, lons, (lat, lon) => TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, CFG.earth.radius / 45));
  var material   = new MeshLineMaterial( {

    alphaMap:        alphamap,
    blending:        THREE.AdditiveBlending,
    color:           color,
    depthTest:       true,    // false ignores planet
    lineWidth:       width,
    opacity:         0.1,
    resolution:      new THREE.Vector2( window.innerWidth, window.innerHeight ),
    side:            THREE.DoubleSide,
    transparent:     true, // needed for alphamap
    lights:          false,

    head:            length -1,   // begin of line
    pointer:         0.0,         // current head of trail 
    section:         section,     // length of trail in %

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

    // var lat = H.clamp( (this.head[0] + ( [-1, +1][~~(Math.random() * 2)] * Math.random()) ), -89,   89 );
    // var lon = H.clamp( (this.head[1] + ( [-1, +1][~~(Math.random() * 2)] * Math.random()) ), -180, 180 );
    
    var lat = this.head[0] + 0.0;
    var lon = this.head[1] + 3.0;

    line.advance(TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, CFG.earth.radius / 45));
    this.head = [lat, lon];

  }

  // console.log('length', length);
  // console.log('lats', lats.length);
  // console.log('trail.vertices', vertices.length);

}
