
'use strict'

CFG.Sprites = {

  // SPACETIME

  logo: {
    visible:  true,
    type:     'link',
    menu:     false,
    position: {
      zIndex:    5,
      bottom:   18,
      right:     4,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.9,
      image: 'arcticio.logo.512.png'
    },
    onclick: (sprite) => {
      $('#arcticio')[0].click();
      console.log('sprite.click', sprite.name);
    },
  },

  topbackdrop: {
    visible:  true,
    type:     'backdrop',
    hover:    false,
    menu:     false,
    position: {
      zIndex:       1,
      top:          0,
      width:        '100%',
      height:       72,
    },
    material: {
      color:  new THREE.Color(0x000000),
      opacity: 0.2,
    },
  },

  performance: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    back:     document.createElement('CANVAS'),
    position: {
      zIndex:    5,
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
    hover:    false,
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    position: {
      zIndex:    5,
      top:       4,
      center:   'x',
      width:    256,
      height:   64,
    },
    material: {
      opacity: 0.9,
      // image: 'hud/performance.png'
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
    canvas:   document.createElement('CANVAS'),
    position: {
      zIndex:    5,
      top:      14,
      left:     18,
      width:    48,
      height:   48,
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
      zIndex:    5,
      top:      14,
      right:    18,
      width:    48,
      height:   48,
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
      zIndex:    5,
      top:     80,
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
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:     5,
      top:       80,
      left:     138,
      width:     48,
      height:    48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/movie.png'
    },
    onclick: (sprite) => {
      IFC.Tools.takeScreenShot();
      console.log('sprite.click', sprite.name);
    },
  },

  info: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:      80,
      left:    198,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/info.png'
    },
    onclick: (sprite) => {
      // document.getElementById('#homelink').click();
      $('#homelink')[0].click();
    },
  },

  gear: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:      80,
      left:    258,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/gear.png'
    },
    onclick: (sprite) => {
      IFC.toggleGUI();
      console.log('sprite.clicked', sprite.name);
    },
  },


  // MENU, Layers vertical

  snpp: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     140,
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

  temperature: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     200,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/temperature.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.variables);
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
      zIndex:    5,
      top:     260,
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

  snow: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     320,
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

  seaice: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     380,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/seaice.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.seaice);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  sst: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     440,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/sst.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.sst);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  graticule: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     500,
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


};
