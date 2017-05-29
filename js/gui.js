
(function () {

  // dat.gui
  var 
    gui = new dat.GUI({
      // parent: document.querySelectorAll('div.fullscreen')[0]
    }),

    guiFolders = {},

    controllers = {

    };

    gui.closed = true;

  // dat.GUI.toggleHide(); // total hide

  H.each(PRESET, (folder, options) => {

    var defs = {}, fn;

    // root params
    if (!options.isFolder) {

      defs[folder] = options;

      if (typeof options === 'function'){
        controllers[folder] = gui.add(defs, folder).onChange(options);

      } else if (typeof options === 'string') {
        controllers[folder] = gui.add(defs, folder, options).onChange(function (value) {
          SCN.actions(folder, 'update', value);
        });

      } else {
        controllers[folder] = gui.add(defs, folder, options).onChange(function (value) {
          SCN.actions(folder, 'toggle', value);
        });

      }


    } else {

      delete options.isFolder;

      // prep folders
      H.each(options, (option, value) => {
        if (option !== 'isFolder'){
          defs[option] = value.val ? value.val : value;
        }

      });

      guiFolders[folder] = gui.addFolder(folder);
      controllers[folder] = {};

      // prep actions

      H.each(options, (option, value) => {

        fn = SCN.actions.bind(null, folder, option);

        if (value.val && value.choose) {
          controllers[folder][option] = guiFolders[folder].add(defs, option, value.choose).onChange(fn);
        
        } else if (value.val) {

          if (value.step) {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value.min, value.max).step(value.step).onChange(fn);

          } else {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value.min, value.max).onChange(fn);

          }

        } else {

          if (H.endsWith(option, 'color')) {
            controllers[folder][option] = guiFolders[folder].addColor(defs, option, value).onChange(fn);

          } else if (typeof value === 'function') {
            controllers[folder][option] = guiFolders[folder].add(defs, option).onChange(fn);

          } else {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value).onChange(fn);

          }

        }

      });

    }

  });

  // this is rubbish
  window.GUIcontrollers = controllers;
  window.GUI = gui;

  controllers['Loading'].setValue('please wait a second...');

} ())
