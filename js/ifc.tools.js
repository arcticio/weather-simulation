
IFC.Tools = {

  eat: function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  },

  updateUrl: TOOLS.debounce(function () {

    // TODO: coords vector to Lat/Lon

    var 
      prec   = 6,
      time   = SIM.time.model.format('YYYY-MM-DD-HH-mm'),
      assets = SCN.scene.children
        .filter(  c => c.visible)
        .map(     c => CFG.Objects[c.name].id)
        .filter( id => !!id),
      hash   = CFG.assets2hash(assets),
      pos    = SCN.camera.position,
      coords = `${H.round(pos.x, prec)};${H.round(pos.y, prec)};${H.round(pos.z, prec)}`,
      path   = `/${hash}/${time}/${coords}`,
    end;

    // console.log('assets', assets);

    History.replaceState({}, CFG.Title, path);

  }, 120),

  takeScreenShot: function(){

    // https://developer.mozilla.org/en/DOM/window.open
    var f = this.getFrame('image/png');
    var opts = 'menubar=no,scrollbars=no,location=no,status=no,resizable=yes,innerHeight=' + (f.height/2) + ',innerWidth=' + (f.width/2);
    var win = window.open(f.url, 'screenshot', opts); 

    win.focus();
    console.log('win.open', win, opts);

  },   

  getFrame :  function(mimetype){ 

    var 
      cvs    = SCN.renderer.domElement,
      width  = cvs.width,
      height = cvs.height;

    return {
      width, 
      height,
      url: cvs.toDataURL(mimetype),
      num: SCN.frames, 
    }; 

  },

};