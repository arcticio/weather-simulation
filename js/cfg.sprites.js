
'use strict'

CFG.Sprites = {

  performance: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    back:     document.createElement('CANVAS'),
    position: {
      bottom:   18,
      left:     18,
      width:    128,
      height:   64,
    },
    material: {
      opacity: 0.9,
      image: 'hud/performance.png'
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },

  time: {
    visible:  true,
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    position: {
      top:      18,
      center:   'x',
      width:    256,
      height:   64,
    },
    material: {
      opacity: 0.9,
      image: 'hud/performance.png'
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },


  // SPACETIME

  spacetime: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    toggled:  false,
    position: {
      top:     14,
      right:   18,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/space.png'
    },
    onclick: (sprite) => {
      IFC.toggleSpaceTime();
      sprite.toggled = !sprite.toggled;
      console.log('sprite.click', sprite.name);
    },
  },


  // MENU
  
  hamburger: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    toggled:  false,
    position: {
      top:     14,
      left:    18,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/hamburger.png'
    },
    onclick: (sprite) => {
      IFC.Hud.toggleMenu();
      sprite.toggled = !sprite.toggled;
      // console.log('sprite.click', sprite.name);
    },
  },


  // horizontal 

  fullscreen: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:     74,
      left:    78,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/fullscreen.png'
    },
    onclick: (sprite) => {
      screenfull.enabled && screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
      sprite.toggled = !sprite.toggled;
      IFC.Hud.resize();
      // console.log('sprite.clicked', sprite.name);
    },
  },

  movie: {
    visible:  true,
    menu:     true,
    position: {
      top:     74,
      left:     138,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/movie.png'
    },
    onclick: (sprite) => {
      console.log('sprite.click', sprite.name);
    },
  },

  info: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:      74,
      left:    198,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/info.png'
    },
    onclick: (sprite) => {
      location.href = 'https://github.com/arcticio/weather-simulation';
    },
  },

  gear: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:      74,
      left:    258,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/gear.png'
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },


  // MENU, Layers vertical

  graticule: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:     134,
      left:     15,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/graticule.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.graticule);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },


  snow: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:     194,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/snow.png'
    },
    onclick: (sprite) => {
      // SCN.toggle(SCN.objects.snow);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  clouds: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:     254,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/clouds.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.clouds);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  snpp: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      top:     314,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/satellite.png'
    },
    onclick: (sprite) => {
      SCN.toggleBasemap('snpp');
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

};
