
CFG.Preset = {

  // Loading:        '',
  // SimTime:        '',
  Render:         true,
  // Animate:        true,
  // Simulate:       true,

  Reload:         () => location.reload(),
  ResetCam:       () => SCN.reset.controller(),

  // Camera: {
  //   isFolder:     true,
  //   reset:        () => {},
  // },

  Ambient: { isFolder: true,
    toggle:       CFG.Objects.ambient.visible,
    intensity:    {val: CFG.Objects.ambient.intensity, min: 0, max: 1},
    color:        '#ffffff'
  },

  Spot: { isFolder: true,
    toggle:       CFG.Objects.spot.visible,
    angle:        {val: 0.26, min: 0, max: 0.5},
    intensity:    {val: CFG.Objects.spot.intensity, min: 0, max: 1},
    color:        '#ffffff'
  },

  Sun: { isFolder: true,
    toggle:       CFG.Objects.sun.visible,
    intensity:    {val: CFG.Objects.sun.intensity, min: 0, max: 1},
    skycolor:     CFG.Objects.sun.skycolor,
    grdcolor:     CFG.Objects.sun.grdcolor,
  },

  Atmosphere: { isFolder: true,
    toggle:       CFG.Objects.atmosphere.visible,
    intensity:    {val: CFG.Objects.atmosphere.intensity, min: 0, max: 1},
    color:        CFG.Objects.atmosphere.color,
  },

  Layers: { isFolder: true,
    'BACKGROUND': CFG.Objects.background.visible,
    'POPULATION': CFG.Objects.population.visible,
    'SNPP':       CFG.Objects.snpp.visible,
    'RTOPO2':     CFG.Objects.rtopo2.visible,
    'GMLC':       CFG.Objects.gmlc.visible,
    'DATA':       CFG.Objects.data.visible,
    'SST':        CFG.Objects.sst.visible,
    'SEAICE':     CFG.Objects.seaice.visible,
    'WIND':       CFG.Objects.wind.visible,
    'JETSTREAM':  CFG.Objects.jetstream.visible,
    'LAND':       CFG.Objects.land.visible,
    'RIVERS':     CFG.Objects.rivers.visible,
    'CLOUDS':     CFG.Objects.clouds.visible,
    'GRATICULE':  CFG.Objects.graticule.visible,
    'SECTOR':     CFG.Objects.sector.visible,
    // 'TEST':       CFG.Objects.test.visible,
  },

  DateTime : { isFolder:    true,
    choose:     {val: 3, min: 0, max: 365 * 24 -1, step: 1},
    'hour  +1': () => {},
    'hour  -1': () => {},
    'hour  +6': () => {},
    'hour  -6': () => {},
    'hour +24': () => {},
    'hour -24': () => {},
    'day  +30': () => {},
    'day  -30': () => {},
  },

  Extras: { isFolder:   true,
    Axes:       CFG.Objects.axes.visible,
    Rotate:     () => {},
  },

  // Simulation: { isFolder:   true,
  //   start:      () => {},
  //   stop:       () => {},
  //   pause:      () => {},
  // },

};