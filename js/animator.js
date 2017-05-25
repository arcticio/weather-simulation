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

      TWEEN.update();

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

      example: function () {

        // graphs => https://5013.es/toys/tween.audio/

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

    }


  };

}()).boot();