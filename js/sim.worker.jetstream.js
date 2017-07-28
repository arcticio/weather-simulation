
if( typeof importScripts === 'function') {

  var 
    SIM = {},
    name = 'jet.worker',
    topics = {

      quadratic: function (data) {
        return new Float32Array(data.map(n => n * n));
      },

      parse: function (dods) {

      }

    }
  ;

  importScripts(
    'aws.helper.js', 
    'aws.tools.js'
  );

  // say hello
  setTimeout(function () {

    var a = H.range(0, 10, 1);

    var  ta = new Float32Array(a);

    // postMessage({ ta });


  }, 100);

  // process something
  onmessage = function(event) {

    var 
      result,
      id      = event.data.id,
      topic   = event.data.topic,
      payload = event.data.payload;

    console.log('cloud.job', topic, id, typeof payload);

    if (topics[topic]) {

      result = topics[topic](payload);

      postMessage({id, result});

    } else {
      console.warn(name + ': unknown topic', topic);

    }

  };


}
