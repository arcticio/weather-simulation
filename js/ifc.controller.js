
'use strict'

IFC.Controller = (function () {

  var 
    self, 
    interval, cam, ele, home, 
    cfg      = {},
    enabled  = false,
    EPS      = 0.0000001,
    spcl     = new THREE.Spherical(),
    veloX    = 0,
    veloY    = 0,
    veloZ    = 0,
    keys     = { down: false, key: ''},
    mouse    = { down: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } },
    touch    = { down: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } },
    swipe    = { down: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } },
    defaults = {

      minDistance:  1.2,
      maxDistance:  8.0,

      onwheel:     () => {},
      ondrag:      () => {},
      onkey:       () => {},

      keys:        ['t', 'z', 'u', 'i', 'o', 'p'],
      lookAt:      new THREE.Vector3(0, 0, 0),

      dampX:       0.94,
      dampY:       0.94,
      dampZ:       0.90,

      keyXimpulse: 0.05,
      keyYimpulse: 0.05,
      keyZimpulse: 0.5,

      wheelYimpulse: 0.5,
      wheelXimpulse: 0.5,

      moveXimpulse:  0.004,
      moveYimpulse:  0.004,

      keyInterval: 100,

      keyactions: {
        'y': () => self.stop(),
        'x': () => self.reset(),
        'a': (ix, iy, iz) => self.impulse( -ix,   0,   0),   // X, rotate left  negative
        'd': (ix, iy, iz) => self.impulse(  ix,   0,   0),   // X, rotate right positive
        'w': (ix, iy, iz) => self.impulse(   0, -iy,   0),   // Y, rotate up    negative, inverted
        's': (ix, iy, iz) => self.impulse(   0,  iy,   0),   // Y, rotate down  positive, inverted
        'e': (ix, iy, iz) => self.impulse(   0,   0,  iz),   // Z, zoom   out   positive
        'q': (ix, iy, iz) => self.impulse(   0,   0, -iz),   // Z, zoom   in    positive
      }

    },

  end;

  function sgn (num) { 
    return (
      ~~num === 0 ? 0 :
        num >   0 ? 1 :
          -1
    );
  }

  function eat (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  function impScale (x, min, max) {
    var val= (max-min)*(x-cfg.minDistance)/(cfg.maxDistance-cfg.minDistance)+min;
    return val < min ? min : val > max ? max : val;
  }

  return self = {

    config: cfg,

    init: function (camera, domElement, config) {

      cam = camera;
      ele = domElement;
      
      Object.assign(cfg, defaults, config);

      spcl.setFromVector3(cam.position);

      home = cam.position.clone();

      return self;

    },
    
    enable: function  () {enabled = true;},
    disable: function () {enabled = false;},
    toggle: function  () {enabled = !enabled;},

    reset: function () {
      self.stop();
      cam.position.copy(home);
    },
    info: function () {
      return {
        veloX,
        veloY,
        veloZ,
      }
    },
    stop: function () {
      veloX = 0;
      veloY = 0;
      veloZ = 0;
    },
    impulse: function (x, y, z) {
      veloX += x;
      veloY += y;
      veloZ += z;
    },
    step: function (frame, deltatime) {

      var scalar, distance = cam.position.length();

      if (enabled) {

        veloX = Math.abs(veloX) > EPS ? veloX * cfg.dampX : 0;  // right/left
        veloY = Math.abs(veloY) > EPS ? veloY * cfg.dampY : 0;  // up/down
        veloZ = Math.abs(veloZ) > EPS ? veloZ * cfg.dampZ : 0;  // zoom

        if (veloZ) {

          if (distance < cfg.minDistance) {
            cam.position.setLength(cfg.minDistance);
            veloZ = 0;

          } else if (distance > cfg.maxDistance) {
            cam.position.setLength(cfg.maxDistance);
            veloZ = 0;

          } else if (distance >= cfg.minDistance && veloZ > 0  || distance <= cfg.maxDistance && veloZ < 0){
            scalar =  1 + ( veloZ * deltatime / distance );
            cam.position.multiplyScalar(scalar);
          }

        }

        if (veloX || veloY) {
          spcl.radius = cam.position.length();
          spcl.theta += veloX * deltatime;          
          spcl.phi   += veloY * deltatime;
          cam.position.setFromSpherical(spcl);

        }

        if (veloX || veloY || veloZ){IFC.updateUrl();}

        cam.lookAt(cfg.lookAt);

      }

    },
    activate: function () {

      H.each([

        [ele,       'mousedown'],
        [ele,       'mouseup'],
        [ele,       'mousemove'],
        [ele,       'mouseleave'],
        [ele,       'wheel'],
        [ele,       'touchstart'],
        [ele,       'touchmove'],
        [ele,       'touchend'],
        [ele,       'contextmenu'],
        [document,  'keydown'],
        [document,  'keyup'],
        [window,    'orientationchange'],
        [window,    'resize'],
      
      ], function (_, e) { 

        e[0].addEventListener(e[1], self.events[e[1]], false) 

      });

    },

    events: {
      contextmenu:  function (event) {return eat(event)},
      mousedown:    function (event) {

        if (enabled) {
          mouse.down.x = event.pageX;
          mouse.down.y = event.pageY;
          mouse.last.x = event.pageX;
          mouse.last.y = event.pageY;
        }

      },
      mouseup:      function (event) {

        mouse.down.x = NaN;
        mouse.down.y = NaN;
        mouse.last.x = NaN;
        mouse.last.y = NaN;

      },
      mouseleave:      function (event) {
        self.events.mouseup(event);
      },
      mousemove:    function (event) {

        var 
          deltaX, deltaY, 
          distance  = cam.position.length(),
          impFactor = impScale(distance, 1, cfg.maxDistance - cfg.minDistance)
        ;

        if ( !isNaN(mouse.down.x) ) {

          deltaX = (mouse.last.x - event.pageX) * cfg.moveXimpulse * impFactor;
          deltaY = (mouse.last.y - event.pageY) * cfg.moveYimpulse * impFactor;

          if (IFC.mouse.overGlobe) {
            self.impulse(deltaX, deltaY, 0);

          } else {
            cfg.ondrag(deltaX, deltaY);

          }

          mouse.last.x = event.pageX;
          mouse.last.y = event.pageY;

          return eat(event);

        }

      },
      wheel:        function (event) {

        var 
          deltaX = 0, deltaY = 0, deltaZ = 0,
          distance  = cam.position.length(),
          impFactor = impScale(distance, 0.2, cfg.maxDistance - cfg.minDistance)
        ;

        if (enabled) {

          switch ( event.deltaMode ) {

            case 2: // Zoom in pages
              debugger;
              deltaX = event.deltaX * 0.025;
              deltaZ = event.deltaY * 0.025;  // y => z
              break;

            case 1: // Zoom in lines, Firefox
              deltaX = event.deltaX * 0.2;
              deltaZ = event.deltaY * 0.4 * impFactor;
              break;

            default: // undefined, 0, assume pixels, Chrome
              deltaX = event.deltaX * 0.01;
              deltaZ = event.deltaY * 0.02 * impFactor;  
              break;

          }

          if (IFC.mouse.overGlobe){
            self.impulse(deltaX, deltaY, deltaZ);

          } else {
            cfg.onwheel(deltaX, deltaY, deltaZ);

          }
          
          return eat(event);

        }

      },
      touchstart:   function (event) {

        if (enabled) {

          switch ( event.touches.length ) {

            case 0: 
              console.log('WTF');
            break;

            case 1: 
              touch.down.x = event.touches[ 0 ].pageX;
              touch.down.y = event.touches[ 0 ].pageY;
              touch.last.x = touch.down.x;
              touch.last.y = touch.down.y;
            break;

            case 2: 
              swipe.down.x = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
              swipe.down.y = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
              swipe.last.x = swipe.down.x;
              swipe.last.y = swipe.down.y;
            break;

            case 3: 
            break;


          }

        }

      },
      touchmove:  function (event) {

        var 
          deltaX, deltaY, 
          distance  = cam.position.length(),
          impFactor = impScale(distance, 1, cfg.maxDistance - cfg.minDistance)
        ;

        switch ( event.touches.length ) {

          case 0: 
            console.log('WTF');
          break;

          case 1: 
            deltaX = (touch.last.x - event.touches[0].pageX) * cfg.moveXimpulse * impFactor;
            deltaY = (touch.last.y - event.touches[0].pageY) * cfg.moveYimpulse * impFactor;

            if (IFC.mouse.overGlobe || true ) {
              self.impulse(deltaX, deltaY, 0);

            } else {
              cfg.ondrag(deltaX, deltaY);

            }

            touch.last.x = event.touches[0].pageX;
            touch.last.y = event.touches[0].pageY;

            return eat(event);

          break;

          case 2: 
            swipe.down.x = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            swipe.down.y = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            swipe.last.x = swipe.down.x;
            swipe.last.y = swipe.down.y;
          break;

          case 3: 
          break;


        }

        // if ( !isNaN(mouse.down.x) ) {






      },
      touchend:   function (event) {

        touch.down.x = NaN;
        touch.down.y = NaN;
        swipe.down.x = NaN;
        swipe.down.y = NaN;

      },
      keydown:    function (event) {

        var 
          distance  = cam.position.length(),
          impFactor = impScale(distance, 1, cfg.maxDistance - cfg.minDistance),
          xImp      = cfg.keyXimpulse * impFactor,
          yImp      = cfg.keyYimpulse * impFactor,
          zImp      = cfg.keyZimpulse * impFactor
        ;

        // console.log('down', keys, event.repeat);

        // if (!keys.down || event === undefined) {

          // console.log('action', keys);

          keys.down = true;
          keys.key  = event ? event.key : keys.key;

          if (cfg.keyactions[keys.key]) {
            cfg.keyactions[keys.key](xImp, yImp, zImp);          
            return eat(event);
          
          } else if (cfg.keys.indexOf(keys.key) !== -1) {
            cfg.onkey(keys.key);
            return eat(event);

          }

        // } else {
          // clearInterval(interval);
          // if (keys.down){debugger}
          // console.log('int', keys, event);
          // interval = setInterval(function () {
          //   self.events.keydown();
          // }, 500); //cfg.keyInterval);

        // }

      },
      keyup:      function (event) {
        // console.log('up', keys);
        keys.down = false;
        keys.key = '';
        // clearInterval(interval);
      },

    }

  };

}());



/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga  / http://lantiga.github.io
 */

THREE.TrackballControls = function ( object, domElement ) {

  var _this = this;
  var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

  this.object = object;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  // API

  this.enabled = true;

  this.screen = { left: 0, top: 0, width: 0, height: 0 };

  this.rotateSpeed = 1.0;
  this.zoomSpeed = 1.2;
  this.panSpeed = 0.3;

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;

  this.staticMoving = false;
  this.dynamicDampingFactorZoom = 0.2;
  this.dynamicDampingFactorRotate = 0.2;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

  // internals

  this.target = new THREE.Vector3();

  var EPS = 0.000001;

  var lastPosition = new THREE.Vector3();

  var _state = STATE.NONE,
  _prevState = STATE.NONE,

  _eye = new THREE.Vector3(),

  _movePrev = new THREE.Vector2(),
  _moveCurr = new THREE.Vector2(),

  _lastAxis = new THREE.Vector3(),
  _lastAngle = 0,

  _zoomStart = new THREE.Vector2(),
  _zoomEnd = new THREE.Vector2(),

  _touchZoomDistanceStart = 0,
  _touchZoomDistanceEnd = 0,

  _panStart = new THREE.Vector2(),
  _panEnd = new THREE.Vector2();

  // for reset

  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.up0 = this.object.up.clone();

  // events

  var changeEvent = { type: 'change' };
  var startEvent = { type: 'start' };
  var endEvent = { type: 'end' };

  function latCamera () {

    var 
      pos = object.position,
      radius = pos.length(),
      lat = 90 - (Math.acos(pos.y / radius))  * 180 / Math.PI;

    return lat;

  }

  function clampScale (x, xMin, xMax, min, max) {
    var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
    return val < min ? min : val > max ? max : val;
  }
   // scale input relative to distance
  function impScale (x, min, max) {
    var val= (max-min)*(x-cfg.minDistance)/(cfg.maxDistance-cfg.minDistance)+min;
    return val < min ? min : val > max ? max : val;
  }


  // methods

  this.handleResize = function () {

    if ( this.domElement === document ) {

      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;

    } else {

      var box = this.domElement.getBoundingClientRect();
      // adjustments come from similar code in the jquery offset() function
      var d = this.domElement.ownerDocument.documentElement;
      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
      this.screen.top = box.top + window.pageYOffset - d.clientTop;
      this.screen.width = box.width;
      this.screen.height = box.height;

    }

  };

  this.handleEvent = function ( event ) {

    if ( typeof this[ event.type ] == 'function' ) {

      this[ event.type ]( event );

    }

  };

  var getMouseOnScreen = ( function () {

    var vector = new THREE.Vector2();

    return function getMouseOnScreen( pageX, pageY ) {

      vector.set(
        ( pageX - _this.screen.left ) / _this.screen.width,
        ( pageY - _this.screen.top ) / _this.screen.height
      );

      return vector;

    };

  }() );

  var getMouseOnCircle = ( function () {

    var vector = new THREE.Vector2();

    return function getMouseOnCircle( pageX, pageY ) {

      vector.set(
        ( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
        ( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
      );

      return vector;

    };

  }() );

  this.rotateCamera = ( function() {

    var 
      maxAngle, angle, 
      axis              = new THREE.Vector3(),
      quaternion        = new THREE.Quaternion(),
      eyeDirection      = new THREE.Vector3(),
      objectUpDirection = new THREE.Vector3(),
      moveDirection     = new THREE.Vector3(),
      objectSidewaysDirection = new THREE.Vector3();

      _this.anglemax = 0;

    return function rotateCamera() {

      var lat = latCamera(),
        distance = this.object.position.length();

      // noiv: rotate via horizontal wheeling 
      _moveCurr.x += (_zoomEnd.x - _zoomStart.x) * -2; 

      moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );

      angle = moveDirection.length();

      _this.anglemax = Math.max(_this.anglemax, angle);
      if (isNaN(angle)){
        debugger;
      }

      // speed limit
      maxAngle = this.maxAngle * impScale(distance, 0.1, 0.6)
      angle = Math.min(angle, maxAngle);

      // acc limit
      angle = Math.min(angle, _lastAngle + this.maxAcceleration);

      // if (lat > 80 || lat < -80 ){

      //  angle /= 2;

      //  if (lat > 88.0 || lat < -88.0 ){
      //    angle /= 10 ;
      //    objectUpDirection.setY(0);
      //  }

      // }

      if ( angle ) {

        _eye.copy( _this.object.position ).sub( _this.target );

        eyeDirection.copy( _eye ).normalize();
        objectUpDirection.copy( _this.object.up ).normalize();
        objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

        objectUpDirection.setLength( _moveCurr.y - _movePrev.y ); // noiv: needed
        objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

        moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

        axis.crossVectors( moveDirection, _eye ).normalize();

        angle *= _this.rotateSpeed;
        quaternion.setFromAxisAngle( axis, angle );

        _eye.applyQuaternion( quaternion );
        _this.object.up.applyQuaternion( quaternion );  // noiv : hmmm

        _lastAxis.copy( axis );
        _lastAngle = angle;

      } else if ( ! _this.staticMoving && _lastAngle ) {

        _lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactorRotate );
        _eye.copy( _this.object.position ).sub( _this.target );
        quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
        _eye.applyQuaternion( quaternion );
        _this.object.up.applyQuaternion( quaternion );

      }

      _zoomStart.x += ( _zoomEnd.x - _zoomStart.x ) * this.dynamicDampingFactorZoom; // noiv

      _movePrev.copy( _moveCurr );

    };

  }() );


  this.zoomCamera = function () {

    var factor;

    if ( _state === STATE.TOUCH_ZOOM_PAN ) {

      factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
      _touchZoomDistanceStart = _touchZoomDistanceEnd;
      _eye.multiplyScalar( factor );

    } else {

      factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

      if ( factor !== 1.0 && factor > 0.0 ) {

        _eye.multiplyScalar( factor );

      }

      if ( _this.staticMoving ) {

        _zoomStart.copy( _zoomEnd );

      } else {

        _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactorZoom;

      }

    }

  };

  // this.panCamera = ( function() {

    //   var mouseChange = new THREE.Vector2(),
    //     objectUp = new THREE.Vector3(),
    //     pan = new THREE.Vector3();

    //   return function panCamera() {

    //     mouseChange.copy( _panEnd ).sub( _panStart );

    //     if ( mouseChange.lengthSq() ) {

    //       mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

    //       pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
    //       pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

    //       _this.object.position.add( pan );
    //       _this.target.add( pan ); // noiv: keeps looking at center, great for better close ups.

    //       if ( _this.staticMoving ) {

    //         _panStart.copy( _panEnd );

    //       } else {

    //         _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactorPan ) );

    //       }

    //     }

    //   };

    // }() );

  this.checkDistances = function () {

    if ( ! _this.noZoom || ! _this.noPan ) {

      if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
        _zoomStart.copy( _zoomEnd );

      }

      if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
        _zoomStart.copy( _zoomEnd );

      }

    }

  };

  this.update = function () {


    _this.object.up.copy( _this.up0 ); // noiv: preserves up nicely


    _eye.subVectors( _this.object.position, _this.target );


    if ( ! _this.noRotate ) {

      _this.rotateCamera();

    }

    if ( ! _this.noZoom ) {

      _this.zoomCamera();

    }

    if ( ! _this.noPan ) {

      // _this.panCamera();

    }

    _this.object.position.addVectors( _this.target, _eye );

    _this.checkDistances();

    _this.object.lookAt( _this.target );

    if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

      // _this.dispatchEvent( changeEvent );

      lastPosition.copy( _this.object.position );

    }


  };

  this.reset = function () {

    _state = STATE.NONE;
    _prevState = STATE.NONE;

    _this.target.copy( _this.target0 );
    _this.object.position.copy( _this.position0 );
    _this.object.up.copy( _this.up0 );

    _eye.subVectors( _this.object.position, _this.target );

    _this.object.lookAt( _this.target );

    _this.dispatchEvent( changeEvent );

    lastPosition.copy( _this.object.position );

  };

  // listeners

  function keydown( event ) {

    if ( _this.enabled === false ) return;

    window.removeEventListener( 'keydown', keydown );

    _prevState = _state;

    if ( _state !== STATE.NONE ) {

      return;

    } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && ! _this.noRotate ) {

      _state = STATE.ROTATE;

    } else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && ! _this.noZoom ) {

      _state = STATE.ZOOM;

    } else if ( event.keyCode === _this.keys[ STATE.PAN ] && ! _this.noPan ) {

      _state = STATE.PAN;

    }

  }

  function keyup( event ) {

    if ( _this.enabled === false ) return;

    _state = _prevState;

    window.addEventListener( 'keydown', keydown, false );

  }

  function mousedown( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    if ( _state === STATE.NONE ) {

      _state = event.button;

    }

    if ( _state === STATE.ROTATE && ! _this.noRotate ) {

      _moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
      _movePrev.copy( _moveCurr );

      _zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
      _zoomEnd.copy( _zoomStart ); // noiv 

    } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

      _zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
      _zoomEnd.copy( _zoomStart );

    } else if ( _state === STATE.PAN && ! _this.noPan ) {

      _panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
      _panEnd.copy( _panStart );

    }

    document.addEventListener( 'mousemove', mousemove, false );
    document.addEventListener( 'mouseup', mouseup, false );

    _this.dispatchEvent( startEvent );

  }

  function mousemove( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    if ( _state === STATE.ROTATE && ! _this.noRotate ) {

      _movePrev.copy( _moveCurr );
      _moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

    } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

      _zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

    } else if ( _state === STATE.PAN && ! _this.noPan ) {

      _panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

    }

  }

  function mouseup( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    _state = STATE.NONE;

    document.removeEventListener( 'mousemove', mousemove );
    document.removeEventListener( 'mouseup', mouseup );
    _this.dispatchEvent( endEvent );

  }

  function mousewheel( event ) {

    // https://developer.mozilla.org/en-US/docs/Web/Events/wheel

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    switch ( event.deltaMode ) {

      case 2:
        // Zoom in pages
        _zoomStart.y -= event.deltaY * 0.025;
        if (IFC.mouse.overGlobe) {_zoomStart.x -= event.deltaX * 0.025;} // new
        break;

      case 1:
        // Zoom in lines
        _zoomStart.y -= event.deltaY * 0.01;
        if (IFC.mouse.overGlobe) {_zoomStart.x -= event.deltaX * 0.01;}
        break;

      default:
        // undefined, 0, assume pixels
        _zoomStart.y -= event.deltaY * 0.00025;
        if (IFC.mouse.overGlobe) {_zoomStart.x -= event.deltaX * 0.00025;}
        break;

    }

    _this.dispatchEvent( startEvent );
    _this.dispatchEvent( endEvent );

  }

  function touchstart( event ) {

    if ( _this.enabled === false ) return;

    switch ( event.touches.length ) {

      case 1:
        _state = STATE.TOUCH_ROTATE;
        _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        _movePrev.copy( _moveCurr );
        break;

      default: // 2 or more
        _state = STATE.TOUCH_ZOOM_PAN;
        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

        var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
        var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
        _panStart.copy( getMouseOnScreen( x, y ) );
        _panEnd.copy( _panStart );
        break;

    }

    _this.dispatchEvent( startEvent );

  }

  function touchmove( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    switch ( event.touches.length ) {

      case 1:
        _movePrev.copy( _moveCurr );
        _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        break;

      default: // 2 or more
        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

        var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
        var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
        _panEnd.copy( getMouseOnScreen( x, y ) );
        break;

    }

  }

  function touchend( event ) {

    if ( _this.enabled === false ) return;

    switch ( event.touches.length ) {

      case 0:
        _state = STATE.NONE;
        break;

      case 1:
        _state = STATE.TOUCH_ROTATE;
        _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        _movePrev.copy( _moveCurr );
        break;

    }

    _this.dispatchEvent( endEvent );

  }

  function contextmenu( event ) {

    event.preventDefault();

  }

  this.dispose = function() {

    this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
    this.domElement.removeEventListener( 'mousedown', mousedown, false );
    this.domElement.removeEventListener( 'wheel', mousewheel, false );

    this.domElement.removeEventListener( 'touchstart', touchstart, false );
    this.domElement.removeEventListener( 'touchend', touchend, false );
    this.domElement.removeEventListener( 'touchmove', touchmove, false );

    document.removeEventListener( 'mousemove', mousemove, false );
    document.removeEventListener( 'mouseup', mouseup, false );

    window.removeEventListener( 'keydown', keydown, false );
    window.removeEventListener( 'keyup', keyup, false );

  };

  this.domElement.addEventListener( 'contextmenu', contextmenu, false );
  this.domElement.addEventListener( 'mousedown', mousedown, false );
  this.domElement.addEventListener( 'wheel', mousewheel, false );

  this.domElement.addEventListener( 'touchstart', touchstart, false );
  this.domElement.addEventListener( 'touchend', touchend, false );
  this.domElement.addEventListener( 'touchmove', touchmove, false );

  window.addEventListener( 'keydown', keydown, false );
  window.addEventListener( 'keyup', keyup, false );

  this.handleResize();

  // force an update at start
  this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;
