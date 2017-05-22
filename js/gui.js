
// dat.gui
var 
  gui = new dat.GUI(),
  guiFolders = {};

  gui.closed = true;

// dat.GUI.toggleHide(); // total hide

H.each(CFG['gui.dat'], (folder, options) => {

  var defs = {}, fn;

  // root params
  if (!options.isFolder) {

    defs[folder] = options;

    if (typeof options === 'function'){
      gui.add(defs, folder).onChange(options);

    } else {
      gui.add(defs, folder, options).onChange(function (value) {
        SCENE.actions(folder, 'toggle', value);
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

    // prep actions

    H.each(options, (option, value) => {

      fn = SCENE.actions.bind(null, folder, option);

      if (value.val && value.choose) {
        guiFolders[folder].add(defs, option, value.choose).onChange(fn);
      
      } else if (value.val) {

        if (value.step) {
          guiFolders[folder].add(defs, option, value.min, value.max).step(value.step).onChange(fn);

        } else {
          guiFolders[folder].add(defs, option, value.min, value.max).onChange(fn);

        }

      } else {

        if (option === 'color') {
          guiFolders[folder].addColor(defs, option, value).onChange(fn);

        } else if (typeof value === 'function') {
          guiFolders[folder].add(defs, option).onChange(fn);

        } else {
          guiFolders[folder].add(defs, option, value).onChange(fn);

        }

      }

    });

  }

});


