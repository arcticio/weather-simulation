var LDR = (function () {
  
  var
    self,
    delay    = 100,
    pretasks = [],
    $header  = $('.progress .header'),
    $info    = $('.progress .info'),
    $bar     = $('.progress .bar'),
    $meter   = $('.progress .meter'),
  end;

  return self = {
  
    sequence: function () {

      return [

        'lift off!',
          [ SCN.info ],   
          [ RES.init ],   
          [ ANI.init ], 
          [ SIM.init ], 
          [ SCN.init ], 

        'stage 1',
          self.loadImages,

        'stage 2',
          self.loadAssets,

        'stage 3',
          self.loadObservations,

        'reaching orbit',
          [ IFC.init ], 
          [ IFC.activate ],

        'adjusting space time',
          [ SIM.setSimTime ], 

        'uploading to GPU',
          [ SCN.prerender, null, 'takes a while...' ], 

        'testing GPU',
          [ SCN.render ], 

        'get ready',
          [ IFC.show ],
          [ self.clear ],

      ];

    },

    clear: function () {
      $info.text('');
      $bar.text('');
      $meter.css({width: '0.1%'});
    },

    message: function (header, info) {
      header && $header.text(header);
      info   && $info.text(info);
    },

    prepare: function (sequence) {

      var push = pretasks.push.bind(pretasks);

      // generate tasks
      H.each(sequence, (_, item) => {

        var subsequence;

        // update header task
        if (typeof item === 'string') {

          pretasks.push(function (callback){
            self.message(item, '');
            callback();
          });


        // expand sub sequence
        } else if (typeof item === 'function'){

          // functions return a sequence
          subsequence = item();
          self.prepare(subsequence);


        // single function call
        } else if (Array.isArray(item)){

          pretasks.push(function (callback) {

            var 
              func    = item[0],                  // function
              params  = item[1] || undefined,     // array to apply, 'callback' for async, 
              info    = item[2] || 'processing';  // update info

            self.message('', info);

            if (params === 'callback') {
              func.apply(null, [callback]);

            } else {
              func.apply(null, [params]);
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

      // debugger;

      // add timout to tasks
      var 
        t0 = Date.now(),
        tasks = pretasks.map( (fn, idx) => {
          return function (callback) {
            
            // now user has all infos
            $bar.text( `${ idx + 1 }/${ tasks.length }` );
            $meter.css({width: ~~((idx + 1) / tasks.length * 100) + '%' });

            // delay next task
            setTimeout(() => fn(callback), delay);

          };
        }),
        finalize = function (err, results) {
          if (err) {throw err} else {
            TIM.step('LDR.executed', tasks.length, 'tasks', ((Date.now() - t0) / 1000).toFixed(1), 'secs');
            callback();
          }
        },
      end;

      async.series(tasks, finalize);

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

      var sequence = [];


      H.each(CFG.Objects, (name, config) => {

        var fn;

        if (config.type !== 'simulation'){

          config.name = name;

          if (config.visible){

            fn = function (callback) {
              self.message('', name);
              setTimeout(function () {
                SCN.loader[config.type](name, config, callback);
              }, 1);
            };

            sequence.push([fn, 'callback']);

          } else {
            SCN.objects[name] = config;

          }
        }

      });

      return sequence;

    },

    loadObservations: function () {

      var sequence = [];

      H.each(CFG.Objects, (name, config) => {

        var fn;

        if (config.type === 'simulation'){

          config.name = name;

          if (config.visible){

            fn = function (callback) {
              self.message('', name);
              setTimeout(function () {
                SCN.loader[config.type](name, config, callback);
              }, 1);
            };

            sequence.push([fn, 'callback']);

          } else {
            SCN.objects[name] = config;

          }
        }

      });

    },

  };

}() );