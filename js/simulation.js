'use strict';

var SIM = (function () {

  var 
    self,
    renderer,
    camera,

    frame,

    variables,

    stuff;


  return {
    boot: function () {
      return self = this;
    },
    init: function (data) {

      variables = data;

      TIM.step('SIM.init.out', variables);
      
    },
    activate: function () {
    },
    resize: function () {
    },
    render: function () {

    }
  };

}()).boot();