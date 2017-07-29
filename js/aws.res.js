
var RES = (function () {

  var 
    self, div,

    // $$ = document.querySelectorAll.bind(document),

    jobs       = [],
    counter    = 0,
    isDev      = true,
    concurrent = 2,

    // div = $$('.panel.info')[0],

    stats   = {
      queue:       0,   // jobs in queue
      requests:    0,   // active requests
      bytesLoaded: 0,   // from jobs in queue
      bytesTotal:  0,   // from jobs in queue
      jobsTotal:   0,   // historical
      percent:     0,   // done from jobs in queue
    }
  ;

  function format() {
    stats.percent = stats.requests ? (stats.bytesLoaded / stats.bytesTotal * 100).toFixed(1) : 'done';
    // return `R: ${stats.requests} | P: ${stats.percent}`;
    return JSON.stringify(stats) + '<br>';
  }

  function update (what, value)  {
    if (what !== undefined && value !== undefined){
      stats[what] += Number(value);
    }
    // div.innerHTML += format();
    // div.innerHTML = `Req: ${stats.requests} Per: ${stats.percent}`;

    // div.style.backgroundSize = ~~stats.percent + '%';

    // console.log(stats.requests, stats.bytesLoaded, stats.bytesTotal);

  }

  return self = {

    onload: null,

    init: function () {
    },
    activate: function (selector) {
      // div.innerHTML = 'R: 0, ETA: 0';
    },
    check: function () {

      var candidates = [];

      // clean queue
      candidates = jobs.filter( j => j.failed || j.finished);
      candidates.forEach( c => H.remove(jobs, c) );

      // select queueable jobs up to concurrent
      candidates = jobs.filter( j => !j.active && j.ready && !j.failed ).slice(0, concurrent);
      candidates.forEach( c => {
        if (c.options.type === 'texture' ){
          c.loadtexture()
        } else {
          c.execute()
        }
      });

      // prolog
      stats.queue = jobs.length;
      update();

    },

    add: function (config) {

      var job;

      counter   += 1;
      config.id  = counter;

      job = new self.Job(config);
      jobs.push(job);
      job.prepare();

      stats.jobsTotal += 1;
      self.check();

    },
    load: function (config) {

      var tasks = config.urls.map( url => {

        return function (callback) {
          self.add({
            url:      url, 
            type:     config.type || '', 
            onFinish: function (err, data) {
              err ? callback(err, null) : callback(null, data);
            }
          });
        };

      });

      async.parallel(tasks, config.onFinish);

    },

    Job: function (options) {

      var 
        mime, length,
        url  = options.url, 
        type = options.type || 'text', 
        bytesTotal  = 0, 
        bytesLoaded = 0;

      this.options = options;
      this.id = options.id;

      this.finished = false;
      this.failed   = false;
      this.ready    = false;
      this.active   = false;

      // head + get
      var onError = (err) => {
        this.failed = true;
        stats.requests -= 1;
        options.onFinish(err, null);
        setTimeout(self.check, 20);
      }

      // get
      var onProgress = (bytes) => {
        bytesLoaded += bytes;
        update('bytesLoaded', bytes);
      }

      // get
      var onLoaded = (data) => {
        this.finished = true;
        stats.requests -= 1;
        stats.bytesTotal -= bytesLoaded
        update('bytesLoaded', -bytesLoaded);
        options.onFinish(null, {data, mime, length, url});
        setTimeout(self.check, 20);
      }

      this.prepare = () => {

        var req = new XMLHttpRequest();

        req.open('HEAD', url, true);
        req.responseType = '';

        req.onload = ( msg ) => {

          if (req.readyState === 4){

            if (req.status === 200) {

              mime     = req.getResponseHeader('Content-Type');
              length   = req.getResponseHeader('Content-Length');
              modified = req.getResponseHeader('Last-Modified');

              // keep local
              bytesTotal = Number(length);

              // update global
              update('bytesTotal', bytesTotal);

              this.ready = true;
              self.check();

            } else {
              onError(req.status + ' ' +  req.statusText);

            }

          }

        };

        req.onerror = ( msg ) => {
          // console.log('GET.onerror', req.status, req.statusText, msg);
          onError(req.status + ' ' + req.statusText);
        };

        req.send(null);

      };

      this.loadtexture = () => {

        var loader = new THREE.TextureLoader();

        this.active     = true;
        stats.requests += 1;

        loader.load(
          url,
          function onlad ( texture ) {
            onLoaded(texture);
          },
          function onprogress ( xhr ) {
            onProgress(xhr.loaded - bytesLoaded);
          },
          function onerror ( xhr ) {
            onError(xhr.status + ' ' + xhr.statusText);
          }
        );

      };

      this.execute = () => {

        var req = new XMLHttpRequest();

        this.active     = true;
        stats.requests += 1;

        req.open('GET', url, true);
        req.responseType = type;

        req.onload = function ( event ) {

          // console.log('GET.onload', req.status, req.statusText, event);

          if (req.readyState === 4){
            if (req.status === 200) {
              onLoaded(req.response);

              if (self.onload) {
                self.onload(event.target.responseURL);
              }

            } else {
              onError(req.status + ' ' + req.statusText);

            }          
          }

        };

        req.onerror = function ( msg ) {
          onError(req.status + ' ' + req.statusText);
        };

        req.onprogress = function ( e ) {
          onProgress(e.loaded - bytesLoaded);
        };

        req.send(null);

      };

    },

  };

}());
