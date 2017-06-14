
CFG.Preset = {

  Loading:        '',
  SimTime:        '',
  Render:         true,
  Animate:        true,
  Simulate:       true,
  Reload:         () => location.reload(),
  Camera: {
    isFolder:     true,
    reset:        () => {},
  },

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

  Layers: { isFolder: true,
    'BACKGROUND': CFG.Objects.background.visible,
    'POPULATION': CFG.Objects.population.visible,
    'SNPP':       CFG.Objects.snpp.visible,
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
    // 'RANDOM':     CFG.Objects.randomizer.visible,
  },

  DateTime : { isFolder:    true,
    choose:     {val: 3, min: 0, max: 365 * 24, step: 1},
    hour1:      () => {},
    hourn1:     () => {},
    hour24:     () => {},
    hourn24:    () => {},
    day30:      () => {},
    dayn30:     () => {},
  },

  Extras: { isFolder:   true,
    Axes:       CFG.Objects.axes.visible,
    Rotate:     () => {},
    ZoomOut:    () => {},
  },

  Simulation: { isFolder:   true,
    start:      () => {},
    stop:       () => {},
    pause:      () => {},
  },

};