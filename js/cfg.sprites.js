
CFG.Sprites = {
  
  hamburger: {
    visible:  true,
    type:     'toggle',
    events:   ['click', 'mousemove', 'touchend'],
    toggled:  false,
    position: {
      top:     14,
      left:    18,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'images/hud/hamburger.png'
    },
    onclick: (sprite) => {
      IFC.Hud.toggle();
      console.log('sprite.click', sprite.name);
    },
  },

  fullscreen: {
    visible:  true,
    type:     'toggle',
    events:   ['click', 'mousemove', 'touchend'],
    toggled:  false,
    position: {
      top:     74,
      left:    18,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'images/hud/fullscreen.png'
    },
    onclick: (sprite) => {
      screenfull.enabled && screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
      IFC.Hud.resize();
      console.log('sprite.clicked', sprite.name);
    },
  },

  movie: {
    visible:  true,
    events:   ['click', 'mousemove', 'touchend'],
    position: {
      top:     134,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'images/hud/movie.png'
    },
    onclick: (sprite) => {
      console.log('sprite.click', sprite.name);
    },
  },

  graticule: {
    visible:  true,
    type:     'toggle',
    events:   ['click', 'mousemove', 'touchend'],
    toggled:  false,
    position: {
      top:     194,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'images/hud/graticule.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.graticule);
      console.log('sprite.clicked', sprite.name);
    },
  },

  info: {
    visible:  true,
    type:     'toggle',
    events:   ['click', 'mousemove', 'touchend'],
    toggled:  false,
    position: {
      top:     254,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'images/hud/info.png'
    },
    onclick: (sprite) => {
      location.href = 'https://github.com/arcticio/weather-simulation';
    },
  },

  performance: {
    visible:  true,
    type:     'toggle',
    events:   [],
    canvas:   document.createElement('CANVAS'),
    position: {
      bottom:   18,
      left:     18,
      width:    96,
      height:   48,
    },
    material: {
      opacity: 0.9,
      image: 'images/hud/performance.png'
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },

  time: {
    visible:  true,
    events:   [],
    canvas:   document.createElement('CANVAS'),
    position: {
      top:      18,
      center:   'x',
      width:    240,
      height:   120,
    },
    material: {
      opacity: 0.9,
      image: 'images/hud/performance.png'
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },

};
