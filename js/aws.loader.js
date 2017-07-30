
var LDR = (function () {
  
  var
    self,
    delay    = 1,
    queue    = [],
    $header  = $('.progress .header'),
    $info    = $('.progress .info'),
    $bar     = $('.progress .bar'),
    $meter   = $('.progress .meter')
  ;

  return self = {

    goFullscreen: function () {
      screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
    },

    onload: function () {

      Orb.Time = Orb.Core.Time;
      Orb.Tool = Orb.Core.Tool;

      document.querySelectorAll('.progress .header')[0].innerHTML = 'main engine started';
      document.querySelectorAll('table .version')[0].innerHTML = VERSION;

    },
  
    sequence: function () { return [

        [ TIM.step, ['LDR.sequence', 'started'] ],   

        [ CFG.Preset.init ],
        [ IFC.initGUI ],

        [ CFG.Manager.probeDevice ],
        [ CFG.Manager.probeFullscreen ],
        // [ CFG.Manager.lockOrientation, [ 'portrait-primary' ] ], // no edge
        [ SCN.probeDevice ],

      'lift off!',
        [ RES.init ],   
        [ ANI.init ], 
        [ SIM.init ], 
        [ SCN.init ], 
        [ SIM.setSimTime ],    // prepares display time range and time
        [ SIM.Charts.init ],

      'stage 1',
        self.loadImages,

      'stage 2',
        self.loadAssets,

      'stage 3',
        self.loadObservations,

      'reaching orbit',
        [ IFC.init ], 
        [ SIM.updateSun ], 

      'uploading to reality rendering device',
        [ SCN.prerender, null, 'may take a while ...' ], 

      'recalibrating',
        [ SCN.render ], 

      'get ready',
        [ IFC.activate ],
        [ IFC.show ],
        [ self.clearInfo ],
        // [ navigator.vibrate.bind(navigator), [200] ], // needs https soon; no edge

      'have fun',

    ];},

    clearInfo: function () {
      $info.text('');
      $bar.text('');
      $meter.css({width: '0.1%'});
    },

    message: function (header, info) {
      header && $header.text(header);
      info   && $info.text(info);
    },

    parse: function (sequence) {

      // generates tasks by reading actions from sequence
      H.each(sequence, (_, item) => {

        var subsequence, func, params, info;

        // update header task
        if (typeof item === 'string') {

          queue.push(function (callback){
            self.message(item, '');
            callback();
          });


        // expand sub sequence
        } else if (typeof item === 'function'){

          // functions return a sequence
          subsequence = item();
          self.parse(subsequence);


        // single function call
        } else if (Array.isArray(item)){

          func    = item[0];                   // function
          params  = item[1] || [];             // array to apply, 'callback' for async, 
          info    = item[2] || 'processing';   // update info

          queue.push(function (callback) {
            self.message('', info);
            callback();
          });

          queue.push(function (callback) {

            if (params === 'callback') {
              func.apply(null, [callback]);

            } else {
              func.apply(null, params);
              callback();

            }

          });

        } else {
          debugger;
          console.log('WTF');

        }

      })

    },

    execute: function (callback) {

      var 
        t0 = Date.now(),
        tasks = queue.map( (fn, idx) => {

          return function (callback) {
            
            // setup gui for next tasks
            $bar.text( `${ idx + 1 }/${ tasks.length }` );
            $meter.css({width: ~~((idx + 1) / tasks.length * 100) + '%' });

            // delay next task
            setTimeout(() => fn(callback), delay);

          };

        }),
        onfinished = function (err /* , results */ ) {
          // console.log(results);
          if (err) {throw err} else {
            TIM.step('LDR.executed', tasks.length, 'tasks', ((Date.now() - t0) / 1000).toFixed(1), 'secs');
            callback();
          }
        };

      async.series(tasks, onfinished);

    },

    loadImages: function () {

      var urls = Object.keys(CFG.Textures).map( key => CFG.Textures[key] );

      function replaceTx (res) {
        H.each(CFG.Textures, (key, value) => {
          if (value === res.url) {
            CFG.Textures[key] = res.data;
          }
        });
      }

      return urls.map(url => {

        var fn = function (callback) {

          self.message(null, url.split('/').slice(-1)[0]);

          RES.load({type: 'texture', urls: [url], onFinish: (err, responses) => {
            responses.forEach(replaceTx);
            callback();
          }});

        }; 

        return [ fn, 'callback' ];

      });

    },

    loadAssets: function () {

      var 
        id, sequence = [],
        sorter = function (a, b) {
          return (CFG.Assets[a].radius || 0) - (CFG.Assets[b].radius || 0) ;
        }
      ;

      Object
        .keys(CFG.Assets)
        .filter( a => CFG.Assets[a].type !== 'simulation' )
        .filter( a => CFG.Assets[a].type !== 'simulation.parallel' )
        .sort(sorter)
        .forEach(name => {

          var action, config = CFG.Assets[name];

          // makes key a value
          config.name = name;

          // console.log('loadAssets', name);

          // test
          if ( CFG.Manager.activated[name] ) {

            action = function (callback) {

              self.message('', name);
              
              setTimeout(function () {
              
                if (config.type === 'basemaps') {
                  id = CFG.Manager.activated[name];
                  SCN.Tools.loader[config.type](id, name, config, callback);
              
                } else {
                  SCN.Tools.loader[config.type](name, config, callback);
              
                }

              }, delay);

            };

            sequence.push([action, 'callback']);

          } else {

            // just provide config to SCN
            SCN.assets[name] = config;

          }

        })
      ;

      return sequence;

    },

    loadObservations: function () {

      function registerResEvent () {
        RES.onload = function (url) {
          $info.text(url.split('/').slice(-1)[0]);
        }
      }

      function unregisterResEvent () {
        RES.onload = null;
      }

      var 
        sequence = [ [registerResEvent] ],
        assets   = CFG.Manager.assets
      ;

      H.each(CFG.Assets, (name, config) => {

        var action;

        if (config.type === 'simulation' || config.type === 'simulation.parallel' ){

          config.name = name;

          // console.log('loadObservations', name);

          if (H.contains(assets, config.index) || config.essential){

            action = function (callback) {
              self.message('', config.title);
              setTimeout(function () {
                SCN.Tools.loader[config.type](name, config, callback);
              }, delay);
            };

            sequence.push([action, 'callback']);

          } else {
            SCN.assets[name] = config;

          }
        }

      });

      sequence.push([unregisterResEvent]);

      return sequence;

    },

  };

}() );
