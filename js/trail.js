
// https://github.com/spite/THREE.MeshLine


function Trails(name, trailsVectors, trailsColors, color) {

  var 
    index      = 0,
    alphamap   = SCENE.loader.load('images/line.alpha.64.png'),
    convert    = function (latlon) {
      return TOOLS.latLongToVector3(latlon[0], latlon[1], CFG.earth.radius, CFG.earth.radius / 45);
    },
    nonIndexed,
  end;
  
  this.frame      = 1;
  this.geoMerged  = new THREE.BufferGeometry();
  this.meshMerged,
  this.geometries = [];
  this.materials  = [];
  this.trails     = [];
  this.amount     = trailsVectors.length;
  this.length     = trailsVectors[0].length;
  this.container  = new THREE.Object3D();

  H.zip(trailsVectors, trailsColors, (vectors, pointColors) => {

    var line       = new MeshLine();
    var geometry   = new THREE.Geometry();
    // var color      = new THREE.Color('hsl(200, 80%, 50%)');
    var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
    var lineWidth  = CFG.earth.radius / 180;

    var material   = new MeshLineMaterial( {

      alphaMap:        alphamap,
      color:           color,
      lineWidth:       lineWidth,
      opacity:         0.8,
      resolution:      resolution,

      depthTest:       true,                    // false ignores planet
      blending:        THREE.AdditiveBlending,
      side:            THREE.DoubleSide,
      transparent:     true,                    // needed for alphamap
      lights:          false,                   // no deco effex

      head:            this.length -1,          // begin of line
      pointer:         0.0,                     // current head of trail 
      section:         80 / this.length,         // length of trail in %

      // wireframe:       true,

    });

    geometry.vertices = vectors; //latlons.map(convert);
    line.setGeometry( geometry );
    nonIndexed = line.geometry.toNonIndexed();

    // if (index === 0) {
    //   this.geoMerged = nonIndexed.clone();      
    // } else {
    //   this.geoMerged.merge(nonIndexed);
    // }


    // var mesh = new THREE.Mesh( line.geometry, material );

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
    var i, pointer, len = this.materials.length;
    this.frame += 1;
    for (i=0; i<len; i++){
      pointer = this.materials[i].uniforms.pointer;
      pointer.value = (this.frame % this.length) / this.length;
      pointer.needsUpdate = true;
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
