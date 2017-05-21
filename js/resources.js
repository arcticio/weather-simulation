'use strict';

// https://github.com/sindresorhus/screenfull.js/

/*

  Purpose is to show user information about ongoing requests,
  with some interactivity (cancel)

  How? https://www.html5rocks.com/en/tutorials/file/xhr2/

  got some extra activity via setTimeout.


*/


var RES = (function () {

  var 
    self, i, j, div,

    $$ = document.querySelectorAll.bind(document),

    jobs       = [],
    counter    = 0,
    isDev      = true,
    concurrent = 2,

    stats   = {
      queue:       0,   // jobs in queue
      requests:    0,   // active requests
      bytesLoaded: 0,   // from jobs in queue
      bytesTotal:  0,   // from jobs in queue
      jobsTotal:   0,   // historical
      percent:     0,   // done from jobs in queue
    },
    
  end;

  function format() {
    stats.percent = stats.requests ? (stats.bytesLoaded / stats.bytesTotal * 100).toFixed(1) : 'done';
    // return `R: ${stats.requests} | P: ${stats.percent}`;
    return JSON.stringify(stats) + '<br>';
  }

  function update (what, value)  {
    if (what !== undefined && value !== undefined){
      stats[what] += Number(value);
    }
    div.innerHTML += format();
  }

  return {

    // jobs,
    // stats,

    boot: function () {
      return self = this;
    },
    init: function (dev) {
      isDev = dev === undefined ? true : dev;
    },
    activate: function (selector) {
      div = $$(selector)[0];
    },
    check: function () {

      var candidate, candidates = [];

      candidates = jobs.filter( j => j.failed || j.finished);
      candidates.forEach( c => H.remove(jobs, c) );
      // console.log("Removed:", candidates.length, candidates.map(c => c.id));

      candidates = jobs.filter( j => !j.active && j.ready && !j.failed ).slice(0, concurrent);
      candidates.forEach( c => c.execute());
      // console.log("Executed:", candidates.length, candidates.map(c => c.id));

      stats.queue = jobs.length;
      update();

    },

    load: function (config) {

      // make this multi job !!

      var job;

      counter += 1;
      config.id = counter;

      job = new self.Job(config);
      jobs.push(job);
      job.prepare();

      stats.jobsTotal += 1;
      self.check();

    },

    Job: function (options) {

      var 
        mime, length, modified, 
        url  = options.urls[0], 
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
        options.onFinish(null, [{data, mime, length}]);
        setTimeout(self.check, 20);
      }

      this.prepare = () => {

        var req = new XMLHttpRequest();

        req.open('HEAD', url, true);
        req.responseType = '';

        req.onload = ( msg ) => {

          if (req.readyState === 4){

            if (req.status === 200) {

              mime     = req.getResponseHeader("Content-Type");
              length   = req.getResponseHeader("Content-Length");
              modified = req.getResponseHeader("Last-Modified");

              bytesTotal = Number(length);
              update('bytesTotal', bytesTotal);

              this.ready = true;
              self.check();

            } else {
              onError(req.status + ' ' +  req.statusText);

            }

          }

        };

        req.onerror = ( msg ) => {
          // console.log("GET.onerror", req.status, req.statusText, msg);
          onError(req.status + ' ' + req.statusText);
        };

        req.send(null);

      };

      this.execute = () => {

        var req = new XMLHttpRequest();

        this.active = true;
        stats.requests += 1;

        req.open('GET', url, true);
        req.responseType = type;

        req.onload = function ( msg ) {

          // console.log("GET.onload", req.status, req.statusText, msg);

          if (req.readyState === 4){
            if (req.status === 200) {
              onLoaded(req.response);

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

        req.send();

      };

    },

  };

}()).boot();