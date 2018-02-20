
/* 

  https://sproutsocial.com/insights/social-media-image-sizes-guide/
  https://www.thoughtco.com/open-link-new-window-javascript-3468859
  https://developer.mozilla.org/en-US/docs/Web/API/Window/open

  Twitter: 512 * 564


*/


IFC.Sharer = (function () {

  var 
    self, dialog, renderer, camera, 
    refs, cvs, ctx,
    counter = 0,
    name = 'sharer'
  ;

  return self = {

    dialog,

    capture: function () {

      var 
        blob,
        amount = 60,
        geometry = IFC.geometry,
        ondone = function (obj) {
          if(!obj.error) {
            blob = H.base64toBlob(obj.image.slice(22), 'image/gif');
            // TODO: insert date here
            saveAs(blob, 'hypatia.ani.gif');
          }
        }

      SCN.capture(amount, function (blobs) {

        gifshot.createGIF({
          gifWidth:   geometry.width,
          gifHeight:  geometry.height,
          interval:   1/60,
          numFrames:  amount,
          images:     blobs.map(blob => {
            var img = new Image();
            img.src = blob;
            return img;
          })
        }, ondone);

      });

    },

    willFit: function () {
      return true;
    },

    close: function () {
      dialog.close();
    },

    share: function (service) {
      console.log('SHARE', service);
    },

    events: {
      load: function () {

        refs = dialog.connect(self);
        cvs  = refs.canvas;
        
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          canvas: refs.canvas,
        });

        renderer.setClearColor( 0x666666 );
        renderer.setSize( dialog.innerWidth, dialog.innerHeight - 56 );

        camera = new THREE.PerspectiveCamera(45, cvs.width / cvs.height, 0.1, 10),
        camera.position.copy(SCN.camera.position);
        camera.lookAt( SCN.scene.position );
        camera.name = 'camera';
        
        SCN.scene.add(camera);
        SCN.toggle(SCN.assets.background, false);

        renderer.render( SCN.scene, camera );

        SCN.scene.remove(camera);
        SCN.toggle(SCN.assets.background, true);

        console.log('renderer', renderer);

      }
    },

    open: function () {

      var 
        fits   = self.willFit(),
        width  = fits ? 600 : screen.width,
        height = fits ? 460 : screen.height, // buttons + canvas
        left   = screen.width  / 2 - width  / 2,
        top    = screen.height / 2 - height / 2,
        url    = '/sharer.html?' + counter++;
        opts   = `'menubar=no,scrollbars=no,location=no,status=no,resizable=yes,top=${top},left=${left},innerHeight=${height},innerWidth=${width}`
      ;

      if (!dialog || dialog.closed) {
        dialog = self.dialog = window.open('/sharer.html', name, opts);
        dialog.addEventListener('load', self.events.load, true);

      } else {
        dialog.focus();

      };

    },

    takeScreenShot: function(){

      // https://developer.mozilla.org/en/DOM/window.open

      var 
        frame = self.getFrame('image/png');
        opts  = 'menubar=no,scrollbars=no,location=no,status=no,resizable=yes,innerHeight=' + (f.height/2) + ',innerWidth=' + (f.width/2);
        win   = window.open(frame.url, 'screenshot', opts)
      ;

      win.focus();
      console.log('win.open', win, opts);

    },   

    getFrame :  function(mimetype){ 

      var 
        cvs    = SCN.renderer.domElement,
        width  = cvs.width,
        height = cvs.height
      ;

      return {
        width, 
        height,
        url: cvs.toDataURL(mimetype),
        num: SCN.frames, 
      }; 

    },

  };

}());
