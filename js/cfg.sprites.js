
CFG.Sprites = {

  // SPACETIME

  logo: {
    visible:  true,
    type:     'link',
    menu:     false,
    position: {
      zIndex:    5,
      top:       0,
      left:      12,
      width:    64,
      height:   64,
    },
    material: {
      opacity: 0.9,
      image: 'logo.128.png'
    },
    onclick: (sprite) => {
      location.reload();
      // $('#arcticio')[0].click();
      console.log('sprite.click', sprite.name);
    },
  },

  reload: {
    visible:  false,
    type:     'toggle',
    menu:     false,
    position: {
      zIndex:    5,
      bottom:   18,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.7,
      image: 'hud/reload.png'
    },
    onclick: (sprite) => {
      location.reload();
      console.log('sprite.click', sprite.name);
    },
  },

  topbackdrop: {
    visible:  true,
    type:     'backdrop',
    hover:    false,
    menu:     false,
    position: {
      zIndex:       4.9,
      top:          0,
      width:        '100%',
      height:       72,
    },
    material: {
      image: 'hud/backdrop.png',
      // color:  new THREE.Color(0xe0a01f),
      opacity: 0.5,
    },
  },

  performance: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    back:     document.createElement('CANVAS'),
    position: {
      zIndex:     5,
      bottom:    18,
      right:     18,
      width:    128,
      height:    64,
    },
    material: {
      opacity: 0.9,
    },
    onclick: (sprite) => {
      sprite.widget.selectModus();
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
      opacity: 0.7,
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
      top:      80,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.6,
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
      top:      10,
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
    type:           'toggle',
    menu:           true,
    visible:        screenfull.enabled,
    toggled:        screenfull.isFullscreen,
    position: {
      zIndex:       5,
      top:          180,
      right:        18,
      width:        48,
      height:       48,
    },
    material: {
      opacity:      0.5,
      image:        'hud/fullscreen.png'
    },
    onclick: (sprite) => {
      screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
      IFC.Hud.toggleMenu();
      sprite.toggled = !sprite.toggled;
    },
  },

  movie: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:     5,
      top:       240,
      right:     18,
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
      top:     300,
      right:    18,
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
      top:     80,
      left:    18,
      width:   48,
      height:  48,
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

  mask: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     180,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/mask.png'
    },
    onclick: (sprite) => {
      SCN.toggleBasemap('mask');
      sprite.toggled = !sprite.toggled;
    },
  },

  gmlc: {
    title:    'Global Land Cover',
    visible:  CFG.Assets.gmlc.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:      180,
      left:     140,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/vegetation.png'
    },
    onclick: (sprite) => {
      SCN.toggleBasemap('gmlc');
      sprite.toggled = !sprite.toggled;
    },
  },

  snpp: {
    visible:  CFG.Assets.snpp.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     180,
      left:     80,
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
    },
  },

  tmp2m: {
    visible:  CFG.Assets.tmp2m.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     240,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/temperature.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.tmp2m);
      sprite.toggled = !sprite.toggled;
      // console.log('sprite.clicked', sprite.name);
    },
  },

  clouds: {
    visible:  CFG.Assets.tmp2m.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     300,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/clouds.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.clouds);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  pratesfc: {
    visible:  CFG.Assets.pratesfc.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     300,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/rain.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.pratesfc);
      sprite.toggled = !sprite.toggled;
    },
  },

  snow: {
    visible:  false,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     360,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/snow.png'
    },
    onclick: (sprite) => {
      // SCN.toggle(SCN.assets.snow);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  seaice: {
    visible:  CFG.Assets.seaice.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     360,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/seaice.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.seaice);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  sst: {
    visible:  CFG.Assets.sst.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     240,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/sst.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.sst);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  population: {
    visible:  CFG.Assets.population.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     420,
      left:     15,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/population.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.population);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  jetstream: {
    visible:  CFG.Assets.jetstream.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     420,
      left:     80,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/jetstream.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.jetstream);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  graticule: {
    visible:  CFG.Assets.graticule.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     480,
      left:     15,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/graticule.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.graticule);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  atmosphere: {
    visible:  CFG.Assets.atmosphere.toggable,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     480,
      left:     80,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/atmosphere.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.assets.atmosphere);
      sprite.toggled = !sprite.toggled;
    },
  },


};
