try {

  (function () {

    var 
      fun = () => {},
      cvs = window.CanvasRenderingContext2D,
      wgl = (function () {
        var canvas = document.createElement( 'canvas' ); 
        return canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
      }()),
      ex0 = true, // testing
      ex1 = wgl.getExtension('OES_texture_float'),
      ex2 = wgl.getExtension('OES_texture_float_linear'),

      end;

    if (!(fun && cvs && wgl && ex0 && ex1 && ex2)) {
      throw("FAILURE"); 
    }

  }())


} catch (e) {console.error('APP NOT SUPPORTED', e)}

// https://github.com/smali-kazmi/detect-mobile-browser