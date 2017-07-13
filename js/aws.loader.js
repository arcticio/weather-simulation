
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
  
    sequence: function () { return [

        [ TIM.step, ['LDR.sequence', 'started'] ],   

        [ CFG.Preset.init ],
        [ IFC.initGUI ],

        [ CFG.Manager.probeDevice ],
        [ CFG.Manager.probeFullscreen ],
        // [ CFG.Manager.lockOrientation, [ 'portrait-primary' ] ], // no edge
        [ SCN.probeDevice ],

      'lift off!',
        // [ SCN.info ],   
        [ RES.init ],   
        [ ANI.init ], 
        [ SIM.init ], 
        [ SCN.init ], 
        [ SIM.setSimTime ], 

      'stage 1',
        self.loadImages,

      'stage 2',
        self.loadAssets,

      'stage 3',
        self.loadObservations,

      'reaching orbit',
        [ IFC.init ], 
        [ SIM.updateSun ], 

      'uploading to GPU',
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

      // generate tasks by reading items from sequence
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

      var sequence = [], assets = CFG.Manager.assets;


      H.each(CFG.Assets, (name, config) => {

        var fn;

        if (config.type !== 'simulation'){

          config.name = name;

          // if (config.visible){
          if (H.contains(assets, config.id) || config.essential){

            fn = function (callback) {
              self.message('', name);
              setTimeout(function () {
                SCN.Tools.loader[config.type](name, config, callback);
              }, delay);
            };

            sequence.push([fn, 'callback']);

          } else {
            SCN.assets[name] = config;

          }
        }

      });

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

        if (config.type === 'simulation'){

          config.name = name;

          if (H.contains(assets, config.id) || config.essential){

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