'use strict';

// https://github.com/sindresorhus/screenfull.js/

var ANI = (function () {

  var 
    self,
    status   = {frame: 0},
    actions  = [],
    $        = document.getElementById.bind(document),
    $$       = document.querySelectorAll.bind(document),
  end;


  return self = {

    status,

    init: function () {},
    activate: function () {},

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

    tween: function (current, target, duration, update, easing) {
      return function () {
        var tween = new TWEEN.Tween(current)
          .easing(easing)
          .to(target, duration)
          .onUpdate(update)
          .start()
        ;
      };
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
            .easing(TWEEN.Easing.Exponential.Out)
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

      intro: function (duration) {

        var 
          spherical, rgba,
          table    = $$('table.loader')[0],
          curVec   = new THREE.Vector3(8, 8, 8),
          futVec   = SCN.camera.position.clone(),
          curShere = new THREE.Spherical().setFromVector3(curVec),
          futShere = new THREE.Spherical().setFromVector3(futVec),
          current = {
            alpha:  0.2, 
            phi:    curShere.phi,
            theta:  curShere.theta,
            radius: SCN.camera.position.length(),
          },
          target  = {
            alpha:  -1.0, 
            phi:    futShere.phi,
            theta:  futShere.theta,
            radius: futVec.length(),
          };

        return function () {

          var tween = new TWEEN
            .Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, duration)
            .onUpdate(function(d){
              rgba = 'rgba(0, 0, 0, ' + (current.alpha < 0 ? 0 : current.alpha) + ')';
              table.style.backgroundColor = rgba;
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
              if (current.alpha < 0){
                $$('.loader .header')[0].innerHTML   = 'Have fun!';
              }
            })
            .onComplete(function(d){
              table.style.display = 'none';
            })
            .start()
          ;

        };

      },

      lightset: function (lightset, duration) {
        return function () {};
      },

      menu: {
        toggle: function (newx, duration) {

          var 
            current = {x: IFC.Hud.menu.position.x},
            target  = {x: newx},
            update  = () => IFC.Hud.menu.position.setX(current.x);

          return self.tween(current, target, duration, update, TWEEN.Easing.Sinusoidal.Out)

        },
        scale: function (scale, duration) {

          var 
            current = {scale: IFC.Hud.menu.scale.x},
            target  = {scale},
            update  = () => IFC.Hud.menu.scale.set(current.scale, current.scale, 1);

          return self.tween(current, target, duration, update, TWEEN.Easing.Sinusoidal.Out)

        }
      },

      sprite: {

        enter: function (sprite, duration) {

          var 
            isToggle = sprite.cfg.type === 'toggle',
            isToggled = !!sprite.toggled,
            tarOpacity   = isToggle && isToggled ? 0.5 : 0.9,
            curOpacity   = isToggle && isToggled ? 0.9 : 0.5,

            pos     = sprite.cfg.position,
            mat     = sprite.cfg.material,
            current = {
              width:    pos.width, 
              height:   pos.height, 
              opacity:  isToggle ? curOpacity : mat.opacity,
            },
            target  = {
              width:    current.width  * 1.1, 
              height:   current.height * 1.1,
              opacity:  isToggle ? tarOpacity : mat.opacity,
            }
          ;

          return function () {

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Sinusoidal.Out)
              .to(target, duration)
              .onUpdate(function(d){
                sprite.scale.set( current.width, current.height, 1 );
                sprite.material.opacity = current.opacity;
              })
              .start()
            ;

          };

        },
        leave: function (sprite, duration) {

          var 
            isToggle = sprite.cfg.type === 'toggle',
            isToggled = !!sprite.toggled,
            curOpacity   = isToggle && isToggled ? 0.5 : 0.9,
            tarOpacity   = isToggle && isToggled ? 0.9 : 0.5,
            pos = sprite.cfg.position,
            mat = sprite.cfg.material,
            current = {
              width:    pos.width  * 1.1, 
              height:   pos.height * 1.1, 
              opacity:  isToggle ? curOpacity : sprite.material.opacity
            },
            target  = {
              width:    pos.width, 
              height:   pos.height,
              opacity:  isToggle ? tarOpacity : mat.opacity,
            }
          ;

          return function () {

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Sinusoidal.Out)
              .to(target, duration)
              .onUpdate(function(d){
                sprite.scale.set( current.width, current.height, 1 );
                sprite.material.opacity = current.opacity;
              })
              .start()
            ;

          };

        },
      },

      datetime: {

        add: function (val, what, duration) {

          var 
            current = {now: SIM.time.model.unix() * 1000},
            target  = {now: current.now + 24 * 60 * 60 * 1000};

          return function () {

            // TWEEN.removeAll();

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Quadratic.Out)
              .to(target, duration)
              .onUpdate(function(d){
                SIM.setSimTime(moment(current.now))
                // console.log(d);
              })
              .start()
            ;

          };


        },

      },

      scaleGLobe: function(scale, duration) {

        var 
          current = SCN.scene.scale,
          target  = {x: scale, y: scale, z: scale};

        return function () {

          // TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .to(target, duration)
            .onUpdate(function(d){
              SCN.scene.scale.copy(current);
            })
            .start()
          ;

        };

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

          // TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 500)
            .onUpdate(function(d){
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
            })
            .onComplete(function(d){
              IFC.updatePointer();
            })
            .start()
          ;

        };


      },

      cam2vector: function (vector, distance){

        // https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object

        var aspect = window.innnerWidth / window.innerHeight;
        var fov    = SCN.camera.fov * ( Math.PI / 180 ); 

        distance = Math.abs( RADIUS + RADIUS / 2 / Math.sin( fov / 2 ) );  // 45% height

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
          },

        end;

        // handle moving over NUll Meridian
        if (target.theta - current.theta > Math.PI) {
          target.theta += 2 * Math.PI;
        }

        return function () {

          // TWEEN.removeAll();

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

}());


/*

sphericalPosition = new THREE.Spherical().setFromVector3(vector3);
sphericalPosition.theta += model.ugrd10.linearXY(0, lat, lon) * factor; // east-direction
sphericalPosition.phi   += model.vgrd10.linearXY(0, lat, lon) * factor; // north-direction
vector3 = vector3.setFromSpherical(sphericalPosition).clone();



*/