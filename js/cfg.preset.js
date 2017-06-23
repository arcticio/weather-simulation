
'use strict'

CFG.Preset = {

  init: function () {

    Object.assign(CFG.Preset, {

      Render:         true,
      // Animate:        true,
      // Simulate:       true,

      Reload:         () => location.reload(),
      ResetCam:       () => SCN.reset.controller(),

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
        opacity:      {val: CFG.Objects.atmosphere.opacity, min: 0, max: 1},
      },

      Assets: (function () {

        var layers = {isFolder: true};

        H.each(CFG.Objects, (name, config) => {
          if (config.id) {
            layers[name.toUpperCase()] = CFG.Objects[name].visible;
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

