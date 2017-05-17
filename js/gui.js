
// dat.gui
var gui = new dat.GUI();

var guiFolders = {};

H.each(CFG['gui.dat'], (folder, options) => {

  var defs = {};

  // root params
  if (!options.isFolder) {
    defs[folder] = options;
    gui.add(defs, folder, options);

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

      if (value.val && value.choose) {

        guiFolders[folder].add(defs, option, value.choose).onChange(function (value) {
          console.log("change", folder, value);
        });
      
      } else if (value.val) {

        if (value.step) {
          guiFolders[folder].add(defs, option, value.min, value.max).step(value.step).onChange(function (value) {
            console.log("change", folder, option, value);
          });

        } else {
          guiFolders[folder].add(defs, option, value.min, value.max).onChange(function (value) {
            console.log("change", folder, option, value);
          });

        }

      } else {

        if (option === 'color') {
          guiFolders[folder].addColor(defs, option, value).onChange(function (value) {
            console.log("change", folder, option, value);
          });

        } else if (typeof value === 'function') {
          guiFolders[folder].add(defs, option).onChange(function () {
            console.log("change", folder, option, 'click');
          });

        } else {
          guiFolders[folder].add(defs, option, value).onChange(function (value) {
            console.log("change", folder, option, value);
          });

        }

      }

    });

  }

});
