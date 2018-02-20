
CFG.Preset = {

  init: function () {

    Object.assign(CFG.Preset, {

      Render:         true,

      Reload:         location.reload,
      ResetCam:       SCN.reset.controller,
      Debug:          CFG.Manager.download,

      Ambient: { isFolder: true,
        toggle:       true, // CFG.Assets.ambient.visible,
        intensity:    {val: CFG.Assets.ambient.intensity, min: 0, max: 1},
        color:        '#ffffff'
      },

      Spot: { isFolder: true,
        toggle:       true, // CFG.Assets.spot.visible,
        angle:        {val: 0.26, min: 0, max: 0.5},
        intensity:    {val: CFG.Assets.spot.intensity, min: 0, max: 1},
        color:        '#ffffff'
      },

      Sun: { isFolder: true,
        toggle:       true, // CFG.Assets.sun.visible,
        intensity:    {val: CFG.Assets.sun.intensity, min: 0, max: 1},
        skycolor:     CFG.Assets.sun.skycolor,
        grdcolor:     CFG.Assets.sun.grdcolor,
      },

      Atmosphere: { isFolder: true,
        toggle:       false, // CFG.Assets.atmosphere.visible,
        opacity:      {val: CFG.Assets.atmosphere.opacity, min: 0, max: 1},
      },

      Assets: (function () {

        var layers = {isFolder: true};

        H.each(CFG.Assets, (name, config) => {
          if (config.debuggable) {
            layers[name.toUpperCase()] = CFG.Assets[name].debuggable;
          }
        });

        return layers;

      }()),

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

      Animations: { isFolder:   true,
        Rotate:     () => {},
      },

    })
  
  }
};

