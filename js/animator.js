'use strict';

// https://github.com/sindresorhus/screenfull.js/

var ANI = (function () {

  var 
    self,

    status   = {frame: 0},
    actions = [],
    
    end;


  return {

    status,

    boot: function () {
      return self = this;
    },
    init: function () {


    },
    activate: function () {

      // self.insert(400, self.library.example);

    },

    step: function (frame, dt) {

      status.frame = frame;

      if (actions[frame]) {
        actions[frame]();
      }

    },

    stop: function () {
      TWEEN.removeAll();
    },


    insert: function (frame, action) {

      if (typeof frame === 'number') {

        if (frame === 0){
          action();

        } else {
          actions[frame] = action;

        }

      }


    },

    library: {

      // graphs => https://5013.es/toys/tween.audio/

      example: function () {


        if (SCN.meshes.data){

          var current = {y: SCN.meshes.data.rotation.y};
          var target  = {y: SCN.meshes.data.rotation.y + 2 * Math.PI};

          var tween = new TWEEN
            .Tween(current)
            .delay(100)
            .easing(TWEEN.Easing.Exponential.In)
            .to(target, 2000)
            .repeat(0)
            .onStart(function(d){
              TIM.step('TWEEN.start', d)
            })
            .onUpdate(function(d){
              SCN.meshes.data.rotation.y = current.y;
            })
            .onComplete(function(d){
              TIM.step('TWEEN.done', d)
            })
            .start()
          ;

        } else {
          TIM.step('TWEEN.ignored');

        }

      },

      cam2latlon: function (lat, lon, distance){

        var 
          spherical,
          curVec   = SCN.camera.position.clone(),
          futVec   = TOOLS.latLongToVector3(lat, lon, distance, 0),

          curShere = new THREE.Spherical().setFromVector3(curVec),
          futShere = new THREE.Spherical().setFromVector3(futVec),

          current = {
            phi:    curShere.phi,
            theta:  curShere.theta,
            radius: SCN.camera.position.length(),
          },
          target  = {
            phi:    futShere.phi,
            theta:  futShere.theta,
            radius: distance,
          };

        return function () {

          TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 500)
            .onUpdate(function(d){
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
            })
            .onComplete(function(d){
              IFC.updateMouse();
            })
            .start()
          ;

        };


      },

      cam2vector: function (vector, distance){

        var 
          spherical,
          curShere = new THREE.Spherical().setFromVector3(SCN.camera.position),
          futShere = new THREE.Spherical().setFromVector3(vector),

          current = {
            phi:    curShere.phi,
            theta:  curShere.theta,
            radius: SCN.camera.position.length(),
          },
          target  = {
            phi:    futShere.phi,
            theta:  futShere.theta,  // east-direction
            radius: distance,
          };

        // handle moving over NUll Meridian
        if (target.theta - current.theta > Math.PI) {
          target.theta += 2 * Math.PI;
        }

        return function () {

          TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 500)
            .onUpdate(function(d){
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
            })
            .start()
          ;

        };


      },

    } // end lib


  };

}()).boot();


/*

sphericalPosition = new THREE.Spherical().setFromVector3(vector3);
sphericalPosition.theta += model.ugrd10.linearXY(0, lat, lon) * factor; // east-direction
sphericalPosition.phi   += model.vgrd10.linearXY(0, lat, lon) * factor; // north-direction
vector3 = vector3.setFromSpherical(sphericalPosition).clone();



*/