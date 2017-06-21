'use strict';

/*
  
  // only simple data types
  defaults  => all values
  preset    => values changeable by user, subset of defaults, managed by gui.dat

  // complex data types
  scene     => loaded by SCENE
  cfg       => all of above combined

*/


Object.assign(CFG, {

  init: function () {

    var 
      hash, time, coords, position, assets, 
      [locHash, locTime, locCoords] = location.pathname.slice(1).split('/'),
    end;

    if (locHash !== undefined) {
      assets = CFG.hash2assets(locHash);
    }

    if (locTime !== undefined) {
      time = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
      if (!time.isValid()) {
        time = undefined;
      }
    }

    if (locCoords !== undefined) {
      coords = locCoords.split(';').map(Number);
      position = new THREE.Vector3().add({
        x: coords[0] !== undefined ? coords[0] : 2.0,
        y: coords[1] !== undefined ? coords[1] : 2.0,
        z: coords[2] !== undefined ? coords[2] : 2.0,
      })
    }

    console.log('hash',   hash);
    console.log('time',   time ? time.format('YYYY-MM-DD-HH-mm') : undefined);
    console.log('coords', coords);

    // enable objects
    H.each(CFG.Objects, (name, cfg) => {
      if (cfg.id){
        cfg.visible = assets.indexOf(cfg.id) !== -1;
      }
    });

    // set cam
    if (position) {
      CFG.Objects.perspective.pos = position;
    }

    // current model time
    if (time) {
      TIMENOW = time.clone();
    }

  },

  hash2assets: function(code){

    var i, layers = [];

    code = H.Base62.toNumber(code);

    function bit (i, test) {return (i & (1 << test));}

    for (i = 0; i < 32; i++){
      if (bit(code, i)){layers.push(i);}
    }

    return layers.sort(function(a, b){return a-b;});

  },

  layers2hash: function(layers){

    var out = 0;

    if (!layers.length) {return null;}

    layers.forEach(function(l){
      out += 1 << l;
    });

    return H.Base62.fromNumber(out);

  },


});


function _clone (target, source) {

  H.each(source, (key, value) => {

    if (typeof source[key] === 'number'){
      target[key] = source[key];

    } else if (typeof source[key] === 'boolean'){
      target[key] = source[key];

    } else if (typeof source[key] === 'string'){
      target[key] = source[key];

    } else if (typeof source[key] === 'object'){

      if (Array.isArray(source[key])) {
        target[key] = H.clone(source[key]);

      } else {
        target[key] = _clone({}, source[key]);

      }

    } else {
      console.warn("CFG.clone: Can't check:", key, source);

    }

  });

  return target;

}

// only simple datatypes
var _DEFAULTS = {

  radius:                    1,

  faces:     ['right', 'left', 'top', 'bottom', 'front', 'back'],

  datetime: (function () {return "2017-05-20 12:00" })(),


  // SCENE

  Camera: {
    x:                        0,
    y:                        0,
    z:                        0,
  },

  Ambient: {
    enabled: true,
    intensity: 0.5,
    color:     0xffffff,
  },

  Spot: {
    enabled: true,
    intensity: 0.5,
    color:     0xffffff,
    x: 0,
    y: 2,
    z: 0,
  },

  Axes: {
    enabled: true,

  },


  // GLOBE
  Surface: {
    enabled: true,

  },

  Data: {
    enabled: true,

  },

  Pointer: {
    enabled: true,
    color:   0x660000,

  },

  Seaice: {
    enabled: true,

  },

  SST: {
    enabled: true,

  },

  Wind: {
    enabled:   true,
    trails:   100,
    length:   60,
    color:    "#882222",
    alphaMap: 'images/line.alpha.16.png'

  },

  Ocean: {
    enabled: true,

  }

};

var _PRESET = _clone(_DEFAULTS, {

  Camera: {
    x:                        0,
    y:                        3,
    z:                        0,
  }


});

// console.log('preset', JSON.stringify(_PRESET, null, 2));


// mostly meshes
var _makeScene = function (OPT) {

  return {

    camera: {
      position: new THREE.Vector3(
        OPT.camera.x,
        OPT.camera.y,
        OPT.camera.z,
      ),
      object:  new THREE.PerspectiveCamera(
        45, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1500
      ),
    },

    // lights

    ambient: {
      enabled: OPT.ambient.enabled,
      object: new THREE.AmbientLight( 
        OPT.ambient.color, 
        OPT.ambient.intensity 
      )
    },

    spot: {
      enabled: OPT.spot.enabled,
      position: new THREE.Vector3(
        OPT.spot.x,
        OPT.spot.y,
        OPT.spot.z,
      ),
      object: new THREE.SpotLight(
        OPT.spot.color, 
        OPT.spot.intensity, 
        OPT.spot.distance, 
        0, 0.6, 0.1
      )
    },

    // click object
    pointer: {
      enabled: OPT.pointer.enabled,
      object: new THREE.Mesh(
        new THREE.SphereGeometry(OPT.radius - 0.01, 64, 64),                  
        new THREE.MeshBasicMaterial({
          color:     OPT.pointer.color,
          wireframe: true,
        })
      )
    },

    latlon: {
      object: new THREE.ArrowHelper( 
        new THREE.Vector3( 1, 1,  1), 
        new THREE.Vector3( 0,  0,  0), 
        OPT.radius + 0.08, 
        0xffff00
      ),
    },

    surface: {
      enabled: OPT.surface.enabled,
      cube:    {
        radius: OPT.radius,
        textures: 'images/mask/earth.FACE.2048.jpg'
      }
    },

    data: {
      enabled: OPT.data.enabled,
      cube:    {
        radius: OPT.radius,
        textures: 'images/mask/earth.FACE.2048.jpg'
      }
    },

    sst: {
      enabled: OPT.sst.enabled,
      cube:    {
        radius: OPT.radius + 0.0005,
        textures: 'images/sst/globe.sst.FACE.1024.png'
      }
    },

    seaice: {
      enabled: OPT.sst.enabled,
      cube:    {
        radius: OPT.radius + 0.001,
        textures: 'images/amsr2/polar.amsr2.FACE.1024.png'
      }
    },



  } 


};




var _CFG = (function () {

  var 
    self,

    cfg = {},
    
    end;


  return {

    boot: function () {
      return self = this;
    },
    init: function (preset) {


    },

    prepObjects: function (scene, options) {


    },

  };

}()).boot();