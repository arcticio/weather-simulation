
var VERSION = '0.3/arcticio/04-July-2017';

'use strict'

try {

  (function () {

    var 
      fun = () => {},
      cvs = window.CanvasRenderingContext2D,
      wgl = (function () {
        var canvas = document.createElement( 'canvas' ); 
        var context = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
        return context;
      }()),
      wrk = !!window.Worker,
      ex0 = true, // testing
      ex1 = wgl.getExtension('OES_texture_float'),
      ex2 = wgl.getExtension('OES_texture_float_linear'),
      tro = (function () {
        try {
          window.postMessage('', '*', [new Float32Array(4).buffer]);
          return true;
        } catch (e) {return false}
      }()),

      cleanup = (function () {
        wgl.getExtension('WEBGL_lose_context').loseContext();
      } ()),

    end;

    // checking for float texture render support 
    function checkFloatSupport () {

      var 
        status, gl,
        renderer = new THREE.WebGLRenderer(),
        scene    = new THREE.Scene(),
        camera   = new THREE.PerspectiveCamera(),

        target = new THREE.WebGLRenderTarget(16, 16, {
          format: THREE.RGBAFormat,
          type: THREE.FloatType
        })
      ;

      renderer.render(scene, camera, target);
      gl = renderer.context;
      status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.getExtension('WEBGL_lose_context').loseContext();

      return status === gl.FRAMEBUFFER_COMPLETE

    }


    if (!( fun && cvs && wgl && ex0 && ex1 && ex2 && wrk && tro /* && checkFloatSupport() */ )) {
      throw('FAILURE'); 
    }

  }())


} catch (e) {console.error('APP NOT SUPPORTED', e)}

// https://github.com/smali-kazmi/detect-mobile-browser


// https://stackoverflow.com/questions/4998278/is-there-a-limit-of-vertices-in-webgl
// GL_OES_element_index_uint max verices ?

// float supp: 
// https://github.com/mrdoob/three.js/issues/9628#issuecomment-245144478/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */

/*--------------- H E L P E R -------------------------------------------------

  these are Helpers, not solutions. No external stuff needed


  everything non domain H.[lowercase] should be here.
  V: 0.1, agentx, CGN, Feb, 2014

*/

// The Object.keys() method returns an array of a given object's own enumerable properties
// The Object.getOwnPropertyNames() method returns an array of all properties (enumerable or not) found directly upon a given object.
// http://rosettacode.org/wiki/Category:JavaScript

//noiv, Cologne, 2006, http://ExploreOurPla.net

'use strict'

function $I(){
  var el, i, a, v;
  if (!arguments[0] && arguments[1]){return document.createTextNode(arguments[1]);}
  el = document.createElement(arguments[0]);
  for (i = 1; i < arguments.length; i++){
    a = arguments[i];
    switch (typeof a){
      case "string" :  el.appendChild(document.createTextNode(a)); break;
      case "object" :  if (a.nodeType) {el.appendChild(a);}
                       else {for (v in a) {el[v] = a[v];}}break;
    }
  }
  return el;
}

var H = (function(){

  var 
    H = {},
    slice = Array.prototype.slice;


  if (!H.extend){
    H.extend = function (o){
      Array.prototype.slice.call(arguments, 1).forEach( function (e) { 
        return Object.keys(e).forEach( function (k) { 
          o[k] = e[k];
        });
      });
      return o;
    };
  } 

  H.extend(H, {

    // unsorted
    interprete: function(val){return typeof val === 'function' ? val() : val;},
    eat: function(e){e.stopPropagation(); return false;},

    // UTC Dates

    isoToday: function(){
      var d = new Date();
      return [
        d.getUTCFullYear(),
        H.padZero(d.getUTCMonth() +1),
        H.padZero(d.getUTCDate()),
      ].join("-");
    },
    isoNow: function(){
      var d = new Date();
      return [
        d.getUTCFullYear(),
        H.padZero(d.getUTCMonth() +1),
        H.padZero(d.getUTCDate()),
      ].join("-") + " " + [
        H.padZero(d.getUTCHours()),
        H.padZero(d.getUTCMinutes()),
        H.padZero(d.getUTCSeconds()),
      ].join(":");
    },
    iso2Day : function (iso) {
      var d = iso.split('-');
      return new Date(Date.UTC(d[0], d[1] -1, d[2]));
    },
    iso2DayHour : function (iso) {
      var d = iso.split('-');
      return new Date(Date.UTC(d[0], d[1] -1, d[2] || 0, d[3] || 0));
    },
    date2doe: function (d) {return ~~(d/864e5);},
    date2doeFloat: function (d) {return (d/864e5);},
    iso2doe: function (iso) {
      var d = iso.split('-'),
          d1 = new Date(Date.UTC(d[0], d[1] -1, d[2]));
      return ~~(d1/864e5);
    },


    // looping
    // for:        function(n,fn){var i=n,a=[];while(n--){a.push(fn(i-n+1));}return a;},
    range:      function (st, ed, sp){
      var i,r=[],al=arguments.length;
      if(al===0){return r;}
      if(al===1){ed=st;st=0;sp=1;}
      if(al===2){sp=1;}
      for(i=st;i<ed;i+=sp){r.push(i);}
      return r;
    },
    linspace:   function (a,b,n) {
      if(n===undefined){n=Math.max(Math.round(b-a)+1,1);}
      if(n<2) {return n===1?[a]:[];}
      var i,ret=Array(n);n--;
      for(i=n;i>=0;i--) {ret[i]=(i*b+(n-i)*a)/n;}
      return ret;
    },
    zip:        function (){
      var args = H.toArray(arguments), f = args.slice(-1)[0], o = args.slice(1, -1), l = [];
      args[0].forEach(function(d, i){
        var args = [d].concat(o.map(function(o){return o[i];}));
        l[i] = f.apply(f, args);
      });
      return l;
    },

    // numbers
    bounds:     function (x, min, max){ return Math.min(Math.max(x, min), max); },
    scale:      function (x,xMin,xMax,min,max){return (max-min)*(x-xMin)/(xMax-xMin)+min;},
    clamp:      function (val, min, max){return val < min ? min : val > max ? max : val;}, 
    isInteger:  function (n){return Math.floor(n) === n;},
    round:      function (n, p) {var fac = Math.pow(10, p); return Math.round(n * fac) / fac; },

    // strings
    format:     function (){
      var 
        c=0, args = slice.call(arguments),
        inserts = args.slice(1),
        tokens = (args[0] || '').split('%s');
      return tokens.map(function (t) { return t + (inserts[c++] || '');}).join('');
    },
    createAttenuator: function  (length) {

      var last = NaN;

      return function (data) {
        return (
          data === undefined  ? last :
          last = (isNaN(last) ? data : last) * (length - 1) / length + data * 1 / length  
        );
      };

    },
    replace:    function (s,f,r){return s.replace(new RegExp(H.escapeRex(f), 'g'), r);},
    padZero:    function (num, len){len = len || 2; var snum = '0000' + num; return snum.substr(snum.length-2, 2);},
    mulString:  function (s, l){return new Array(l+1).join(s);},
    escapeRex:  function (s){return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');},
    letterRange:function (r){return H.range(r.charCodeAt(0), r.charCodeAt(1)+1).map(function(i){return String.fromCharCode(i);}).join('');},
    findAll:    function (str, s){var idxs=[],idx,p=0;while((idx=str.indexOf(s,p))>-1){idxs.push(idx);p=idx+1;}return idxs;},
    tab:        function (s,l){l=l||8;s=new Array(l+1).join(' ')+s;return s.substr(s.length-l);},
    replaceAll: function (find, replace, str) {return str.replace(new RegExp(H.escapeRex(find), 'g'), replace);},
    endsWith:   function (str, end){var l0=str.length,l1=end.length; return str.slice(l0-l1,l0) === end;},

    // objects
    each:       function (o,fn){var a;for(a in o){if(o.hasOwnProperty(a)){fn(a,o[a]);}}},
    clone:      function (o){var e,n={};for(e in o){n[e]=o[e];}return n;},
    // attribs:    function (o){var a,n=[];for(a in o){if(o.hasOwnProperty(a)){n.push(a);}}return n;},
    firstAttr:  function (o){var attr; for (attr in o) {if (o.hasOwnProperty(attr)) {return attr;} } return undefined;},
    countAttrs: function (o){var a,c=0;for(a in o){if(o.hasOwnProperty(a)){c+=1;}}return c;},
    // count:      function (o){var attr,cnt=0;for(attr in o){if (o.hasOwnProperty(attr)){cnt+=1;}}return cnt;},
    deepcopy:   function (obj){return JSON.parse(JSON.stringify(obj));},
    // extend:     function (o,e){var a; for(a in e){if(e.hasOwnProperty(a)){o[a]=H.deepcopy(e[a]);}}return o;},
    // extend:     function (o,e){var a; for(a in e){if(e.hasOwnProperty(a)){o[a]=(e[a]);}} return o;},
    isEmpty:    function (o){var p;for(p in o){if(o.hasOwnProperty(p)){return false;}}return true;},
    prettify:   function (o){return JSON.stringify(o).split('"').join('');},
    map:        function (o,fn){var a,r={};for(a in o){if(o.hasOwnProperty(a)){r[a]=(typeof fn==='function')?fn(a,o[a]):fn;}}return r;},
    // transform:  function (o, fn){
    //   var r={}; H.each(o,function(k,v){var [ra,rv]=fn(k,v);r[ra]=rv;});return r; // chrome comp as of sep 15
    // },
    // mixin:      function(){
    //   var o = {}, mx = Array.prototype.slice.call(arguments, 0);
    //   mx.forEach(m => Object.keys(m).forEach(k => o[k] = m[k]));
    //   return o;
    // },
    

    // Arrays
    // empty:      function (a){while(a.length){a.shift();}},
    empty:      function (a){a.splice(0, a.length);},
    last:       function (a){return a[a.length -1];},
    // check: http://stackoverflow.com/a/18885102/515069
    delete:     function (a, fn){var i=0,o=0;while(a[i]!==undefined){if(fn(a[i])){a.splice(i,1);o++;}else{i++;}}return o;  },
    toArray:    function (a){return Array.prototype.slice.call(a);},
    contains:   function (a,e){return a.indexOf(e)!==-1;},
    consume:    function (a, fn){while(a.length){fn(a.shift());}},
    toFixed:    function (a,n){ n=n||1;return a.map(function(n){return n.toFixed(1);});},
    rotate:     function (a,n){return a.concat(a.splice(0,n));},
    // unique:     function (a){var u=[];a.forEach(function(i){if(u.indexOf(i)===-1){u.push(i);}});return u;},
    sample:     function (a,n){var l=a.length;n=n||1;return H.range(n).map(function(){return a[~~(Math.random() * l)];});},
    removeAll:  function (a,v){var i,j,l;for(i=0,j=0,l=a.length;i<l;i++) {if(a[i]!==v){a[j++]=a[i];}}a.length=j;},
    remove:     function (a,e){var i=a.indexOf(e); if (i!==-1){a.splice(i, 1);}},
    flatten:    function (a){return a.reduce(function(a, b) {return a.concat(b);});},
    pushUnique: function (a,e){if(a.indexOf(e)===-1){a.push(e);}return a;},
    equal:      function (a,b){return JSON.stringify(a) === JSON.stringify(b);},
    mean:       function (a){return a.reduce(function(s,x){return (s+x);},0)/a.length;},
    median:     function (a){var al=a.length,m=~~(a.sort().length/2);return !al?null:al%2?a[m]:(a[m-1]+a[m])/2;},
    

    repeat:     function (a, n) {
      var out=[], i, j, len=a.length;
      for (i=0; i<n; i++) {
        out.push([]);
        for (j=0; j<len; j++) {
          out[i].push(a[j])
        }
      }
      return out;
    },


    mode:       function (a){
      var i, n, cnt = {}, mode = [], max = 0;
      for (i in a) {
        n = a[i];
        cnt[n] = cnt[n] === undefined ? 0 : cnt[n] +1;
        if (cnt[n] === max){mode.push(n);}
        else if (cnt[n] > max) {max = cnt[n]; mode = [n];}
      }
      return mode; 
    },
    intersect:  function (a,b){
      var ai=0,bi=0,al=a.length,bl=b.length,r=[];a=a.sort();b=b.sort();
      while( (ai < al) && (bi < bl) ){
        if      (a[ai] < b[bi] ){ ai++; }
        else if (a[ai] > b[bi] ){ bi++; }
        else /* they're equal */ {
          r.push(a[ai]);
          ai++;
          bi++;
      }}return r;
    },  

    // functions
    // arrayfy:    function(fn, context){
    //   return function (param) {
    //     if (Array.isArray(param)){
    //       param.forEach(item => fn(item));
    //     } else {
    //       fn(param);
    //     }
    //   }.bind(context || null);
    // },
    binda:      function(fn, obj, a){
      // return fn.bind.apply(obj, [obj].concat(args));
      // return Function.prototype.bind.apply(fn, [obj].concat(args));
      var al = a.length;
      return (
        al === 0 ? fn.bind(obj) :
        al === 1 ? fn.bind(obj, a[0]) :
        al === 2 ? fn.bind(obj, a[0], a[1]) :
        al === 3 ? fn.bind(obj, a[0], a[1], a[2]) : 
        al === 4 ? fn.bind(obj, a[0], a[1], a[2], a[3]) : 
          undefined
      );
    },
    // peekNext: function (arr, num, fn){
      
    //   var 
    //    pointer = 0, len = arr.length, copy = [...arr, ...Array(num)],
    //    next  = function(n){pointer += n;},
    //    slice = function(){return copy.slice(pointer, pointer + num);};
      
    //   while (pointer < len){
    //     fn(...slice(num), next);
    //   }
      
    // },
    
    // ES6 Suite
    // unique:     function (a){return [...Set(a)];},
    // attribs:    function (o){return Object.keys(o);},
    // for:        function (o,fn){H.each(o, (key, val) => fn(val,key));},
    // count:      function (o){return Object.keys(o).length;},
    // values:     function (o){return Object.keys(o).map(function(k){return o[k];});},
    // each:       function (){
      
    //   var 
    //     i, k, a, al, args = H.toArray(arguments),
    //     items = args.slice(0, -1),
    //     fn    = args.slice(-1)[0];

    //     items.forEach(item => {

    //       if (item !== undefined){

    //         if (Array.isArray(item)){
    //           item.forEach( (value, key) => {
    //             fn(key, value);
    //           });

    //         } else if (item instanceof Map || item instanceof Set){
    //           item.forEach( (value, key) => {
    //             fn(key, value);
    //           });

    //         } else {
    //           a = Object.keys(item); al= a.length;
    //           for(i=0;i<al;i++){k=a[i];fn(k, item[k]);}
    //         }

    //       }

    //     });
    // }    

  });

// http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
// https://github.com/eligrey/FileSaver.js/issues/176#issuecomment-153800018

  H.base64toBlob = function(b64Data, contentType, sliceSize) {

      contentType = contentType || '';
      sliceSize   = sliceSize || 512;

      var i, offset, slice, byteNumbers, byteCharacters = atob(b64Data), byteArrays = [];

      for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          slice = byteCharacters.slice(offset, offset + sliceSize);

          byteNumbers = new Array(slice.length);
          for (i=0; i<slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      return new Blob(byteArrays, {type: contentType});

  }


// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable

  H.humanFileSize = function (bytes, si) {
      var thresh = si ? 1000 : 1024;
      if(bytes < thresh) {return bytes + ' B';}
      var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
      var u = -1;
      do {
          bytes /= thresh;
          ++u;
      } while(bytes >= thresh);
      return bytes.toFixed(1)+' '+units[u];
  };

  H.interpolate = function (data, points){

    // http://www.hevi.info/2012/03/interpolating-and-array-to-fit-another-size/
    
    var newData = [],
        factor  = (data.length - 1) / (points -1),
        i, tmp, point;

    function linear(p1, p2, px) {return p1 + (p2 - p1) * px;}

    newData[0] = data[0];

    for (i=1; i<points -1; i++){
      tmp = i * factor;
      point = ~~tmp;
      newData[i] = linear(data[point], data[point +1], tmp - point);
    }

    newData[points -1] = data[data.length -1];

    return newData;

  };

  H.createRingBuffer = function(length){

    var pointer = 0, lastPointer = 0, buffer = []; 

    return {
      push : function(item){
        buffer[pointer] = item;
        lastPointer = pointer;
        pointer = (length + pointer +1) % length;
      },
      buf   : buffer,
      get   : function(key){return buffer[key];},
      last  : function(){return buffer[lastPointer];},
      max   : function(){return Math.max.apply(Math, buffer);},
      min   : function(){return Math.min.apply(Math, buffer);},
      sum   : function(){return buffer.reduce(function(a, b){ return a + b; }, 0);},
      avg   : function(){return buffer.reduce(function(a, b){ return a + b; }, 0) / length;},    
      trend : function(){return H.trend(buffer);}    
    };
  };

  // http://dracoblue.net/dev/linear-least-squares-in-javascript/
  // http://stackoverflow.com/questions/6195335/linear-regression-in-javascript
  // return (a, b) that minimize
  // sum_i r_i * (a*x_i+b - y_i)^2
  H.trend = function(ax) {
    var i, x, y, al=ax.length,sumx=0, sumy=0, sumx2=0, sumy2=0, sumxy=0, sumr=0;
    for(i=0;i<al;i++){
        x = i; y = ax[i]; 
        sumr  += 1; 
        sumx  += x; sumx2 += (x*x);
        sumy  += y; sumy2 += (y*y); 
        sumxy += (x*y);
    }
    return (sumr*sumxy - sumx*sumy)/(sumr*sumx2-sumx*sumx);
  };
  H.regress = function(xyr)
  {
      var i, 
          x, y, r,
          sumx=0, sumy=0, sumx2=0, sumy2=0, sumxy=0, sumr=0,
          a, b;

      for(i=0;i<xyr.length;i++)
      {   
          // this is our data pair
          x = xyr[i][0]; y = xyr[i][1]; 

          // this is the weight for that pair
          // set to 1 (and simplify code accordingly, ie, sumr becomes xy.length) if weighting is not needed
          r = xyr[i][2] || 1;  

          // consider checking for NaN in the x, y and r variables here 
          // (add a continue statement in that case)

          sumr  += r;
          sumx  += r*x;
          sumx2 += r*(x*x);
          sumy  += r*y;
          sumy2 += r*(y*y);
          sumxy += r*(x*y);
      }

      // note: the denominator is the variance of the random variable X
      // the only case when it is 0 is the degenerate case X==constant
      b = (sumy*sumx2 - sumx*sumxy)/(sumr*sumx2-sumx*sumx);
      a = (sumr*sumxy - sumx*sumy)/(sumr*sumx2-sumx*sumx);

      return [a, b];
  };

  // H.list = function list(){
  //   var ap     = Array.prototype,
  //       arr    = ap.slice.call(arguments),
  //       copy   = Array.apply.bind(Array, Array, arr),
  //       slice  = ap.slice.bind(arr),
  //       concat = ap.concat.bind(arr),
  //       multiply = function(m){
  //         return concat.apply(null, Array.apply(null, {length: m -1}).map(()=>arr));
  //       };
  //   // console.log("arr", arr);
  //   return new Proxy(arr, {
  //       get: function(proxy, name){
  //         // console.log("proxy", proxy, name);
  //         return (
  //           proxy[name] !== undefined ? proxy[name] : 
  //           name === 'nil'      ? !proxy.length :
  //           name === 'head'     ? list.apply(null, slice(0, 1)) :
  //           name === 'tail'     ? list.apply(null, slice(1)) :
  //           name === 'last'     ? list.apply(null, slice(-1)) :
  //           name === 'inverse'  ? list.apply(null, copy().reverse()) :
  //           name === 'multiply' ? function(m){
  //             return list.apply(null, multiply(m));} :
  //           name === 'append'   ? function(){
  //             return list.apply(null, concat(ap.slice.call(arguments)));} :
  //           name === 'prepend'  ? function(){
  //             return list.apply(null, ap.slice.call(arguments).concat(proxy));} :
  //           name === 'string'   ? '[list ' + proxy.join(', ') + ']' :
  //             null
  //         );
  //       }
  //   });  
  // };

  // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
  // shocks jsLint
  H.shuffle = function(a){
    var j, x, i;
    for(j, x, i = a.length; i; j = Math.floor(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
    return a;
  };

  H.sayswho = (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    return  M ? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
  })();

  H.Base62 = {

    _Rixits :
      // "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-!",
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",

    fromNumber : function(number) {

      if (isNaN(Number(number)) || number === null || number === Number.POSITIVE_INFINITY)
        {throw "The input is not valid";}

      if (number < 0)
        {throw "Can't represent negative numbers now";}

      var rixit; // like 'digit', only in some non-decimal radix 
      var residual = Math.floor(number);
      var result = '';

      while (true) {
        rixit = residual % 62;
        result = this._Rixits.charAt(rixit) + result;
        residual = Math.floor(residual / 62);
        if (residual == 0) {break;}
      }
      return result;
    },

      toNumber : function(rixits) {

        var e, result = 0;

        rixits = rixits.split('');
        for (e in rixits) {
          if (rixits.hasOwnProperty(e)){
            result = (result * 62) + this._Rixits.indexOf(rixits[e]);
          }
        }
        return result;
      }
  };


return H; 

}());


// http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
// *
//  * Add a shuffle function to Array object prototype
//  * Usage :
//  *  var tmpArray = ["a", "b", "c", "d", "e"];
//  *  tmpArray.shuffle();
//  */
// Array.prototype.shuffle = function (){
//     var i = this.length, j, temp;
//     if ( i == 0 ) return;
//     while ( --i ) {
//         j = Math.floor( Math.random() * ( i + 1 ) );
//         temp = this[i];
//         this[i] = this[j];
//         this[j] = temp;
//     }
// };
'use strict'

var TOOLS = {

  debounce: function (fn, delay) {

    var timer = null;

    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };

  },

  createLatLonsRectFibanocci: function (samples) {

    // https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere

    var rnd = Math.random() * samples;
    var points = [];
    var offset = 2.0 / samples;
    var increment = Math.PI * (3.0 - Math.sqrt(5.) );

    H.each(H.range(samples), function (_, i) {

      var y = ((i * offset) - 1) + (offset / 2);
      var r = Math.sqrt(1 - Math.pow(y, 2));

      var phi = ((i + rnd) % samples) * increment;

      x = Math.cos(phi) * r;
      z = Math.sin(phi) * r;

      points.push(new THREE.Vector3().fromArray([x, y, z]));

    });

    return points
      .map( v3 => TOOLS.vector3ToLatLong(v3, 1))
      .map( ll => [ll.lat, ll.lon]);
    ;

  },

  createLatLonsSectorRandom: function (sec, amount) {

    var i, lat, lon, latlons = [];

    for (i=0; i<amount; i++) {
      latlons.push([
        sec[0] + Math.random() * (sec[2] - sec[0]),
        sec[1] + Math.random() * (sec[3] - sec[1])
      ]);
    }

    return latlons;

  },
  createLatLonsRectRandom: function (ul, lr, amount) {

    var i, lat, lon, latlons = [];

    for (i=0; i<amount; i++) {

      lon = ul[1] + Math.random() * (lr[1] - ul[1]);
      lat = ul[0] + Math.random() * (lr[0] - ul[0]);
      // lat = lat * Math.cos((lat + 90) * Math.PI/180) * -1.8;
      // lat = lat > 89.5 ? 89.5 : lat;

      latlons.push([lat, lon]);

    }

    return latlons;

  },
  createLatLonsRect: function (ul, lr, res) {

    /*
        3 4, 3 5, 3 6, 3 7;
        4 4, 4 5, 4 6, 4 7;
        5 4, 5 5, 5 6, 5 7;
    */


    var 
      i, j, res = res || 1, 
      latlons = [],

      rowLen = (lr[1] - ul[1] +1) / res,
      colLen = (lr[0] - ul[0] +1) / res,
      
      rowLon = H.linspace(ul[1], lr[1], rowLen),
      allLon = TOOLS.flatten(H.repeat(rowLon, colLen)),
      
      colLat = H.linspace(ul[0], lr[0], colLen),
      allLat = TOOLS.flatten(TOOLS.transpose(H.repeat(colLat, rowLen)));
      
    
    return H.zip(allLat, allLon, (lat, lon) => [lat, lon] );


  }, transpose :  function (m) { 

      return m[0].map((x,i) => m.map(x => x[i]));

  
  }, flatten : function (array, mutable) {

      var result = [];
      var nodes = (mutable && array) || array.slice();
      var node;

      if (!array.length) {
          return result;
      }

      node = nodes.pop();
      
      do {
          if (Array.isArray(node)) {
              nodes.push.apply(nodes, node);
          } else {
              result.push(node);
          }
      } while (nodes.length && (node = nodes.pop()) !== undefined);

      result.reverse(); // we reverse result to restore the original order, TRY: Float.Revese
      return result;

  },

  placeMarker: function (object, options) {

    var position = TOOLS.latLongToVector3(options.latitude, options.longitude, options.radius, options.height);
    var marker   = TOOLS.createMarker(options.size, options.color, position);
    
    object.add(marker);

  },

  createMarker: function (size, color, vector3Position) {

    var markerGeometry = new THREE.SphereGeometry(size);
    var markerMaterial = new THREE.MeshLambertMaterial({color: color});
    var markerMesh     = new THREE.Mesh(markerGeometry, markerMaterial);

    markerMesh.position.copy(vector3Position);

    return markerMesh;

  },
  vector3toScreenXY: function (pos, width, height) {

    var p = new THREE.Vector3(pos.x, pos.y, pos.z);
    var vector = p.project(SCN.camera);

    vector.x =  (vector.x + 1) / 2 * width;
    vector.y = -(vector.y - 1) / 2 * height;

    return vector;
  },

  vector3ToLatLong: function (v, radius) {

    // var lon = ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360) - 180;

    return {
      lat: 90 - (Math.acos(v.y / radius))  * 180 / Math.PI,
      // lon: ((Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360
      lon: ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360)
    };

  },

  vector3ToLatLongMem: function (v, radius, lat, lon) {

    lat = 90 - (Math.acos(v.y / radius))  * 180 / Math.PI,
    lon = ((Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360

  },

  latLongToVector3: function (lat, lon, radius, height) {

    var phi   = lat * Math.PI / 180;
    var theta = (lon - 180) * Math.PI / 180;

    var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    var y =  (radius + height) * Math.sin(phi);
    var z =  (radius + height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);

  },

  placeMarkerAtAddress: function (mesh, address, color) {

    var encodedLocation = address.replace(/\s/g, '+');
    var XHR = new XMLHttpRequest();

    XHR.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedLocation);
    XHR.send(null);
    XHR.onreadystatechange = function () {

      if (XHR.readyState == 4 && XHR.status == 200) {

        var result = JSON.parse(XHR.responseText);

        if (result.results.length > 0) {

          var latitude  = result.results[0].geometry.location.lat;
          var longitude = result.results[0].geometry.location.lng;

          Tools.placeMarker(mesh.getObjectByName('surface'), {
            latitude:  latitude,
            longitude: longitude,
            radius:    0.5,
            height:    0,
            size:      0.01,
            color:     color
          });

        }

      }

    };
  
  },

};
/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, TIM, padZero */

// function isDate(d) {
//   if ( Object.prototype.toString.call(d) !== "[object Date]" ){return false;}
//   return !isNaN(d.getTime());
// }

'use strict'

function utc(a){return new UTC(a);}
function UTC(){

  var args = Array.prototype.slice.call(arguments, 0);

  // passing dash seperated string
  if (args.length === 1 && typeof args[0] === "string"){
    this.date = this.fromIso(args[0]).toDate();

  // msecs as integer
  } else if (args.length === 1 && typeof args[0] === "number"){
    this.date = new Date(args[0]);

  // javascript date object
  } else if (args.length === 1 && typeof args[0] === "object" && args[0].getTime){
    this.date = args[0];

  // [year, month, ...]
  } else if (args.length === 1 && args[0] instanceof Array){
    this.date = new Date(new UTC().fromArray(args[0]).time());

  // we eat me :)
  } else if (args.length === 1 && args[0] instanceof UTC){
    this.date = new Date(args[0].time());
  
  // now
  } else {
    this.date = new Date();
  }

}


UTC.prototype = {
  levels:       ["decade", "year", "month", "day", "hour", "min", "sec"],
  monthShort:   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthLong:    ['January','February','March','April','May','June','July','August','September','October','November','December'],
  weekdayShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdayLong:  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  year:     function(){ return this.date.getUTCFullYear();},
  month:    function(){ return this.date.getUTCMonth();},
  day:      function(){ return this.date.getUTCDate();},
  hour:     function(){ return this.date.getUTCHours();},
  mins:     function(){ return this.date.getUTCMinutes();},
  secs:     function(){ return this.date.getUTCSeconds();},
  msecs:    function(){ return this.date.getUTCMilliseconds();},
  time:     function(){ return this.date.getTime();},
  toString: function(){ return this.date.toJSON().toString();},
  toDate:   function(){ return this.date;},
  toIso:    function(res){
    return this.toArray()
      .map(function(item){return (item + "").length < 2 ? H.padZero(item) : item + "";})
      .slice(0, res || 3).join("-");
  },
  toArray:  function(){
    return [
      this.date.getUTCFullYear(),
      this.date.getUTCMonth() +1,
      this.date.getUTCDate(),
      this.date.getUTCHours(),
      this.date.getUTCMinutes(),
      this.date.getUTCSeconds(),
      this.date.getUTCMilliseconds()
    ];
  },
  fromArray: function(a){
    var d = new Date(0);
    if (a.length > 0){d.setUTCFullYear(a[0]);}
    if (a.length > 1){d.setUTCMonth(a[1] -1);}
    if (a.length > 2){d.setUTCDate(a[2]);}
    if (a.length > 3){d.setUTCHours(a[3]);}
    if (a.length > 4){d.setUTCMinutes(a[4]);}
    if (a.length > 5){d.setUTCSeconds(a[5]);}
    if (a.length > 6){d.setUTCMilliseconds(a[6]);}
    return new UTC(d);
  },
  setZone: function(){
    this.date.setUTCMinutes(this.date.getUTCMinutes() - this.date.getTimezoneOffset());    
    return this; // ???
  },  
  align: function(what, num) {
    var arr = this.toArray();
    switch(what){
      case "hours": arr[3] = arr[3]%24 - arr[3]%num; return new UTC().fromArray(arr); break; 
    }
  },
  delta: function(what, amount) {
    var msecs = this.date.getTime(), arr = this.toArray(),
        secs  = 1000, mins  = 60 * secs, hours = 60 * mins;
    switch (what || "days"){
      case "years":  arr[0] += amount; return new UTC().fromArray(arr); break; 
      case "months": arr[1] += amount; return new UTC().fromArray(arr); break; 
      case "days":   arr[2] += amount; return new UTC().fromArray(arr); break; 
      case "hours":  return utc(new Date(msecs + amount * hours)); break; 
      case "mins":   return utc(new Date(msecs + amount * mins)); break; 
      case "secs":   return utc(new Date(msecs + amount * secs)); break; 
      case "msecs":  return utc(new Date(msecs + amount)); break; 
      default: throw new Error("Not defined in utc.delta: " + what);
    }
  },
  neighbours: function(what, amount, factor){
    var i, accu = []; factor = factor || 1;
    for (i=-amount; i<amount+1; i++) {
      accu.push(utc(this.date).delta(what, i * factor));
    }
    return accu;
  },
  fromIso: function(iso, len){

    var date, arr = iso.split("-"), Y=0, m=0, h=0, M=0, s=0, ms=0, d=1;

    len = len || 3;

    if(arr.length > 0) {Y  = parseInt(arr[0], 10);}
    if(arr.length > 1) {m  = parseInt(arr[1], 10) -1;}
    if(arr.length > 2) {d  = parseInt(arr[2], 10);}
    if(arr.length > 3) {h  = parseInt(arr[3], 10);}
    if(arr.length > 4) {M  = parseInt(arr[4], 10);}
    if(arr.length > 5) {s  = parseInt(arr[5], 10);}
    if(arr.length > 6) {ms = parseInt(arr[6], 10);}

    date = new Date(Y, m, d, h, M, s, ms);
    date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset());
    return new UTC(date);
  },
  centerIn : function(level){
    var t1 = this.lowerIn(level).time(),
        t2 = this.upperIn(level).time();
    return new UTC(new Date(t1 + (t2 - t1)/2 + 1));
  },

  lowerIn: function(level){

    var d = this.date, date;

    if (level === "year") {
      date = new Date(d.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (level === "month") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0);
    } else if (level === "day") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
    } else if (level === "hour") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 0, 0, 0);
    } else if (level === "min") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0, 0);
    } else if (level === "sec") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 0);
    }
    return new UTC(date).setZone();    
  },
  upperIn: function(level){

    var d = this.date, date;

    if (level === "year") {
      date = new Date(d.getUTCFullYear() +1, 0, 0, 23, 59, 59, 999);
    } else if (level === "month") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth() +1, 0, 23, 59, 59, 999);
    } else if (level === "day") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999);
    } else if (level === "hour") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 59, 59, 999);
    } else if (level === "min") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 59, 999);
    } else if (level === "sec") {
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 999);
    }
    return new UTC(date).setZone();    
  },
  format: function(pattern){

    var d = this.date, tokens = {
              'a': this.weekdayShort[d.getDay()],         // Mon=1        
              'b': this.monthShort[d.getMonth()],         // Jan=0       
              'Y': d.getUTCFullYear(),
              'm': H.padZero(d.getUTCMonth() +1),
              'd': H.padZero(d.getUTCDate()),
              'e': d.getUTCDate(),                            // not quite
              'M': H.padZero(d.getUTCMinutes()),              // not quite
              'H': H.padZero(d.getUTCHours())
    };

    for (t in tokens){
      if (tokens.hasOwnProperty(t)){
        pattern = pattern.split("%"+t).join(tokens[t]);
      }
    }
    return pattern;
  },
/**
 * \details
 * \arg \%a - abbreviated weekday name according to the current locale
 * \arg \%A - full weekday name according to the current locale
 * \arg \%b - abbreviated month name according to the current locale
 * \arg \%B - full month name according to the current locale
 * \arg \%c - preferred date and time representation for the current locale
 * \arg \%C - century number (the year divided by 100 and truncated to an integer, range 00 to 99)
 * \arg \%d - day of the month as a decimal number (range 01 to 31)
 * \arg \%D - same as %m/%d/%y
 * \arg \%e - day of the month as a decimal number, a single digit is preceded by a space (range ' 1' to '31')
 * \arg \%g - like %G, but without the century
 * \arg \%G - The 4-digit year corresponding to the ISO week number
 * \arg \%h - same as %b
 * \arg \%H - hour as a decimal number using a 24-hour clock (range 00 to 23)
 * \arg \%I - hour as a decimal number using a 12-hour clock (range 01 to 12)
 * \arg \%j - day of the year as a decimal number (range 001 to 366)
 * \arg \%m - month as a decimal number (range 01 to 12)
 * \arg \%M - minute as a decimal number
 * \arg \%n - newline character
 * \arg \%p - either `AM' or `PM' according to the given time value, or the corresponding strings for the current locale
 * \arg \%P - like %p, but lower case
 * \arg \%r - time in a.m. and p.m. notation equal to %I:%M:%S %p
 * \arg \%R - time in 24 hour notation equal to %H:%M
 * \arg \%S - second as a decimal number
 * \arg \%t - tab character
 * \arg \%T - current time, equal to %H:%M:%S
 * \arg \%u - weekday as a decimal number [1,7], with 1 representing Monday
 * \arg \%U - week number of the current year as a decimal number, starting with
 *            the first Sunday as the first day of the first week
 * \arg \%V - The ISO 8601:1988 week number of the current year as a decimal number,
 *            range 01 to 53, where week 1 is the first week that has at least 4 days
 *            in the current year, and with Monday as the first day of the week.
 * \arg \%w - day of the week as a decimal, Sunday being 0
 * \arg \%W - week number of the current year as a decimal number, starting with the
 *            first Monday as the first day of the first week
 * \arg \%x - preferred date representation for the current locale without the time
 * \arg \%X - preferred time representation for the current locale without the date
 * \arg \%y - year as a decimal number without a century (range 00 to 99)
 * \arg \%Y - year as a decimal number including the century
 * \arg \%z - numerical time zone representation
 * \arg \%Z - time zone name or abbreviation
 * \arg \%% - a literal `\%' character
 */
};

function TimeRange(){
  this.ranges = [];
  this.className = "TimeRange";
  this.push(Array.prototype.slice.call(arguments, 0));
}

TimeRange.prototype = {
  levels: ["decade", "year", "month", "day", "hour", "min", "sec"],
  log: function(tail){
    tail = tail || "";
    this.ranges.forEach(function(r){
      // console.log(r[0], r[1], tail);
    });
  },
  length:   function(){return this.ranges.length;},
  toString: function(trenner){

    var out = ""; trenner = trenner || " <> ";

    this.ranges.forEach(function(r){
      out += "[" + r[0] + trenner + r[1] + "], ";
    });

    return (out) ? out.substr(0, out.length -2) : "";

  },
  latest: function(){ 

    var out = "";

    this.ranges.forEach(function(r){
      if (r[1] > out) {
        out = r[1];
      }
    });
    return (out === "") ? null : out;

  },
  extend: function(level){

    var d1, d2, len = {year: 1, month:2, day: 3, hour:4}[level], 
        tr = new TimeRange();

    this.ranges.forEach(function(r){

      d1 = utc(r[0]).lowerIn(level).toIso(len);
      d2 = utc(r[1]).upperIn(level).toIso(len);
      tr.push(d1, d2);

    });

    return tr;

  },
  resolution: function(){
    var res = 0;

    this.ranges.forEach(function(r){
      if (r[0].split("-").length > res) {
        res = r[0].split("-").length;
      }
    });
    return res;

  },
  push: function( /* arguments */ ){

    var self = this, args = Array.prototype.slice.call(arguments, 0);

    if (args.length === 2 && typeof args[0] === "string" && typeof args[1] === "string"){
      this.ranges.push([args[0], args[1]]);

    } else if (args.length === 1 && args[0] instanceof Array && args[0].length){
      this.ranges.push(args[0]);

    } else if (args.length === 1 && args[0].className &&  args[0].className === "TimeRange"){
      args[0].ranges.forEach(function(r){
        self.ranges.push(r);
      });

    }

    return this;

  },
  _upper: function(iso, len){
    var l = iso.split("-").length, levels = ["year", "month", "day", "hour", "min", "sec", "msec"];
    if (l < len){return this._upper(utc(iso).upperIn(levels[l-1]).toIso(l+1), len);} else {return iso;}
  },
  _lower: function(iso, len){
    var l = iso.split("-").length, levels = ["year", "month", "day", "hour", "min"];
    if (l < len){return this._lower(utc(iso).lowerIn(levels[l-1]).toIso(l+1), len);} else {return iso;}
  },
  covers: function(stamp){
    var self = this;
    return this.ranges.some(function(r){
      function lev(iso){
        return self.levels[iso.split("-").length];
      }
      var t1 = utc(r[0]).lowerIn(lev(r[0])).toIso(7);
      var t2 = utc(r[1]).upperIn(lev(r[1])).toIso(7);
      return new TimeRange(t1, t2).contains("milli", stamp);
    });

  },
  contains: function(level, something){

    var tr, self = this, 
        msecs = utc(something).time(),
        test = utc(something).centerIn(level).toDate(),
        len = {year: 1, month:2, day: 3, hour:4}[level];

    switch (level){
      case "year":
      case "month":
      case "day":
      case "hour":
      case "min":
      case "sec":
        result = this.ranges.some(function(r){
          var t1 = utc(self._lower(r[0], len)).lowerIn(level).toIso(7);
          var t2 = utc(self._upper(r[1], len)).upperIn(level).toIso(7);
          return new TimeRange(t1, t2).contains("milli", test);
        });
      break;

      case "milli":
        result = this.ranges.some(function(r){
          var m1 = utc(r[0]).time();
          var m2 = utc(r[1]).time();
          return (msecs >= m1 && msecs <= m2);
        });
      break;
    }

    return result;

  }

};

var RES = (function () {

  var 
    self, div,

    $$ = document.querySelectorAll.bind(document),

    jobs       = [],
    counter    = 0,
    isDev      = true,
    concurrent = 2,

    div = $$('.panel.info')[0],

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
    div.innerHTML = `Req: ${stats.requests} Per: ${stats.percent}`;

    div.style.backgroundSize = ~~stats.percent + '%';

    // console.log(stats.requests, stats.bytesLoaded, stats.bytesTotal);

  }

  return self = {

    onload: null,

    init: function () {
    },
    activate: function (selector) {
      div.innerHTML = 'R: 0, ETA: 0';
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

// https://github.com/sindresorhus/screenfull.js/

var ANI = (function () {

  var 
    self,
    status   = {frame: 0},
    actions  = [],
    $$       = document.querySelectorAll.bind(document);


  return self = {

    status,

    init: function () {},
    activate: function () {},

    step: function (frame, deltatime) {

      status.frame = frame;

      if (actions[frame]) {
        actions[frame]();
      }

    },

    stop: function () {
      TWEEN.removeAll();
    },


    insert: function (frame, action) {

      if (typeof frame === 'number') {

        if (frame === 0){
          action();

        } else {
          actions[frame] = action;

        }

      }

    },

    tween: function (current, target, duration, update, easing) {
      return function () {
        var tween = new TWEEN.Tween(current)
          .easing(easing)
          .to(target, duration)
          .onUpdate(update)
          .start()
        ;
      };
    },

    library: {

      // graphs => https://5013.es/toys/tween.audio/

      example: function () {


        if (SCN.meshes.data){

          var current = {y: SCN.meshes.data.rotation.y};
          var target  = {y: SCN.meshes.data.rotation.y + 2 * Math.PI};

          var tween = new TWEEN
            .Tween(current)
            .delay(100)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 2000)
            .repeat(0)
            .onStart(function(d){
              TIM.step('TWEEN.start', d)
            })
            .onUpdate(function(d){
              SCN.meshes.data.rotation.y = current.y;
            })
            .onComplete(function(d){
              TIM.step('TWEEN.done', d)
            })
            .start()
          ;

        } else {
          TIM.step('TWEEN.ignored');

        }

      },

      intro: function (duration, callback) {

        var 
          rgba,
          table    = $$('table.loader')[0],
          curSpcl  = new THREE.Spherical().setFromVector3(new THREE.Vector3(8, 8, 8)),
          futSpcl  = new THREE.Spherical().setFromVector3(SCN.camera.position),
          current  = {
            alpha:   0.2, 
            phi:     curSpcl.phi,
            theta:   curSpcl.theta,
            radius:  curSpcl.radius,
          },
          target   = {
            alpha:   -1.0, 
            phi:     futSpcl.phi,
            theta:   futSpcl.theta,
            radius:  futSpcl.radius,
          };

        return function () {

          var tween = new TWEEN
            .Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, duration)
            .onUpdate(function(stage){

              rgba = 'rgba(0, 0, 0, ' + (current.alpha < 0 ? 0 : current.alpha) + ')';
              table.style.backgroundColor = rgba;

              curSpcl.set(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(curSpcl);
              SCN.camera.lookAt(SCN.home);

              if (stage > 0.5){
                table.style.display = 'none';
              }

            })
            .onComplete(callback)
            .start()
          ;

        };

      },

      lightset: function (lightset, duration) {
        return function () {};
      },

      menu: {
        toggle: function (newx, duration) {

          var 
            current = {x: IFC.Hud.menu.position.x},
            target  = {x: newx},
            update  = () => IFC.Hud.menu.position.setX(current.x);

          return self.tween(current, target, duration, update, TWEEN.Easing.Sinusoidal.Out)

        },
        scale: function (scale, duration) {

          var 
            current = {scale: IFC.Hud.menu.scale.x},
            target  = {scale},
            update  = () => IFC.Hud.menu.scale.set(current.scale, current.scale, 1);

          return self.tween(current, target, duration, update, TWEEN.Easing.Sinusoidal.Out)

        }
      },

      sprite: {

        enter: function (sprite, duration) {

          var 
            isToggle = sprite.cfg.type === 'toggle',
            isToggled = !!sprite.toggled,
            tarOpacity   = isToggle && isToggled ? 0.5 : 0.9,
            curOpacity   = isToggle && isToggled ? 0.9 : 0.5,

            pos     = sprite.cfg.position,
            mat     = sprite.cfg.material,
            current = {
              width:    pos.width, 
              height:   pos.height, 
              opacity:  isToggle ? curOpacity : mat.opacity,
            },
            target  = {
              width:    current.width  * 1.1, 
              height:   current.height * 1.1,
              opacity:  isToggle ? tarOpacity : mat.opacity,
            }
          ;

          return function () {

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Sinusoidal.Out)
              .to(target, duration)
              .onUpdate(function(d){
                sprite.scale.set( current.width, current.height, 1 );
                sprite.material.opacity = current.opacity;
              })
              .start()
            ;

          };

        },
        leave: function (sprite, duration) {

          var 
            isToggle = sprite.cfg.type === 'toggle',
            isToggled = !!sprite.toggled,
            curOpacity   = isToggle && isToggled ? 0.5 : 0.9,
            tarOpacity   = isToggle && isToggled ? 0.9 : 0.5,
            pos = sprite.cfg.position,
            mat = sprite.cfg.material,
            current = {
              width:    pos.width  * 1.1, 
              height:   pos.height * 1.1, 
              opacity:  isToggle ? curOpacity : sprite.material.opacity
            },
            target  = {
              width:    pos.width, 
              height:   pos.height,
              opacity:  isToggle ? tarOpacity : mat.opacity,
            }
          ;

          return function () {

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Sinusoidal.Out)
              .to(target, duration)
              .onUpdate(function(d){
                sprite.scale.set( current.width, current.height, 1 );
                sprite.material.opacity = current.opacity;
              })
              .start()
            ;

          };

        },
      },

      datetime: {

        add: function (val, what, duration) {

          var 
            current = {now: SIM.time.model.unix() * 1000},
            target  = {now: current.now + 24 * 60 * 60 * 1000};

          return function () {

            // TWEEN.removeAll();

            var tween = new TWEEN.Tween(current)
              .easing(TWEEN.Easing.Quadratic.Out)
              .to(target, duration)
              .onUpdate(function(d){
                SIM.setSimTime(moment(current.now))
                // console.log(d);
              })
              .start()
            ;

          };


        },

      },

      scaleGLobe: function(scale, duration) {

        var 
          current = SCN.scene.scale,
          target  = {x: scale, y: scale, z: scale};

        return function () {

          // TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .to(target, duration)
            .onUpdate(function(d){
              SCN.scene.scale.copy(current);
            })
            .start()
          ;

        };

      },

      cam2latlon: function (lat, lon, distance){

        var 
          spherical,
          curVec   = SCN.camera.position.clone(),
          futVec   = TOOLS.latLongToVector3(lat, lon, distance, 0),

          curShere = new THREE.Spherical().setFromVector3(curVec),
          futShere = new THREE.Spherical().setFromVector3(futVec),

          current = {
            phi:    curShere.phi,
            theta:  curShere.theta,
            radius: SCN.camera.radius,
          },
          target  = {
            phi:    futShere.phi,
            theta:  futShere.theta,
            radius: distance,
          };

        return function () {

          // TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 500)
            .onUpdate(function(d){
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
            })
            .onComplete(function(d){
              IFC.updatePointer();
            })
            .start()
          ;

        };


      },

      cam2vector: function (vector){

        // https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object

        var 
          fov    = SCN.camera.fov * ( Math.PI / 180 ),
          radius = Math.abs( RADIUS + RADIUS / 2 / Math.sin( fov / 2 ) );  // 45% height

        var 
          spherical,
          curShere = new THREE.Spherical().setFromVector3(SCN.camera.position),
          futShere = new THREE.Spherical().setFromVector3(vector),

          current = {
            phi:    curShere.phi,
            theta:  curShere.theta, 
            radius: SCN.camera.radius,
          },
          target  = {
            phi:    futShere.phi,
            theta:  futShere.theta,  // east-direction
            radius: radius,
          },

        end;

        // handle moving over NUll Meridian
        if (target.theta - current.theta > Math.PI) {
          target.theta += 2 * Math.PI;
        }

        return function () {

          // TWEEN.removeAll();

          var tween = new TWEEN.Tween(current)
            .easing(TWEEN.Easing.Exponential.Out)
            .to(target, 500)
            .onUpdate(function(d){
              spherical = new THREE.Spherical(current.radius, current.phi, current.theta);
              SCN.camera.position.setFromSpherical(spherical);
              SCN.camera.lookAt(SCN.home);
            })
            .start()
          ;

        };


      },

    } // end lib


  };

}());


/*

sphericalPosition = new THREE.Spherical().setFromVector3(vector3);
sphericalPosition.theta += model.ugrd10.linearXY(0, lat, lon) * factor; // east-direction
sphericalPosition.phi   += model.vgrd10.linearXY(0, lat, lon) * factor; // north-direction
vector3 = vector3.setFromSpherical(sphericalPosition).clone();



*//*

  This is an actively composed configuration: 
    values get possibly overwritten (e.g. texture),
    there are function, eval'd later,
    or event handlers,
    if creates globals (e.g PI, TAU)

*/


/* GLOBALS */

const 
  PI      =   Math.PI,
  TAU     =   2 * PI,
  PI2     =   PI / 2,
  RADIUS  =   1.0,    // surface, population
  LEVEL_0 =   0.000,  // population
  LEVEL_1 =   0.001,  // basemaps, snpp, rtopo2
  LEVEL_2 =   0.002,  // sst
  LEVEL_3 =   0.003,  // seaice
  LEVEL_4 =   0.004,  // wind10, tmp2m
  LEVEL_5 =   0.005,  // clouds
  LEVEL_6 =   0.006,  // jetstream
  LEVEL_7 =   0.007,  // atmosphere

  KELVIN  =   273.15
;

var TIMENOW = moment.utc('2017-06-20 1200', 'YYYY-MM-DD HHmm');

var CFG = {

  isLoaded:         false,

  Title:            'Simulator',

  Camera: {
    cam:            new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
    pos:            new THREE.Vector3(4, 0, 0),         
    minDistance:    RADIUS + 0.2,
    maxDistance:    8,                 
  },

  User: {
    ip:             '',
    country_code:   '',
    country_name:   'Unknown',
    region_code:    '',
    region_name:    '',
    city:           '',
    zip_code:       '',
    time_zone:      '',
    latitude:       0.0,
    longitude:      0.0,
    metro_code:     0,
    loc_detected:   false,
  },

  Device: {

    browser:                   'unknown',
    platform:                  navigator.platform,
    devicePixelRatio:          NaN,

    canMotion:                 false,
    canOrientation:            false,
    canUserProximitry:         false,
    canDeviceProximitry:       false,

    maxVertexUniforms:         NaN,
    max_texture_size:          NaN,
    max_cube_map_texture_size: NaN,

    OES_texture_float:         false,
    OES_texture_float_linear:  false,

  },

  Sim: {
    coordspool : {
      amount:       5e5,
    }
  },

  Hud: {
    opacityLow:  0.5,
    opacityHigh: 0.99,
  },

  BasemapIds: [9, 10, 11, 14],
  defaultBasemap: 'basemaps',     // id = 8

  Faces: ['right', 'left', 'top', 'bottom', 'front', 'back'],

  Textures: {
    
    'transparent.face.512.png':     'images/transparent.face.512.png',

    'arcticio.logo.512.png':        'images/arcticio.logo.white.512.png',
    'red.dot.png':                  'images/red.dot.png',
    'dot.white.128.png':            'images/dot.white.128.png',
    // 'logo.128.png':                 'images/logo.128.png',
    'logo.128.png':                 'images/logo.128.01.png',

    // 'tex2.jpg':                     'images/test/tex2.jpg',
    // 'tex3.jpg':                     'images/test/tex3.jpg',
    // 'tex4.jpg':                     'images/test/tex4.jpg',
    // 'tex5.png':                     'images/test/tex5.png',
    // 'tex6.png':                     'images/test/tex6.png',
    // 'tex7.jpg':                     'images/test/tex7.jpg',

    // Tools
    'hud/fullscreen.png':           'images/hud/fullscreen.png',
    'hud/gear.png':                 'images/hud/gear.1.png',
    // 'hud/graticule.png':            'images/hud/graticule.2.png',
    'hud/graticule.png':            'images/hud/graticule.3.png',
    'hud/hamburger.png':            'images/hud/hamburger.png',
    'hud/info.png':                 'images/hud/info.png',
    'hud/movie.png':                'images/hud/movie.1.png',
    'hud/reload.png':               'images/hud/reload.png',

    // Assets
    'hud/mask.png':                 'images/hud/mask.png',
    'hud/clouds.png':               'images/hud/clouds.png',
    'hud/satellite.png':            'images/hud/satellite.1.png',
    'hud/seaice.png':               'images/hud/seaice.png',
    'hud/snow.png':                 'images/hud/snow.png',
    'hud/space.png':                'images/hud/space.png',
    'hud/sst.png':                  'images/hud/sst.png',
    // 'hud/temperature.png':          'images/hud/temperature.png',
    'hud/temperature.png':          'images/hud/temperature.01.png',
    'hud/rain.png':                 'images/hud/rain.png',
    'hud/population.png':           'images/hud/population.png',

    'oceanmask.4096x2048.grey.png': 'images/spheres/oceanmask.4096x2048.grey.png',

  },

  Lightsets: {
    data: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    snpp: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    normal: {
      sun:        {intensity: 0.0},
      spot:       {intensity: 0.0},
      ambient:    {intensity: 1.0},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
  },

  Sun: {
    radius: 10,
  },

  earth: {
    factor:        6371,
    radius:        RADIUS,
    // radiusOverlay: RADIUS + 0.1,
  },

};

CFG.Manager = (function () {

  var 
    self, 
    assets = [], // found in URL
    simtime,     // found in URL
    simcoords,   // found in URL
    position     
  ;

  return self = {
    boot: function () {
      CFG.debug    = self.debug;
      CFG.location = self.location;
      return self;
    },
    init: function () {

      // called BEFORE launch sequence

      var user = CFG.User;

      self.initStore();
      self.probeFullscreen();
      self.sanitizeUrl();

      if (user.loc_detected) {
        TIM.step('CFG.User', 'lat:', user.latitude, 'lon:', user.longitude, user.country_code, user.country_name);
      } else {
        TIM.step('CFG.User', 'location unknown');
      }

      // rewrite CFG.Objects visibility to enable objects from url
      // and enable always on assets without id (cam, etc.)

      H.each(CFG.Objects, (name, cfg) => {
        if (cfg.id !== undefined){
          cfg.visible = assets.indexOf(cfg.id) !== -1;
        } else {
          cfg.visible = true;
        }
      });

      // update cam config
      CFG.Camera.pos = position;

    },

    probeFullscreen: function () {

      if (screenfull.enabled){
        var img = document.querySelectorAll('.btnFullscreen')[0];
        img.src = 'images/fullscreen.grey.png';
      }

    },
    lockOrientation: function (orientation) {

      // https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation

      var 
        locker1 = (
          ('orientation' in screen) && 
          (typeof screen.orientation.lock   === 'function') && 
          (typeof screen.orientation.unlock === 'function')
        ),
        locker2 = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation
      ;

      // Chrome
      if (locker1) {
        screen.orientation.lock(orientation).then(
          function() {
            TIM.step('CFG.lock', orientation);
          },
          function() {
            TIM.step('CFG.lock', 'failed');
          }
        );

      } else {

        if (locker2 && locker2(orientation)) {
          TIM.step('CFG.lock', orientation);

        } else {
          TIM.step('CFG.lock', 'failed');

        }

      }

    },

    location: function (response) {
      // called by geojson
      Object.assign(CFG.User, response);
      CFG.User.loc_detected = (CFG.User.latitude || CFG.User.longitude);
    },

    probeDevice: function () {

      function onMotion (event) {
        if (event.accelerationIncludingGravity.x !== null) {
          CFG.Device.canOrientation = true;
          TIM.step('CFG.device', 'devicemotion detected', 'interval', event.interval)
        }
        window.removeEventListener('devicemotion', onMotion, false);
      }

      function onOrientation (event) {
        if (event.alpha !== null) {
          CFG.Device.canOrientation = true;
          TIM.step('CFG.device', 'deviceorientation detected', 'absolute', event.absolute);
        }
        window.removeEventListener('deviceorientation', onOrientation, false);
      }

      function ondeviceproximity (event) {
        CFG.Device.canDeviceProximitry = true;
        TIM.step('CFG.device', 'deviceproximity detected', event);
        window.removeEventListener('deviceproximity', ondeviceproximity, false);
      }

      function onuserproximity (event) {
        CFG.Device.canUserProximitry = true;
        TIM.step('CFG.device', 'userproximity detected', event);
        window.removeEventListener('userproximity', onuserproximity, false);
      }

      window.addEventListener('devicemotion',      onMotion, false);
      window.addEventListener('deviceorientation', onOrientation, false);
      window.addEventListener('deviceproximity',   ondeviceproximity, false);
      window.addEventListener('userproximity',     onuserproximity, false);


      // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

      var 
        isOpera   = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
        isFirefox = typeof InstallTrigger !== 'undefined',
        isSafari  = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === '[object SafariRemoteNotification]'; })(!window['safari'] || safari.pushNotification),
        isIE      = /*@cc_on!@*/false || !!document.documentMode,
        isEdge    = !isIE && !!window.StyleMedia,
        isChrome  = !!window.chrome && !!window.chrome.webstore,isBlink = (isChrome || isOpera) && !!window.CSS
      ;

      CFG.Device.browser = (
        isOpera   ? 'Opera'   :
        isFirefox ? 'Forefox' :
        isSafari  ? 'Safari'  :
        isIE      ? 'IE'      :
        isEdge    ? 'Edge'    :
        isChrome  ? 'Chrome'  :
        isBlink   ? 'Blink'   :
          'unknown'
      );

    },

    initStore: function () {

      var 
        now = moment(), 
        timestamp = store.get('timestamp'), 
        duration;

      window.onunload = function () {
        store.set('timestamp', moment().valueOf());
      }

      if (!timestamp){
        TIM.step('DBS.init', 'new user detected')
        store.clearAll();
        store.set('timestamp', now.valueOf());
      
      } else {
        duration = moment.duration(now.valueOf() - timestamp);
        TIM.step('DBS.init', 'last use ' + duration.humanize() + ' ago');

      }

    },

    sanitizeUrl: function () {

      var [locHash, locTime, locCoords] = location.pathname.slice(1).split('/');

      // Assets from URL
      if (locHash) {
        // 0 => default value
        assets = locHash === '0' ? [] : self.hash2assets(String(locHash));
      }

      // TODO: ensure at least some visibility
      // Assets failsafe
      if (!assets.length){
        assets = [
          CFG.Objects.background.id,
          CFG.Objects.ambient.id,
          CFG.Objects.spot.id,
          CFG.Objects.sun.id,
          CFG.Objects.basemaps.id,
        ];
      }

      // DateTime from URL
      // TODO: ensure within range
      if (locTime) {
        simtime = moment.utc(locTime, 'YYYY-MM-DD-HH-mm');
        if (!simtime.isValid()) {
          simtime = undefined;
        }
      }

      // DateTime failsafe
      if (!simtime) {
        simtime = TIMENOW ? TIMENOW : moment.utc();
      }

      // Coords from URL
      if (locCoords) {
        simcoords = locCoords.split(';').map(Number);
        if (simcoords.length === 3){
          position = new THREE.Vector3().add({
            x: simcoords[0] !== undefined ? simcoords[0] : 2.0,
            y: simcoords[1] !== undefined ? simcoords[1] : 2.0,
            z: simcoords[2] !== undefined ? simcoords[2] : 2.0,
          });
        }
      }

      // Coords failsafe
      if (!position) {
        position = TOOLS.latLongToVector3(
          CFG.User.latitude,
          CFG.User.longitude,
          CFG.earth.radius,
          3
        )
      }

      // overwrite position outside earth from defaults
      if (position.length() < CFG.earth.radius + 0.01){
        position = CFG.Camera.pos.clone();
      }

    },

    number2assets: function(digits){ 

      // CFG.number2assets(0xFFFFFFFF)

      var i, assets = [];

      function bit (i, test) {return (i & (1 << test));}

      for (i = 0; i < 32; i++){
        if (bit(digits, i)){assets.push(i);}
      }

      return assets.sort( (a, b) => a - b );

    },
    hash2assets: function(hash){

      var i, digits, assets = [];

      digits = H.Base62.toNumber(String(hash));

      function bit (i, test) {return (i & (1 << test));}

      for (i = 0; i < 32; i++){
        if (bit(digits, i)){assets.push(i);}
      }

      return assets.sort( (a, b) => a - b );

    },

    assets2hash: function(assets){

      var out = 0;

      if (!assets.length) {return null;}

      assets.forEach(function(l){
        out += 1 << l;
      });

      return H.Base62.fromNumber(out);

    },

    debug: function ( /* args */ ) {

      var 
        out  = {}, 
        args = [...arguments],
        has  = function (a, item) {
          return a.indexOf(item) !== -1;
        };

      H.each(CFG.Objects, (name, cfg) => {

        out[name] = {id: cfg.id || '-'};

        H.each(cfg, (option, value) => {

          if (option === 'id' || has(args, option)) {
            out[name][option] = value;
          }

        });

      });

      console.log(JSON.stringify(out, null, 2));

    }

  };

}()).boot();

CFG.Sprites = {

  // SPACETIME

  logo: {
    visible:  true,
    type:     'link',
    menu:     false,
    position: {
      zIndex:    5,
      top:       2,
      left:      12,
      width:    64,
      height:   64,
    },
    material: {
      opacity: 0.9,
      // image: 'arcticio.logo.512.png'
      image: 'logo.128.png'
    },
    onclick: (sprite) => {
      location.reload();
      // $('#arcticio')[0].click();
      console.log('sprite.click', sprite.name);
    },
  },

  reload: {
    visible:  false,
    type:     'toggle',
    menu:     false,
    position: {
      zIndex:    5,
      bottom:   18,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.7,
      image: 'hud/reload.png'
    },
    onclick: (sprite) => {
      location.reload();
      console.log('sprite.click', sprite.name);
    },
  },

  topbackdrop: {
    visible:  true,
    type:     'backdrop',
    hover:    false,
    menu:     false,
    position: {
      zIndex:       4.9,
      top:          0,
      width:        '100%',
      height:       72,
    },
    material: {
      color:  new THREE.Color(0x444444),
      opacity: 0.5,
    },
  },

  performance: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    back:     document.createElement('CANVAS'),
    position: {
      zIndex:     5,
      bottom:    18,
      right:     18,
      width:    128,
      height:    64,
    },
    material: {
      opacity: 0.9,
    },
    onclick: (sprite) => {
      sprite.widget.selectModus();
      console.log('sprite.clicked', sprite.name);
    },
  },

  time: {
    visible:  true,
    hover:    false,
    menu:     false,
    canvas:   document.createElement('CANVAS'),
    position: {
      zIndex:    5,
      top:       4,
      center:   'x',
      width:    256,
      height:   64,
    },
    material: {
      opacity: 0.7,
    },
    onclick: (sprite) => {
      console.log('sprite.clicked', sprite.name);
    },
  },


  // SPACETIME

  spacetime: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    toggled:  false,
    canvas:   document.createElement('CANVAS'),
    position: {
      zIndex:    5,
      top:      80,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.6,
      image: 'hud/space.png'
    },
    onclick: (sprite) => {
      IFC.toggleSpaceTime();
      sprite.toggled = !sprite.toggled;
      console.log('sprite.click', sprite.name);
    },
  },


  // MENU
  
  hamburger: {
    visible:  true,
    type:     'toggle',
    menu:     false,
    toggled:  false,
    position: {
      zIndex:    5,
      top:      10,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/hamburger.png'
    },
    onclick: (sprite) => {
      IFC.Hud.toggleMenu();
      sprite.toggled = !sprite.toggled;
      // console.log('sprite.click', sprite.name);
    },
  },


  // horizontal 

  fullscreen: {
    type:           'toggle',
    menu:           true,
    visible:        screenfull.enabled,
    toggled:        screenfull.isFullscreen,
    position: {
      zIndex:       5,
      top:          180,
      right:        18,
      width:        48,
      height:       48,
    },
    material: {
      opacity:      0.5,
      image:        'hud/fullscreen.png'
    },
    onclick: (sprite) => {
      screenfull.toggle(document.querySelectorAll('.fullscreen')[0]);
      sprite.toggled = !sprite.toggled;
    },
  },

  movie: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:     5,
      top:       240,
      right:     18,
      width:     48,
      height:    48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/movie.png'
    },
    onclick: (sprite) => {
      IFC.Tools.takeScreenShot();
      console.log('sprite.click', sprite.name);
    },
  },

  info: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     300,
      right:    18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/info.png'
    },
    onclick: (sprite) => {
      // document.getElementById('#homelink').click();
      $('#homelink')[0].click();
    },
  },

  gear: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     80,
      left:    18,
      width:   48,
      height:  48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/gear.png'
    },
    onclick: (sprite) => {
      IFC.toggleGUI();
      console.log('sprite.clicked', sprite.name);
    },
  },


  // MENU, Layers vertical

  mask: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     180,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/mask.png'
    },
    onclick: (sprite) => {
      SCN.toggleBasemap('mask');
      sprite.toggled = !sprite.toggled;
    },
  },

  snpp: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     180,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/satellite.png'
    },
    onclick: (sprite) => {
      SCN.toggleBasemap('snpp');
      sprite.toggled = !sprite.toggled;
    },
  },

  tmp2m: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     240,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/temperature.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.tmp2m);
      sprite.toggled = !sprite.toggled;
      // console.log('sprite.clicked', sprite.name);
    },
  },

  clouds: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     300,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/clouds.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.jetstream);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  rain: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     300,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/rain.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.pratesfc);
      sprite.toggled = !sprite.toggled;
    },
  },

  snow: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     360,
      left:     18,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/snow.png'
    },
    onclick: (sprite) => {
      // SCN.toggle(SCN.objects.snow);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  seaice: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     360,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/seaice.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.seaice);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  sst: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     240,
      left:     80,
      width:    48,
      height:   48,
    },
    material: {
      opacity: 0.5,
      image: 'hud/sst.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.sst);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  population: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     420,
      left:     15,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/population.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.population);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },

  graticule: {
    visible:  true,
    menu:     true,
    type:     'toggle',
    toggled:  false,
    position: {
      zIndex:    5,
      top:     480,
      left:     15,
      width:    54,
      height:   54,
    },
    material: {
      opacity: 0.5,
      image: 'hud/graticule.png'
    },
    onclick: (sprite) => {
      SCN.toggle(SCN.objects.graticule);
      sprite.toggled = !sprite.toggled;
      console.log('sprite.clicked', sprite.name);
    },
  },


};

CFG.Objects = {

// MANDATORY => (no id)

    // click mesh for raycaster
    pointer: {
      title:          'pointer',
      type:           'mesh',
      mesh:           new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS - 0.01, 16, 16),                  
        new THREE.MeshBasicMaterial({
          color:     0x330000,
          wireframe: true,
          transparent: true,
          opacity: 0.1
        })
      ),
    },

    background: {
      title:          'dynamic background',
      type:           'mesh.module',
      size:           4.0,
      colors: [
        0x666666,
        0x666666,
        0x222222,
        0x222222,
      ]
    },

  // LIGHTS ( 1 - 3 )

    ambient: {
      title:          'ambient light',
      type:           'light',
      color:          0xffffff,
      intensity:      0.1,
      light:          (cfg) => new THREE.AmbientLight( cfg.color, cfg.intensity )
    },

    spot:    {
      title:          'spot light',
      type:           'light',
      color:          0xffffff, 
      intensity:      0.9, // no 0 here
      distance:       0.0, 
      angle:          0.3, 
      penumbra:       0.1, 
      decay:          0.0,
      light:          (cfg) => new THREE.SpotLight(cfg.color, cfg.intensity, cfg.distance, cfg.angle, cfg.penumbra),
      pos:            new THREE.Vector3(0, 4, 0),
    },

    sun: {
      title:          'directional light',
      type:           'light',
      skycolor:       0xffddaa, // reddish
      grdcolor:       0x8989c3, // blueish
      intensity:      0.4, 
      light:          (cfg) => new THREE.HemisphereLight( cfg.skycolor, cfg.grdcolor, cfg.intensity ),
      pos:            new THREE.Vector3(2, 2, 2),
    },

    basemaps: {
      title:          'basic surface mask',
      type:           'mesh.module',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS, 
        // texture:       'images/data/globe.data.FACE.4096.comp.png', 
        texture:       'images/data/globe.data.FACE.512.comp.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

// OPTIONALS

  // VISUALS ( 5 - 6 )

    graticule: {
      id:             5,
      visible:        false,
      title:          'graticule',
      type:           'mesh.calculated',
      altitude:       0.01,
      resolution:     10,
      material: {
        transparent:  true,
        opacity:      0.2,
        color:        0xdddddd,
        // linewidth:    1.1,
        // vertexColors: THREE.NoColors,
        // lights:       true, // errors with material
      }
    },

    atmosphere: {
      id:             6,
      visible:        false,
      title:          'atmosphere',
      type:           'mesh.module',
      radius:         RADIUS + LEVEL_7,
      rotation:       [0, Math.PI * 0.5, 0],
      opacity:        0.5,
    },


  // BASEMAPS ( 9 - 11 )

    basecopy: {
      id:              9,
      visible:         false,
      title:          'simple surface layer',
      type:           'mesh.module',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/gmlc/globe.gmlc.FACE.512.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    rtopo2: {
      id:              10,
      visible:         false,
      title:          'RTOPO2 surface layer',
      type:            'cube.textured',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/rtopo2/globe.rtopo2.FACE.4096.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    gmlc: {
      id:             11,
      visible:         false,
      title:          'GLCNMO - vegetation layer',
      type:            'cube.textured',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'normal',
      cube: {
        type:          'globe',
        radius:        RADIUS + 0.01, 
        texture:       'images/gmlc/globe.gmlc.FACE.4096.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },


  // OBSERVATIONS ( 14 - 20 )

    snpp: {
      id:             14,
      visible:         false,
      type:           'cube.textured',
      title:            'SNPP - satellite surface layer',
      rotation:        [0, Math.PI / 2, 0],
      lightset:       'snpp',
      cube: {
        type:          'globe',
        radius:        RADIUS + LEVEL_1, 
        texture:       'data/snpp/2017-06-15.globe.snpp.FACE.2048.jpg', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },


    sst: {
      id:             15,
      visible:        false,
      title:          'sea surface temperature',
      type:           'cube.textured',
      rotation:       [0, Math.PI / 2, 0],
      cube: {
        type:         'globe',
        radius:       RADIUS + LEVEL_2, 
        texture:      'data/sst/2017-06-13.globe.sst.FACE.1024.png', 
        material: {
          transparent: true, 
          opacity:     0.50,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    seaice: {
      id:              16,
      visible:         false,
      title:           'AMSR2 sea ice concentration',
      type:            'cube.textured',
      rotation:        [0, Math.PI * 0.5, 0],
      cube: {
        type:          'polar',
        radius:        RADIUS + LEVEL_3, 
        texture:       'data/amsr2/2017-06-13.polar.amsr2.FACE.1024.grey.trans.png', 
        material: {
          transparent: true, 
          opacity:     0.99,              // removes crazy seaice effeckt
          side:        THREE.DoubleSide,
        }
      }
    },

    wind: {
      id:             17,
      visible:        false,
      title:          'GFS - wind 10m',
      type:           'simulation',
      subtype:        'multiline',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_4, 
      color:          new THREE.Color('#ff0000'),
      opacity:        0.5,
      lineWidth:      RADIUS * Math.PI / 180 * 0.2,
      section:        33 * 1/60,
      length:         60,
      amount:         512,
      sim: {
        data: [
          'data/gfs/tmp2m/2017-06-13-12.tmp2m.10.dods',
          'data/gfs/ugrd10m/2017-06-13-12.ugrd10m.10.dods',
          'data/gfs/vgrd10m/2017-06-13-12.vgrd10m.10.dods',
        ],
        sectors: [
          [ 89.9, -180,  45.0,  180 ], // top
          [-45.0, -180, -89.9,  180 ], // bottom
          [ 45.0, -180, -45.0,  -90 ], // left back
          [ 45.0,  -90, -45.0,    0 ], // left front
          [ 45.0,    0, -45.0,   90 ], // right front
          [ 45.0,   90, -45.0,  180 ], // right back
        ],
      }
    },

    jetstream: {
      id:             18,
      visible:        false,
      title:          'GFS - jetstream at 300hpa',
      type:           'simulation',
      subtype:        'multiline',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_6, 
      color:          new THREE.Color('#ff0000'),
      opacity:        0.8,
      lineWidth:      RADIUS * Math.PI / 180 * 0.1,
      section:        33 * 1/60,
      length:         60,
      amount:         512,
      hue:            220,
      sim: {
        dataroot:     'data/gfs/',
        patterns: [
          '[ugrdprs/]YYYY-MM-DD-HH[.ugrdprs.10.dods]',
          '[vgrdprs/]YYYY-MM-DD-HH[.vgrdprs.10.dods]',
        ],
        // data: [
        //   'data/gfs/ugrdprs/2017-06-13-12.ugrdprs.10.dods',
        //   'data/gfs/vgrdprs/2017-06-13-12.vgrdprs.10.dods',
        //   // 'data/gfs/DATETIME.ugrdprs.10.dods',
        //   // 'data/gfs/DATETIME.vgrdprs.10.dods',
        // ],
        sectors: [
          [ 89.9, -180,  45.0,  180 ], // top
          [-45.0, -180, -89.9,  180 ], // bottom
          [ 45.0, -180, -45.0,  -90 ], // left back
          [ 45.0,  -90, -45.0,    0 ], // left front
          [ 45.0,    0, -45.0,   90 ], // right front
          [ 45.0,   90, -45.0,  180 ], // right back
        ],
      }
    },

    clouds: {
      id:             19,
      visible:        false,
      title:          'GFS - total cloud cover',
      type:           'simulation',
      rotation:       [0, Math.PI, 0],
      radius:         RADIUS + LEVEL_5, 
      amount:         1e5,
      size:           8.0,
      sim: {
        dataroot:     'data/gfs/tcdcclm/',
        patterns: [
          'YYYY-MM-DD-HH[.tcdcclm.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
        ],
        sectors: [
          [ 89.99, -180.0,  -89.99,  180.0 ], // all
        ],
      }
    },

    variables: {
      id:             20,
      visible:        false,
      title:          'GFS - generic layer',
      type:           'simulation',
      rotation:       [0, PI - PI/360, 0],
      radius:         RADIUS + LEVEL_4, 
      sim: {
        variable:     'tmp2m',
        dataroot:     'data/gfs/tmp2m/',
        patterns: [
          // '[landsfc.1.00.dods]', // '2017-06-13-12.tcdcclm.10.dods',
          'YYYY-MM-DD-HH[.tmp2m.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',

        ],
      }
    },

    tmp2m: {
      id:             21,
      visible:        false,
      title:          'GFS - air temperature at 2m',
      type:           'simulation',
      geometry:       new THREE.SphereBufferGeometry(RADIUS + LEVEL_4, 64, 32),
      rotation:       [0, PI - PI/360, 0],
      radius:         RADIUS + LEVEL_4, 
      opacity:        0.5,
      sim: {
        variable:     'tmp2m',
        step:         [6, 'hours'],
        dataroot:     'data/gfs/tmp2m/',
        patterns: [
          'YYYY-MM-DD-HH[.tmp2m.10.dods]', 
        ],
        palette: {
          '-30' : new THREE.Color(0xaa66aa), // violet dark,
          '-20' : new THREE.Color(0xce9be5), // violet,
          '-10' : new THREE.Color(0x76cee2), // blue,
          '  0' : new THREE.Color(0x6cef6c), // green,
          '+10' : new THREE.Color(0xedf96c), // yellow,
          '+20' : new THREE.Color(0xffbb55), // orange,
          '+30' : new THREE.Color(0xfb654e), // red,
          '+40' : new THREE.Color(0xcc4040), // dark red,
          '999' : new THREE.Color(0xbb20ff), // very dark red,
        }
      }
    },

    pratesfc: {
      id:             22,
      visible:        false,
      title:          'GFS - surface precipitation rate',
      type:           'simulation',
      rotation:       [0, PI - PI/360, 0],
      radius:         RADIUS + LEVEL_4, 
      sim: {
        variable:     'pratesfc',
        dataroot:     'data/gfs/pratesfc/',
        patterns: [
          'YYYY-MM-DD-HH[.pratesfc.10.dods]', // '2017-06-13-12.tcdcclm.10.dods',
        ],
      }
    },


  // FEATURES ( 23 - 25 )

    land: {
      id:             23,
      visible:        false,
      title:          'geojson land',
      radius:         RADIUS + LEVEL_3,
      type:           'geo.json',
      rotation:       [0, Math.PI / 2, 0],
      json:           'data/json/countries_states.geojson',
      color:          new THREE.Color('#888888'),
    },

    rivers: {
      id:             24,
      visible:        false,
      title:          'geojson rivers',
      type:           'geo.json',
      radius:         RADIUS + LEVEL_3,
      rotation:       [0, Math.PI / 2, 0],
      json:           'data/json/rivers.geojson',
      color:          new THREE.Color('#888888'),
    },

    population: {
      id:             25,
      visible:        false,
      title:          '3000 cities',
      type:           'mesh.module',
      altitude:       LEVEL_0,
      opacity:        0.8,
      radius:         RADIUS,
      color:          new THREE.Color(0xff00ff),
    },


  // OPTIONAL / DEV ( 26 - 28 )

    sector: {
      id:             27,
      visible:        false,
      title:          'sector marker',
      type:           'mesh.calculated',
      altitude:       LEVEL_6,
      resolution:     1,
      sector:         [15, -15, -15, 15],
      material: {
        transparent:  true,
        opacity:      0.8,
        color:        0xff00ff,
        linewidth:    1.1,
        vertexColors: THREE.NoColors,
      }
    },

    axes: {
      id:             28,
      visible:        false,
      title:          '3D axes',
      type:           'mesh',
      mesh:           new THREE.AxisHelper( RADIUS * 4 ),
    },

    pixels: {
      id:              30,
      visible:        false,
      type:            'mesh.module',
      title:           'experiment',
      texture:         'tex7.jpg',
    }
    
    // // lat lon pointer of click marker
    // arrowHelper: {
    //   visible:        false,
    //   title:          'arrow helper',
    //   type:           'mesh',
    //   mesh:           new THREE.ArrowHelper( 
    //                   new THREE.Vector3( 1, 1,  1), 
    //                   new THREE.Vector3( 0, 0,  0), 
    //                   RADIUS + 0.08, 
    //                   0xffff00
    //   )
    // },

    // sunPointer: {
    //   // sun dir pointer
    //   visible:        false,
    //   title:          'sun pointer',
    //   type:           'mesh',
    //   mesh:           new THREE.ArrowHelper( 
    //                     new THREE.Vector3( 1, 1,  1), 
    //                     new THREE.Vector3( 0,  0,  0), 
    //                     RADIUS + 0.2, 
    //                     0xff0000
    //   )
    // },

};

'use strict'

CFG.Preset = {

  init: function () {

    Object.assign(CFG.Preset, {

      Render:         true,
      // Animate:        true,
      // Simulate:       true,

      Reload:         () => location.reload(),
      ResetCam:       () => SCN.reset.controller(),

      Ambient: { isFolder: true,
        toggle:       CFG.Objects.ambient.visible,
        intensity:    {val: CFG.Objects.ambient.intensity, min: 0, max: 1},
        color:        '#ffffff'
      },

      Spot: { isFolder: true,
        toggle:       CFG.Objects.spot.visible,
        angle:        {val: 0.26, min: 0, max: 0.5},
        intensity:    {val: CFG.Objects.spot.intensity, min: 0, max: 1},
        color:        '#ffffff'
      },

      Sun: { isFolder: true,
        toggle:       CFG.Objects.sun.visible,
        intensity:    {val: CFG.Objects.sun.intensity, min: 0, max: 1},
        skycolor:     CFG.Objects.sun.skycolor,
        grdcolor:     CFG.Objects.sun.grdcolor,
      },

      Atmosphere: { isFolder: true,
        toggle:       CFG.Objects.atmosphere.visible,
        opacity:      {val: CFG.Objects.atmosphere.opacity, min: 0, max: 1},
      },

      Assets: (function () {

        var layers = {isFolder: true};

        H.each(CFG.Objects, (name, config) => {
          if (config.id) {
            layers[name.toUpperCase()] = CFG.Objects[name].visible;
          }
        });

        return layers;

      }()),

      DateTime : { isFolder:    true,
        choose:     {val: 3, min: 0, max: 365 * 24 -1, step: 1},
        'hour  +1': () => {},
        'hour  -1': () => {},
        'hour  +6': () => {},
        'hour  -6': () => {},
        'hour +24': () => {},
        'hour -24': () => {},
        'day  +30': () => {},
        'day  -30': () => {},
      },

      Animations: { isFolder:   true,
        Rotate:     () => {},
      },

    })
  
  }
};


var SIM = (function () {

  var 
    self,

    $$             = document.querySelectorAll.bind(document),

    image          = $$('.panel.image')[0],  // debug sun

    coordsPool     = null, 

    models         = {},
    datagrams      = {}, // all models share GFS data

    sun            = Orb.SolarSystem().Sun(),
    sunVector      = new THREE.Vector3(),             // pos of real sun
    sunDirection   = new THREE.Vector3(),             // dir of real sun
    sunSphererical = new THREE.Spherical(4, 0, -PI2),
    sunPosition    = new THREE.Vector3(),             // pos of lights 

    timeranges     = dataTimeRanges['hypatia'],       // timeranges.js

    time = {
      iso:         '',
      doe:         NaN,
      start:       moment.utc('2017-01-01-00', 'YYYY-MM-DD-HH'),  // give full year, no purpose
      end:         moment.utc('2017-12-31-18', 'YYYY-MM-DD-HH'),  // complete full year
      now:         moment.utc(),                                  // now, plus init show
      model:       null,
      range:       H.range(-12, 66, 6),
      stamps:      null,
      mindoe:      NaN,
      maxdoe:      NaN,
      fmtDay:      '',
      fmtHour:     '',
    }

  ;

  return self = {

    Models: {},

    time,
    models,
    datagrams,
    coordsPool,
    sunVector,
    sunPosition,
    sunDirection,

    calcdoe: function (mom) {
      // mom = mom.clone().hours(mom.hours() - (mom.hours() % 6));  // rstrict now at avail dods
      return H.date2doeFloat(mom.toDate());
    },
    mom2doe: function (mom) {return mom.toDate() / 864e5},
    doe2mom: function (doe) {return moment.utc(doe * 864e5)},

    init: function () {

      var t0 = Date.now();

      coordsPool = self.coordsPool = new CoordsPool(CFG.Sim.coordspool.amount).generate();

      TIM.step('Pool.generate', Date.now() - t0, 'ms', CFG.Sim.coordspool.amount);

      time.interval = 6 * 60 * 60 * 1000; //SIM.Tools.minutesYear() * 60;

      time.now   = TIMENOW.clone();
      time.model = TIMENOW.clone();
      time.doe   = self.calcdoe(time.model);

      // TIM.step('SIM.time', 'time.now',   time.now.format('YYYY-MM-DD HH[:]mm'));
      // TIM.step('SIM.time', 'time.model', time.model.format('YYYY-MM-DD HH[:]mm'));

    },
    setSimTime: function (val, what) {

      var mom;

      if (val === undefined && what === undefined) {

        // init, rstrict now at avail dods

        mom         = TIMENOW;
        time.model  = mom.clone().hours(mom.hours() - (mom.hours() % 6));  
        time.stamps = time.range.map( h => time.model.clone().add( h, 'hours') );
        time.length = time.stamps.length;

        time.mindoe = self.mom2doe(time.stamps[0]);
        time.maxdoe = self.mom2doe(time.stamps.slice(-1)[0]);

        // console.log('SIM', 0, time.stamps[0].format('YYYY-MM-DD-HH'), time.mindoe);
        // console.log('SIM', time.length -1, time.stamps[time.length -1].format('YYYY-MM-DD-HH'), time.maxdoe);


      } else if (typeof val === 'number' && what === undefined) {

        // set hours directly
        time.model = time.start.clone().add(val, 'hours');

      } else if (typeof val === 'number' && ['minutes', 'hours', 'days'].indexOf(what) !== -1 ) {

        // add/sub some diff
        // time.show = time.start.clone().add(val, what);
        time.model.add(val, what);

      } else if (typeof val === 'number') {

        // set some delta
        debugger;
        time.model.add(val, what);
      
      } else if (val._isAMomentObject) {

        // have a moment
        time.model = val.clone();

      } else {
        debugger;
        console.log('WTF');

      }

      // don't overshoot

      time.model = (
        time.model.valueOf() > time.stamps[time.stamps.length -1].valueOf() ?
          time.stamps[time.stamps.length -1] :
          time.model
      );

      // display
      time.iso = time.model.format('YYYY-MM-DD HH');

      // gfs data
      time.doe = self.mom2doe(time.model);

      // hud
      time.fmtDay  = time.model.format('YYYY-MM-DD');
      time.fmtHour = time.model.format('HH:mm [UTC]');

      // self.updateSun();

      IFC.urlDirty = true;

    },

    updateSun: function () {

      // TODO: adjust for ra
      // https://www.timeanddate.com/scripts/sunmap.php?iso=20170527T1200
      // image && (image.src = '//www.timeanddate.com/scripts/sunmap.php?iso=' + time.show.format('YYYYMMDD[T]HHmm'));

      var orbTime, orbSun, theta, phi;

      // query sun by time
      orbTime = new Orb.Time(time.model.toDate());
      orbSun  = sun.position.equatorial(orbTime);
      theta   = (time.model.hour() + time.model.minutes() / 60) * (Math.PI / 12);
      phi     = orbSun.dec * Math.PI / 180 - Math.PI / 2;

      //  Spherical( radius, phi, theta )
      sunSphererical.set(4, 0, -PI / 2);
      sunSphererical.theta -= theta;
      sunSphererical.phi   -= phi;

      // updates
      sunVector.setFromSpherical(sunSphererical);
      sunDirection.copy(sunVector).normalize();
      sunPosition.copy(sunDirection).multiplyScalar(CFG.Sun.radius);

    },
    calcVariTimes: function (name, cfg) {

      var range = timeranges[name];

      var 
        range = timeranges[name],
        step  = cfg.sim.step,
        times = {
          mindoe: NaN,
          maxdoe: NaN,
          does:   [],
          moms:   [],
        },
        mom      = moment.utc(range[0], 'YYYY-MM-DD-HH'),
        momLast  = moment.utc(range[1], 'YYYY-MM-DD-HH')
      ;

      while (mom.valueOf() <= momLast.valueOf()) {
        times.moms.push(mom.clone());
        times.does.push(SIM.mom2doe(mom));
        mom.add(step[0], step[1]);
      }

      times.length = times.does.length;
      times.mindoe = times.does[0];
      times.maxdoe = times.does[times.length -1];

      TIM.step('SIM.times', name, range, times.length, times.mindoe, times.maxdoe);

      return times;

    },
    loadVariable: function (name, cfg, callback) {

      !SIM.Models[name] && console.log('Model: "' + name + '" not avail, have:', Object.keys(SIM.Models));

      var 
        vari, 
        datagramm,
        times = self.calcVariTimes(name, cfg),
        model = SIM.Models[name].create(cfg, times)
      ;

      models[name] = model;

      RES.load({ urls: model.urls, onFinish: function (err, responses) {

        if (err) { throw err } else {

          responses.forEach(function (response) {

            datagramm = new SIM.Datagram(response.data);
            vari = datagramm.vari;

            if (!datagrams[vari]) {
              datagrams[vari] = datagramm;

            } else {
              datagrams[vari].append(datagramm);

            }

          });

          model.prepare();
          
          TIM.step('SIM.load', vari, time.doe);

          // return 3D object to scene
          callback(name, models[name].obj);

        }

      }});    

    },

  };

}());

/*

// https://stackoverflow.com/questions/44098678/how-to-rotate-a-vector3-using-vector2

//  For winds, the u wind is parallel to the x axis. 
// A positive u wind is from the west. 
// A negative u wind is from the east. 
// The v wind runs parallel to the y axis. 
// A positive v wind is from the south, and a negative v wind is from the north.

*//*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals  SIM, */

SIM.Vars = {

    tmp2m : {
        color: '#C24642',
        legend: 'Temperature (2m, °C)',
        axis: 'primary',
        letter: 'T',
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: 'Temperature, 2m',
        description: '2 m above ground temperature [k]',
        wiki: null
    },
    prmslmsl : {
        color: '#369EAD',
        legend: 'Pressure (msl)',
        axis: 'secondary',
        letter: 'P',
        unit: 'hpa',
        range: [950, 1050],
        adjust: function(d){return d/100;},
        name: 'Sea Level Pressure',
        description: 'mean sea level pressure reduced to msl [hpa]',
        wiki: null
    },
    apcpsfc : {
        color: '#76cee2',
        legend: 'Precipitation (kg/m^2)',
        axis: 'primary',
        letter: 'PC',
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'surface total precipitation [kg/m^2]',
        wiki: null
    },
    gustsfc : {
        range: [0, 30],
        color: '#6cef6c',
        legend: 'SFC wind speed (gust, m/s)',
        axis: 'secondary',
        letter: 'G',
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'surface wind speed (gust) [m/s] ',
        wiki: null
    },
    dlwrfsfc : {
        range: [0, 0.5, 1.0, 1.5],
        color: '#ffbb55',
        legend: 'Long wave (down, kw/m^2)',
        axis: 'primary',
        letter: 'LW',
        unit: 'kw/m^2',
        adjust: function(d){return d/1000;},
        name: null,
        description: 'surface downward long-wave rad. flux [w/m^2]',
        wiki: null
    },
    dswrfsfc : {
        range: [0, 0.5, 1.0, 1.5],
        color: '#ce9be5',
        legend: 'Short wave (down, kw/m^2)',
        axis: 'secondary',
        letter: 'SW',
        unit: 'kw/m^2',
        adjust: function(d){return d/1000;},
        name: null,
        description: 'surface downward short-wave rad. flux [w/m^2]',
        wiki: null
    },






    absvprs : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 7 5 3 2 1) absolute vorticity [1/s]',
        wiki: null
    },
    no4lftxsfc : {
        unit: 'k',
        adjust: null,
        name: null,
        description: 'surface best (4 layer) lifted index [k]',
        wiki: 'http://en.wikipedia.org/wiki/Lifted_index'
    },
    no5wava500mb : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '500 mb 5-wave geopotential height anomaly [gpm]',
        wiki: null
    },
    no5wavh500mb : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '500 mb 5-wave geopotential height [gpm]',
        wiki: null
    },
    acpcpsfc : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'surface convective precipitation [kg/m^2]',
        wiki: null
    },
    albdosfc : {
        unit: '%',
        adjust: null,
        name: 'Albedo',
        description: 'surface albedo [%]',
        wiki: null
    },
    capesfc : {
        unit: 'j/kg',
        adjust: null,
        name: null,
        description: 'surface convective available potential energy [j/kg]',
        wiki: null
    },
    cape180_0mb : {
        unit: 'j/kg',
        adjust: null,
        name: null,
        description: '180-0 mb above ground convective available potential energy [j/kg]',
        wiki: null
    },
    cduvbsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface clear sky uv-b downward solar flux [w/m^2]',
        wiki: null
    },
    cfrzrsfc : {
        unit: 'non-dim',
        adjust: null,
        name: null,
        description: 'surface categorical freezing rain (yes=1; no=0) [non-dim]',
        wiki: null
    },
    cicepsfc : {
        unit: 'non-dim',
        adjust: null,
        name: null,
        description: 'surface categorical ice pellets (yes=1; no=0) [non-dim]',
        wiki: null
    },
    cinsfc : {
        unit: 'j/kg',
        adjust: null,
        name: null,
        description: 'surface convective inhibition [j/kg]',
        wiki: 'http://en.wikipedia.org/wiki/Convective_inhibition'
    },
    cin180_0mb : {
        unit: 'j/kg',
        adjust: null,
        name: null,
        description: '180-0 mb above ground convective inhibition [j/kg]',
        wiki: 'http://en.wikipedia.org/wiki/Convective_inhibition'
    },
    clwmrprs : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 200 175 150 125 100) cloud mixing ratio [kg/kg]',
        wiki: null
    },
    cnwatsfc : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'surface plant canopy surface water [kg/m^2]',
        wiki: null
    },
    cpratsfc : {
        unit: 'kg/m^2/s',
        adjust: null,
        name: null,
        description: 'surface convective precipitation rate [kg/m^2/s]',
        wiki: null
    },
    crainsfc : {
        unit: 'non-dim',
        adjust: null,
        name: null,
        description: 'surface categorical rain (yes=1; no=0) [non-dim]',
        wiki: null
    },
    csnowsfc : {
        unit: 'non-dim',
        adjust: null,
        name: 'Snow Cover',
        description: 'surface categorical snow (yes=1; no=0) [non-dim]',
        wiki: null
    },
    cwatclm : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'entire atmosphere (considered as a single layer) cloud water [kg/m^2]',
        wiki: null
    },
    cworkclm : {
        unit: 'j/kg',
        adjust: null,
        name: null,
        description: 'entire atmosphere (considered as a single layer) cloud work function [j/kg]',
        wiki: null
    },
    duvbsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface uv-b downward solar flux [w/m^2]',
        wiki: null
    },
    fldcpsfc : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: 'surface field capacity [fraction]',
        wiki: null
    },
    gfluxsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: 'Ground Flux',
        description: 'surface ground heat flux [w/m^2]',
        wiki: null
    },
    gpa1000mb : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '1000 mb geopotential height anomaly [gpm]',
        wiki: null
    },
    gpa500mb : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '500 mb geopotential height anomaly [gpm]',
        wiki: null
    },
    hgtsfc : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'surface geopotential height [gpm]',
        wiki: null
    },
    hgtprs : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 7 5 3 2 1) geopotential height [gpm]',
        wiki: null
    },
    hgt2pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgtneg2pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgt0p5pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgtneg0p5pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgt1pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgtneg1pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgt1p5pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgtneg1p5pv : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface geopotential height [gpm]',
        wiki: null
    },
    hgttop0c : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'highest tropospheric freezing level geopotential height [gpm]',
        wiki: null
    },
    hgt0c : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: '0c isotherm geopotential height [gpm]',
        wiki: null
    },
    hgtmwl : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'max wind geopotential height [gpm]',
        wiki: null
    },
    hgttrop : {
        unit: 'gpm',
        adjust: null,
        name: null,
        description: 'tropopause geopotential height [gpm]',
        wiki: 'http://en.wikipedia.org/wiki/Tropopause'
    },
    hpblsfc : {
        unit: 'm',
        adjust: null,
        name: null,
        description: 'surface planetary boundary layer height [m]',
        wiki: 'http://en.wikipedia.org/wiki/Planetary_boundary_layer'
    },
    icecsfc : {
        unit: 'prop.',
        adjust: null,
        name: 'Sea Ice',
        description: 'surface ice cover [proportion]',
        wiki: null
    },
    icetksfc : {
        unit: 'm',
        adjust: null,
        name: 'Sea Ice Thickness',
        description: 'surface ice thickness [m]',
        wiki: null
    },
    landsfc : {
        unit: 'prop.',
        adjust: null,
        name: 'Land/Sea',
        description: 'surface land cover (1=land, 0=sea) [proportion]',
        wiki: null
    },
    lftxsfc : {
        unit: 'k',
        adjust: null,
        name: null,
        description: 'surface surface lifted index [k]',
        wiki: 'http://en.wikipedia.org/wiki/Lifted_index'
    },
    lhtflsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface latent heat net flux [w/m^2]',
        wiki: null
    },
    o3mrprs : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '(100 70 50 30 20 10 7 5 3 2 1) ozone mixing ratio [kg/kg]',
        wiki: null
    },
    pevprsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface potential evaporation rate [w/m^2]',
        wiki: null
    },
    potsig995 : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '0.995 sigma level potential temperature [k]',
        wiki: null
    },
    pratesfc : {
        unit: 'g/m^2/s',
        adjust: function(d){return d*1000;},
        name: null,
        description: 'surface precipitation rate [g/m^2/s]',
        wiki: null
    },
    preslclb : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'low cloud bottom level pressure [hpa]',
        wiki: null
    },
    preslclt : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'low cloud top level pressure [hpa]',
        wiki: null
    },
    presmclb : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'middle cloud bottom level pressure [hpa]',
        wiki: null
    },
    presmclt : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'middle cloud top level pressure [hpa]',
        wiki: null
    },
    preshclb : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'high cloud bottom level pressure [hpa]',
        wiki: null
    },
    preshclt : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'high cloud top level pressure [hpa]',
        wiki: null
    },
    pressfc : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: 'Surface Pressure',
        description: 'surface pressure [hpa]',
        wiki: null
    },
    pres2pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    presneg2pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    pres0p5pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    presneg0p5pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    pres1pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    presneg1pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    pres1p5pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    presneg1p5pv : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface pressure [hpa]',
        wiki: null
    },
    prescclb : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'convective cloud bottom level pressure [hpa]',
        wiki: null
    },
    prescclt : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'convective cloud top level pressure [hpa]',
        wiki: null
    },
    presmwl : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'max wind pressure [hpa]',
        wiki: null
    },
    prestrop : {
        unit: 'hpa',
        adjust: function(d){return d/100;},
        name: null,
        description: 'tropopause pressure [hpa]',
        wiki: null
    },
    pwatclm : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'entire atmosphere (considered as a single layer) precipitable water [kg/m^2]',
        wiki: null
    },
    rhprs : {
        unit: '%',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 200 175 150 125 100) relative humidity [%]',
        wiki: null
    },
    rh2m : {
        unit: '%',
        adjust: null,
        name: 'Humidity, 2m',
        description: '2 m above ground relative humidity [%]',
        wiki: null
    },
    rhsg330_1000 : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0.33-1 sigma layer relative humidity [%]',
        wiki: null
    },
    rhsg440_1000 : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0.44-1 sigma layer relative humidity [%]',
        wiki: null
    },
    rhsg720_940 : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0.72-0.94 sigma layer relative humidity [%]',
        wiki: null
    },
    rhsg440_720 : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0.44-0.72 sigma layer relative humidity [%]',
        wiki: null
    },
    rhsig995 : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0.995 sigma level relative humidity [%]',
        wiki: null
    },
    rh30_0mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '30-0 mb above ground relative humidity [%]',
        wiki: null
    },
    rh60_30mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '60-30 mb above ground relative humidity [%]',
        wiki: null
    },
    rh90_60mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '90-60 mb above ground relative humidity [%]',
        wiki: null
    },
    rh120_90mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '120-90 mb above ground relative humidity [%]',
        wiki: null
    },
    rh150_120mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '150-120 mb above ground relative humidity [%]',
        wiki: null
    },
    rh180_150mb : {
        unit: '%',
        adjust: null,
        name: null,
        description: '180-150 mb above ground relative humidity [%]',
        wiki: null
    },
    rhclm : {
        unit: '%',
        adjust: null,
        name: 'Humidity, Atmosphere',
        description: 'entire atmosphere (considered as a single layer) relative humidity [%]',
        wiki: null
    },
    rhtop0c : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'highest tropospheric freezing level relative humidity [%]',
        wiki: null
    },
    rh0c : {
        unit: '%',
        adjust: null,
        name: null,
        description: '0c isotherm relative humidity [%]',
        wiki: null
    },
    shtflsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface sensible heat net flux [w/m^2]',
        wiki: null
    },
    snodsfc : {
        unit: 'm',
        adjust: null,
        name: 'Snow Depth',
        description: 'surface snow depth [m]',
        wiki: null
    },
    soill0_10cm : {
        unit: 'prop.',
        adjust: null,
        name: null,
        description: '0-0.1 m below ground liquid volumetric soil moisture (non frozen) [proportion]',
        wiki: null
    },
    soill10_40cm : {
        unit: 'prop.',
        adjust: null,
        name: null,
        description: '0.1-0.4 m below ground liquid volumetric soil moisture (non frozen) [proportion]',
        wiki: null
    },
    soill40_100cm : {
        unit: 'prop.',
        adjust: null,
        name: null,
        description: '0.4-1 m below ground liquid volumetric soil moisture (non frozen) [proportion]',
        wiki: null
    },
    soill100_200cm : {
        unit: 'prop.',
        adjust: null,
        name: null,
        description: '1-2 m below ground liquid volumetric soil moisture (non frozen) [proportion]',
        wiki: null
    },
    soilw0_10cm : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: '0-0.1 m below ground volumetric soil moisture content [fraction]',
        wiki: null
    },
    soilw10_40cm : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: '0.1-0.4 m below ground volumetric soil moisture content [fraction]',
        wiki: null
    },
    soilw40_100cm : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: '0.4-1 m below ground volumetric soil moisture content [fraction]',
        wiki: null
    },
    soilw100_200cm : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: '1-2 m below ground volumetric soil moisture content [fraction]',
        wiki: null
    },
    spfhprs : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 200 175 150 125 100) specific humidity [kg/kg]',
        wiki: null
    },
    spfh2m : {
        unit: 'g/kg',
        adjust: function(d){return d*1000;},
        name: null,
        description: '2 m above ground specific humidity [g/kg]',
        wiki: null
    },
    spfh30_0mb : {
        unit: 'g/kg',
        adjust: function(d){return d*1000;},
        name: null,
        description: '30-0 mb above ground specific humidity [g/kg]',
        wiki: null
    },
    spfh60_30mb : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '60-30 mb above ground specific humidity [kg/kg]',
        wiki: null
    },
    spfh90_60mb : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '90-60 mb above ground specific humidity [kg/kg]',
        wiki: null
    },
    spfh120_90mb : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '120-90 mb above ground specific humidity [kg/kg]',
        wiki: null
    },
    spfh150_120mb : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '150-120 mb above ground specific humidity [kg/kg]',
        wiki: null
    },
    spfh180_150mb : {
        unit: 'kg/kg',
        adjust: null,
        name: null,
        description: '180-150 mb above ground specific humidity [kg/kg]',
        wiki: null
    },
    tcdcclm : {
        unit: '%',
        adjust: null,
        name: 'Cloud Cover',
        description: 'entire atmosphere (considered as a single layer) total cloud cover [%]',
        wiki: null
    },
    tcdcblcll : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'boundary layer cloud layer total cloud cover [%]',
        wiki: null
    },
    tcdclcll : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'low cloud layer total cloud cover [%]',
        wiki: null
    },
    tcdcmcll : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'middle cloud layer total cloud cover [%]',
        wiki: null
    },
    tcdchcll : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'high cloud layer total cloud cover [%]',
        wiki: null
    },
    tcdcccll : {
        unit: '%',
        adjust: null,
        name: null,
        description: 'convective cloud layer total cloud cover [%]',
        wiki: null
    },
    tmax2m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: 'Temperature, max, 2m',
        description: '2 m above ground maximum temperature [k]',
        wiki: null
    },
    tmin2m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: 'Temperature, min, 2m',
        description: '2 m above ground minimum temperature [k]',
        wiki: null
    },
    tmplclt : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'low cloud top level temperature [k]',
        wiki: null
    },
    tmpmclt : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'middle cloud top level temperature [k]',
        wiki: null
    },
    tmphclt : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'high cloud top level temperature [k]',
        wiki: null
    },
    tmpsfc : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: 'Surface Temperature',
        description: 'surface temperature [k]',
        wiki: null
    },
    tmpprs : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '(1000 975 950 925 900.. 7 5 3 2 1) temperature [k]',
        wiki: null
    },
    tmp_1829m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '1829 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_2743m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '2743 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_3658m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '3658 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_305m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '305 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_457m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '457 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_610m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '610 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_914m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '914 m above mean sea level temperature [k]',
        wiki: null
    },
    tmp_4572m : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '4572 m above mean sea level temperature [k]',
        wiki: null
    },
    tmpsig995 : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '0.995 sigma level temperature [k]',
        wiki: null
    },
    tmp0_10cm : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '0-0.1 m below ground temperature [k]',
        wiki: null
    },
    tmp10_40cm : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '0.1-0.4 m below ground temperature [k]',
        wiki: null
    },
    tmp40_100cm : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '0.4-1 m below ground temperature [k]',
        wiki: null
    },
    tmp100_200cm : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '1-2 m below ground temperature [k]',
        wiki: null
    },
    tmp30_0mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '30-0 mb above ground temperature [k]',
        wiki: null
    },
    tmp60_30mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '60-30 mb above ground temperature [k]',
        wiki: null
    },
    tmp90_60mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '90-60 mb above ground temperature [k]',
        wiki: null
    },
    tmp120_90mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '120-90 mb above ground temperature [k]',
        wiki: null
    },
    tmp150_120mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '150-120 mb above ground temperature [k]',
        wiki: null
    },
    tmp180_150mb : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: '180-150 mb above ground temperature [k]',
        wiki: null
    },
    tmp2pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmpneg2pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmp0p5pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmpneg0p5pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmp1pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmpneg1pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmp1p5pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmpneg1p5pv : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface temperature [k]',
        wiki: null
    },
    tmpmwl : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'max wind temperature [k]',
        wiki: null
    },
    tmptrop : {
        unit: 'C',
        adjust: function(d){return d-273.15;},
        name: null,
        description: 'tropopause temperature [k]',
        wiki: null
    },
    tozneclm : {
        unit: 'dobson',
        adjust: null,
        name: 'Ozone, Atmosphere',
        description: 'entire atmosphere (considered as a single layer) total ozone [dobson]',
        wiki: null
    },
    ugwdsfc : {
        unit: 'n/m^2',
        adjust: null,
        name: null,
        description: 'surface zonal flux of gravity wave stress [n/m^2]',
        wiki: 'http://en.wikipedia.org/wiki/Gravity_wave'
    },
    vgwdsfc : {
        unit: 'n/m^2',
        adjust: null,
        name: null,
        description: 'surface meridional flux of gravity wave stress [n/m^2]',
        wiki: 'http://en.wikipedia.org/wiki/Gravity_wave'
    },
    uflxsfc : {
        unit: 'n/m^2',
        adjust: null,
        name: null,
        description: 'surface momentum flux, u-component [n/m^2]',
        wiki: 'http://glossary.ametsoc.org/wiki/Momentum_flux'
    },
    vflxsfc : {
        unit: 'n/m^2',
        adjust: null,
        name: null,
        description: 'surface momentum flux, v-component [n/m^2]',
        wiki: 'http://glossary.ametsoc.org/wiki/Momentum_flux'
    },        
    ugrdprs : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 7 5 3 2 1) u-component of wind [m/s]',
        wiki: null
    },
    ugrd_1829m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '1829 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_2743m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '2743 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_3658m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '3658 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_305m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '305 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_457m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '457 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_610m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '610 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_914m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '914 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd_4572m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '4572 m above mean sea level u-component of wind [m/s]',
        wiki: null
    },
    ugrd10m : {
        unit: 'm/s',
        adjust: null,
        name: 'Wind, 10m, U',
        description: '10 m above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrdsig995 : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '0.995 sigma level u-component of wind [m/s]',
        wiki: null
    },
    ugrd30_0mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '30-0 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd60_30mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '60-30 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd90_60mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '90-60 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd120_90mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '120-90 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd150_120mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '150-120 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd180_150mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '180-150 mb above ground u-component of wind [m/s]',
        wiki: null
    },
    ugrd2pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrdneg2pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrd0p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrdneg0p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrd1pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrdneg1pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrd1p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrdneg1p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface u-component of wind [m/s]',
        wiki: null
    },
    ugrdmwl : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'max wind u-component of wind [m/s]',
        wiki: null
    },
    ugrdtrop : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'tropopause u-component of wind [m/s]',
        wiki: null
    },
    ulwrfsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface upward long-wave rad. flux [w/m^2]',
        wiki: null
    },
    ulwrftoa : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'top of atmosphere upward long-wave rad. flux [w/m^2]',
        wiki: null
    },
    uswrfsfc : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'surface upward short-wave rad. flux [w/m^2]',
        wiki: null
    },
    uswrftoa : {
        unit: 'w/m^2',
        adjust: null,
        name: null,
        description: 'top of atmosphere upward short-wave rad. flux [w/m^2]',
        wiki: null
    },
    vgrdprs : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 7 5 3 2 1) v-component of wind [m/s]',
        wiki: null
    },
    vgrd_1829m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '1829 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_2743m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '2743 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_3658m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '3658 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_305m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '305 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_457m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '457 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_610m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '610 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_914m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '914 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd_4572m : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '4572 m above mean sea level v-component of wind [m/s]',
        wiki: null
    },
    vgrd10m : {
        unit: 'm/s',
        adjust: null,
        name: 'Wind, 10m, V',
        description: '10 m above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrdsig995 : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '0.995 sigma level v-component of wind [m/s]',
        wiki: null
    },
    vgrd30_0mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '30-0 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd60_30mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '60-30 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd90_60mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '90-60 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd120_90mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '120-90 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd150_120mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '150-120 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd180_150mb : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: '180-150 mb above ground v-component of wind [m/s]',
        wiki: null
    },
    vgrd2pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrdneg2pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrd0p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrdneg0p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrd1pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrdneg1pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrd1p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrdneg1p5pv : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface v-component of wind [m/s]',
        wiki: null
    },
    vgrdmwl : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'max wind v-component of wind [m/s]',
        wiki: null
    },
    vgrdtrop : {
        unit: 'm/s',
        adjust: null,
        name: null,
        description: 'tropopause v-component of wind [m/s]',
        wiki: null
    },
    vvelprs : {
        unit: 'pa/s',
        adjust: null,
        name: null,
        description: '(1000 975 950 925 900.. 200 175 150 125 100) vertical velocity (pressure) [pa/s]',
        wiki: null
    },
    vvelsig995 : {
        unit: 'pa/s',
        adjust: null,
        name: null,
        description: '0.995 sigma level vertical velocity (pressure) [pa/s]',
        wiki: null
    },
    vwsh2pv : {
        unit: '10' + String.fromCharCode(8315) + String.fromCharCode(179) + '/s',
        adjust: function(d){return d*1000;},
        name: null,
        description: 'pv=2e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwshneg2pv : {
        unit: '10' + String.fromCharCode(8315) + String.fromCharCode(179) + '/s',
        adjust: function(d){return d*1000;},
        name: null,
        description: 'pv=-2e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwsh0p5pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=5e-07 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwshneg0p5pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=-5e-07 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwsh1pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=1e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwshneg1pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=-1e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwsh1p5pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=1.5e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwshneg1p5pv : {
        unit: '1/s',
        adjust: null,
        name: null,
        description: 'pv=-1.5e-06 (km^2/kg/s) surface vertical speed sheer [1/s]',
        wiki: null
    },
    vwshtrop : {
        unit: '10' + String.fromCharCode(8315) + String.fromCharCode(179) + '/s',
        adjust: function(d){return d*1000;},
        name: null,
        description: 'tropopause vertical speed sheer [1/s]',
        wiki: null
    },
    watrsfc : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'surface water runoff [kg/m^2]',
        wiki: null
    },
    weasdsfc : {
        unit: 'kg/m^2',
        adjust: null,
        name: null,
        description: 'surface water equivalent of accumulated snow depth [kg/m^2]',
        wiki: null
    },
    wiltsfc : {
        unit: 'fraction',
        adjust: null,
        name: null,
        description: 'surface wilting point [fraction]',
        wiki: null
    }
};


'use strict'


SIM.Tools = {

  momRestrictToInterval : function (mom, interval) {

    return moment( Math.floor(mom.valueOf() / interval) * interval );

    // .valueOf();
    // new Date(Math.round(date.getTime() / coeff) * coeff)

  },
  minutesYear: function () {
    return SIM.Tools.minutesPerYear(new Date().getUTCFullYear());
  },
  minutesPerYear: function (year) {
    var 
      start = new Date(year,  0,  0), 
      end   = new Date(year, 11, 31), 
      diff  = end - start, 
      days  = diff / (1000 * 60 );
    return days;
  }

};

function CoordsPool(amount) {

  this.amount  = amount;
  this.sector  = [];
  this.pool    = [];
  this.pointer = 0;
  this.parent  = null;

}

CoordsPool.prototype = {
  constructor: CoordsPool,
  generate: function () {

    const DEGRAD = 180 / Math.PI;

    var i, d, x, y, z, lat, lon;
    
    for (i=0; i<this.amount; i++) {
  
      x = -1 + Math.random() * 2;
      y = -1 + Math.random() * 2;
      z = -1 + Math.random() * 2;

      d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

      x = x * d;
      y = y * d;
      z = z * d;

      lat =   90 - Math.acos(y)      * DEGRAD;
      lon = (270 + Math.atan2(x , z) * DEGRAD) % 360 - 180;

      this.pool.push({ x, y, z, lat, lon });

    }

    return this;

  },
  filter (sector) {

    var i, coord, out = [];

    for (i=0; i<this.amount; i++) {

      coord = this.pool[i];
      
      if ( 
          coord.lat < sector[0] && 
          coord.lon > sector[1] && 
          coord.lat > sector[2] && 
          coord.lon < sector[3] 
        ) {
        out.push(coord);
      
      } else {
        // console.log(coord.lat, coord.lon);

      }

    }

    return out;

  }, 
  slice: function (amount) {

    if (this.pointer + amount > this.pool.length) {
      console.error('SIM.coordsPool overrun');
      return [];
    }

    var pool = new CoordsPool(amount);
    pool.pool = this.pool.slice(this.pointer, this.pointer + amount);
    pool.parent = this;

    return pool;

    // var out = this.pool.slice(this.pointer, this.pointer + amount);
    
    // this.pointer += amount;

    // return out;

  }

};
/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals SIM, H, DEVELOP */

"use strict";

SIM.Blobs = function (filename, onprogress, onfinish) {
    this.vars  = {};
    this.scheme = ['sMagic', 'dDay', 'iSteps', 'iCount'];
    this.loadFile(filename, onprogress, onfinish);
};
SIM.Blobs.prototype = {
    constructor: SIM.Blobs,
    makeUrl: function (filename) {

        var suffix = DEVELOP ? "?DEV" : "";

        if (filename.split("/")[0] === "2017"){
            return "/data/simulation/" + filename + suffix;
        } else {
            return "//noiv.pythonanywhere.com/cors/simulation/"  + filename + suffix;
        }
    },   
    loadFile: function(filename, onprogress, onfinish){
        var self = this, loaded = 0, head, data, header, req = new XMLHttpRequest();
        req.open('GET', this.makeUrl(filename), true);
        req.responseType = 'arraybuffer';
        req.onload = function (/* msg */) {
            head   = new Uint8Array(req.response.slice(0, 128));
            header = String.fromCharCode.apply(null, head);
            data   = req.response.slice(128);
            self.parse(header, data);
            onfinish(this);
        };
        req.onprogress = function (e) {
            e.diff = e.loaded - loaded;
            loaded = e.loaded;
            onprogress(e);
        };
        req.send();
    },      
    parse: function (fileHeader, fileData) {

        var i, t, item, vari, pointer = 0, tArray, length = 0, name, 
            tokens = fileHeader.split(' ').filter(function (l) {return l.length;});

        // read up to vars
        for (i=0; i<this.scheme.length; i++){
            t = this.scheme[i].slice(0, 1);
            name = this.scheme[i].slice(1);
            this[name] = (
                t === 's' ? tokens[i] :
                t === 'i' ? ~~(tokens[i]) : 
                t === 'f' ? parseFloat(tokens[i]) : 
                t === 'd' ? H.iso2Day(tokens[i]) :
                    console.error("Can't parse:", tokens)
            );
        }

        // process vars
        for (i=0; i<this.Count; i++){
            item = tokens[i + 4].split(":");
            vari = {
                name:  item[0],
                bits:  ~~item[1],
                grid:  ~~item[2],
                steps: this.Steps,
                doe:   ~~(this.Day/864e5),
                shape: [this.Steps, ~~item[2], ~~item[2]]
            };
            tArray = (
                vari.bits ===  8 ? Int8Array    :
                vari.bits === 16 ? Int16Array   :
                vari.bits === 32 ? Float32Array :
                vari.bits === 64 ? Float64Array :
                    console.error("Unknow ArrayType", tokens)
            );
            length = vari.steps * vari.grid * vari.grid * vari.bits / 8;
            vari.data = new tArray(fileData.slice(pointer, pointer + length));
            pointer += length;
            this.vars[vari.name] = vari;
        }

    }
};


SIM.MArray = function(){
    // this.scheme = ['sMagic', 'sName', 'iBits', 'iSteps', 'dDay', 'iGrid', 'sRest'];
    this.data      = {};
    this.cache     = {};
    this.doe       = NaN;    // needed by setTime
    this.slice     = NaN;    // needed by setTime ~hour
    this.grid      = NaN;
    this.factor    = NaN;    // from slice to canvas
    this.min       = +1e6;
    this.max       = -1e6;
};
SIM.MArray.prototype = {
    constructor: SIM.MArray,
    bytes: function () {
        var result = 0;
        Object.keys(this.data).forEach(function (doe) {
            result += this.data[doe].length * this.data[doe].BYTES_PER_ELEMENT;
        }, this);
        return result;
    },
    sorter: function (a, b) {return a < b ? 1 : -1;},
    first: function () {
        var doe = Object.keys(this.data).sort( this.sorter )[0];
        return this.data[doe];
    },
    setDateSize: function(date, size){
        this.doe    = H.date2doe(date);                                                // give access to day of data
        this.slice  = ~~(date.getUTCHours() / (24 / this.data[this.doe].shape[0]));   // determines the hour slice
        this.grid   = this.data[this.doe].shape[1];
        this.factor = (this.grid -1) / size;
    },
    analyzeDoe: function (doe) {
        var i, d, cube = this.data[doe], len = cube.length;
        cube.min = +1e6;
        cube.max = -1e6;
        for (i=0; i<len; i++) {
            d = cube[i];
            cube.min = d < cube.min ? d : cube.min;
            cube.max = d > cube.max ? d : cube.max;
        }
        this.min = cube.min < this.min ? cube.min : this.min;
        this.max = cube.max > this.max ? cube.max : this.max;
    },
    getXY: function (x, y) {
        var cube = this.data[this.doe],
            grid = cube.shape[1];
        return cube[this.slice * grid * grid + x + (grid - y -1) * grid];
    },
    interpolateXY: function(x, y){

        var cube    = this.data[this.doe],
            grid    = this.grid,
            offset  = this.slice * grid * grid,
            gx      = x * this.factor,          // grid x, y
            gy      = y * this.factor,
            dx      = gx - ~~gx,                // remainders, TODO: try gx % 1
            dy      = gy - ~~gy,
            xi0     = ~~(gx % grid),            // first grid cell x
            yi0     = ~~(gy % grid),
            xi1     = xi0 + 1,                  // diagonal cell
            yi1     = yi0 + 1,
            val     =  (
                cube[offset + xi0 + (grid - yi0 -1) * grid] * (1-dx) * (1-dy) + 
                cube[offset + xi1 + (grid - yi0 -1) * grid] *    dx  * (1-dy) + 
                cube[offset + xi0 + (grid - yi1 -1) * grid] * (1-dx) *    dy  + 
                cube[offset + xi1 + (grid - yi1 -1) * grid] *    dx  *    dy
            );

        return val;
    },

    __interpolateXY: function(x, y){
        var gx   = x * this.factor,        // grid x, y
            gy   = y * this.factor,
            dx   = gx - ~~gx,              // remainders, TODO: try gx % 1
            dy   = gy - ~~gy,
            xi0  = ~~(gx % this.grid),     // first grid cell x
            yi0  = ~~(gy % this.grid),
            xi1  = xi0 + 1,                // diagonal cell
            yi1  = yi0 + 1,
            val  = (
                this.getXY( xi0, yi0) * (1-dx) * (1-dy) + 
                this.getXY( xi1, yi0) *    dx  * (1-dy) + 
                this.getXY( xi0, yi1) * (1-dx) *    dy  + 
                this.getXY( xi1, yi1) *    dx  *    dy
            );
        return val;
    }

};

'use strict'


SIM.Datagram = function (dods) {

    this.data       = { /* doe: data */ };
    this.attributes = { /* doe: data */ };

    this.vari = '';
    this.parse(dods);

};

SIM.Datagram.prototype = {

    constructor: SIM.Datagram,

    parse: function (dods) {

        var result = this.parseMultiDods(dods);

        this.info = this.analyze(result);

        this.vari = result.vari;
        this.doe  = result.doe;

        this.data[result.doe] = result.data;

    },

    append: function (datagramm) {
        Object.assign(this.data, datagramm.data);
    },
    addCyclic: function () {
        // for full globe
    },
    min: function (data) {
        var i = data.length, min =+Infinity;
        while (i--){min = min < data[i] ? min : data[i];}
        return min;
    },
    max: function (data) {
        var i = data.length, max =-Infinity;
        while (i--){max = max > data[i] ? max : data[i];}
        return max;
    },
    analyze: function (data) {

        var d = data; // this.data;

        return {

            shape :     d.shape,
            plane :     d.lats.length * d.lons.length,

            lats: {
                len:    d.lats.length,
                res:    d.lats[1] - d.lats[0],
                min:    this.min(d.lats),
                max:    this.max(d.lats),
            },

            lons: {
                len:    d.lons.length,
                res:    d.lons[1] - d.lons[0],
                min:    this.min(d.lons),
                max:    this.max(d.lons),
            },

            alts: {
                len:    d.alts.length,
                res:    d.alts.length ? d.alts[1] - d.alts[0] : NaN,
                min:    d.alts.length ? this.min(d.alts)      : NaN,
                max:    d.alts.length ? this.max(d.alts)      : NaN,
            },

            tims: {
                len:    d.tims.length,
                res:    d.tims[1] ? ((d.tims[1] - d.tims[0]) / (60 * 60 * 1000)) + 'h' : NaN,
                min:    this.min(d.tims),
                max:    this.max(d.tims),
            },

            data: {
                len:    d.data.length,
                min:    this.min(d.data),
                max:    this.max(d.data),
                avg   : d.data.reduce(function(a, b){ return a + b; }, 0) / d.data.length,
            }

        };

    },

    toDate : function (datum) {

        var day = parseInt(datum, 10),
            flt = parseFloat(datum),
            scs = (flt - day) * (24 * 60 * 60),
            utc  = new Date(Date.UTC(-1, 0, day -1, 0, 0, scs)),
            year = utc.getUTCFullYear();

        utc.setUTCFullYear(year+2);

        return utc;

    }, 

    stripHours : function (date) {

        return new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        ));

    }, 
    
    flatten : function (array, mutable) {

        var result = [];
        var nodes = (mutable && array) || array.slice();
        var node;

        if (!array.length) {
            return result;
        }

        node = nodes.pop();
        
        do {
            if (Array.isArray(node)) {
                nodes.push.apply(nodes, node);
            } else {
                result.push(node);
            }
        } while (nodes.length && (node = nodes.pop()) !== undefined);

        result.reverse(); // we reverse result to restore the original order, TRY: Float.Revese

        return result;

    }, 

    parseMultiDods : function (dods) {

        var t0 = Date.now(),

            trenner = ', ',
            snan  = '9.999E20',
            lines = dods.split('\n').filter( l => l.trim().length ),
            head  = lines[0],
            vari  = head.split(trenner)[0],
            shape = head.match( /(\[\d+)/g ).join(' ').match(/(\d+)/g).map(Number),

            info  = lines.slice(-shape.length * 2),
            ofst  = shape.length === 4 ? 2 : 0,

            tims  = info[1].split(trenner).map(this.toDate),
            alts  = ofst ? Float32Array.from(info[3].split(trenner).map(Number)) : new Float32Array(0),
            lats  = Float32Array.from(info[ofst + 3].split(trenner).map(Number)),
            lons  = Float32Array.from(info[ofst + 5].split(trenner).map(Number)),

            date  = this.stripHours(tims[0]),
            doe   = H.date2doeFloat(tims[0]),

            data  = Float32Array.from(
                this.flatten(lines
                    .slice(1, -shape.length * 2)
                    .map(line => line.split(trenner).slice(1))
                ).map(num => num === snan ? NaN : parseFloat(num))
            ),
            spend = Date.now() - t0;

        // console.log(tims[0] / 864e5);

        return {lats, lons, tims, alts, shape, vari, date, doe, data, spend};

    },

    nearestXY: function (time, lat, lon) {

    },

    attribute: function (doe) {

        var row, source, len, target;

        // debug overlay w/ mask
        doe = this.vari === 'landsfc' ? H.firstAttr(this.data) : doe;

        if (this.attributes[doe]) {
            return this.attributes[doe];

        } else if (( source = this.data[doe] )) {

            len    = source.length;
            target = new Float32Array(len);

            // upside down data, doing again !

            for (row = 0; row < 181; row++) {
                target.set( source.subarray(row * 360, (row +1) * 360), (180 - row) * 360)
            }

            return this.attributes[doe] = target;

        } else {
            console.warn('OOR', doe, 'have:', Object.keys(this.data));
            return null;
        }



    },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    dataTexture: function (does, scaler /* , doe1, doe2, doe3, doe4 */ ) {

        var i;

        var length = this.info.plane;

        var attr0 = does[0] ? this.attribute(does[0]) : new Float32Array(length);
        var attr1 = does[1] ? this.attribute(does[1]) : new Float32Array(length);
        var attr2 = does[2] ? this.attribute(does[2]) : new Float32Array(length);
        var attr3 = does[3] ? this.attribute(does[3]) : new Float32Array(length);

        var data = new Uint8Array(attr1.length * 4);

        for (i=0; i< data.length; i++) {
            data[ i * 4 + 0 ] = scaler(attr0[i]);
            data[ i * 4 + 1 ] = scaler(attr1[i]);
            data[ i * 4 + 2 ] = scaler(attr2[i]);
            data[ i * 4 + 3 ] = scaler(attr3[i]);
        }

        var texture = new THREE.DataTexture(
            data, 360, 181, 
            THREE.RGBAFormat,
            THREE.UnsignedByteType,
            THREE.EquirectangularReflectionMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.LinearFilter,
            THREE.LinearFilter
        );

        texture.flipY = true;
        texture.needsUpdate = true;

        return texture;

    },
    linearXY: function (doe, lat, lonin) {

        /*
            time  = 0, 1, ...
        */

        var 
            lon   = (lonin + 180) % 360,
            data  = this.data[doe],
            plane = data.subarray(0 * this.info.plane, (0 + 1) * this.info.plane),
            ylen  = this.info.lats.len,
            xlen  = this.info.lons.len,
            rlat  = this.info.lats.res,
            rlon  = this.info.lons.res,

            // array indices
            xi0   = ~~((lon - this.info.lons.min) / rlon),
            yi0   = ~~((lat - this.info.lats.min) / rlat),

            xi1   = xi0 + 1,
            yi1   = yi0 + 1,

            // remainders
            // dx    = (lon - ~~lon) * rlon,        
            // dy    = (lat - ~~lat) * rlat,
            dx    = (lon - ~~lon) / rlon,        
            dy    = (lat - ~~lat) / rlat,

            val = (
                plane[ xi0 + (yi0 * xlen) ] * (1 - dx) * (1 - dy) + 
                plane[ xi1 + (yi0 * xlen) ] * (    dx) * (1 - dy) + 
                plane[ xi0 + (yi1 * xlen) ] * (1 - dx) * (    dy) + 
                plane[ xi1 + (yi1 * xlen) ] * (    dx) * (    dy)
            );

            if (isNaN(val)){
                // debugger;
                console.warn('linearXY', this.data.vari, lat, lon);
            }

            return val;

        ;

    }, 

    toCanvas: function () {

        var i, j, imageData, target, grey,

            cvsImage = document.createElement('CANVAS'),
            cvsScale = document.createElement('CANVAS'),
            ctxImage = cvsImage.getContext('2d'),
            ctxScale = cvsScale.getContext('2d'),

            width  = this.info.shape[2],
            height = this.info.shape[1],
            min    = this.info.data.min,
            max    = this.info.data.max,
            source = this.data.data;

        cvsScale.width  = 256;
        cvsScale.height = 256;

        cvsImage.width  = width;
        cvsImage.height = height;

        imageData = ctxImage.getImageData(0, 0, width, height);
        target = imageData.data;

        for (i = 0, j=0; i < target.length; i += 4, j++) {
          grey = ~~H.scale(source[j], min, max, 0, 255);
          target[i    ] = grey;
          target[i + 1] = grey;
          target[i + 2] = grey;
          target[i + 3] = 255;
        }

        ctxImage.putImageData(imageData, 0, 0);

        // blit to monitor and scaled

        SCN.monitor.drawImage(cvsImage, 0, 0, width, height, 0, 0, SCN.monitor.canvas.width, SCN.monitor.canvas.height);
        ctxScale.drawImage(cvsImage, 0, 0, width, height, 0, 0, 256, 256);

        return cvsScale;

    },

};

SIM.Models.tmp2m = (function () {

  var 
    self, cfg, times, vari,
    model = {
      obj:          new THREE.Object3D(),
      urls:         [],
    },
    frags = {
      samplers2D:   '',
      val1Ternary:  '',
      val2Ternary:  '',
      palette:      '',
    }
  ;

  return self = {
    create: function (config, timcfg) {

      // shortcuts
      cfg   = config;
      times = timcfg;
      vari  = cfg.sim.variable;

      // expose 
      model.prepare       = self.prepare;
      model.interpolateLL = self.interpolateLL;

      // prepare for loader
      self.calcUrls();

      // done
      return model;

    },
    interpolateLL: function (lat, lon) {

      var doe = SIM.time.doe;
      var doe1 = doe - (doe % 0.25);
      var doe2 = doe1 + 0.25;
      var t1 = SIM.datagrams.tmp2m.linearXY(doe1, lat, lon -180);
      var t2 = SIM.datagrams.tmp2m.linearXY(doe2, lat, lon -180);
      var frac = doe - ~~ doe;
      var fac2 = (frac % 0.25) % 4;
      var fac1 = 1.0 - fac2;

      return (t1 * fac1 + t2 * fac2);

    },
    calcUrls: function () {

      times.moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    prepareTextures: function (data) {

      /* tmp2m 
          low  = 273.15 - 30 = 243.15;
          high = low    + 70 = 313.75;
          ...  -30 -20 .... +30  +40  ...
      */

      var 
        does     = [],
        pointer  = 1,
        textures = {},
        scaler   = (d) => self.clampScale(d, 243.15, 313.75, 0, 255)
      ;

      times.does.forEach( doe => {

        does.push(doe);

        if (does.length === 4){
          textures['tex' + pointer] = {type: 't', value: data[vari].dataTexture(does, scaler) };
          does = [];
          pointer += 1;
        }

      });

      // rest
      if (does.length) {
        textures['tex' + pointer] = {type: 't', value: data[vari].dataTexture(does, scaler) };
      } 

      return textures;

    },
    prepareFragmentShader: function () {

      var amount = Math.ceil(times.length / 4);

      frags.samplers2D = H.range(1, amount + 1).map( n => '\n  uniform sampler2D tex' + n + ';').join('');

      frags.val1Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4) + 1),
          p = {0:'r', 1:'g', 2:'b', 3:'a'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', vUv ).' + p + ' :';
      }).join('');

      frags.val2Ternary  = H.range(0, times.length).map( n => {
        var 
          t = ((n+1) * 0.25).toFixed(2),
          s = 'tex' + (Math.floor(n/4 + 0.25) + 1),
          p = {0:'g', 1:'b', 2:'a', 3:'r'}[ n % 4]
        ;
        return '\n  doe < ' + t + ' ? texture2D( ' + s + ', vUv ).' + p + ' :';
      }).join('');

      Object
        .keys(cfg.sim.palette)
        .sort( (a,b) => parseFloat(a)-parseFloat(b))
        .forEach( key => {

          var 
            col = cfg.sim.palette[key],
            t = parseFloat(key).toFixed(1),
            c = col.r.toFixed(3) + ', ' + col.g.toFixed(3) + ', ' + col.b.toFixed(3);

          if (t !== '999.0') {
            frags.palette += '  value < ' + t + ' ? vec3(' + c + ') : \n';

          } else {
            frags.palette += '    vec3(' + c + ')\n';
          }

        })
      ;

    },
    prepare: function ( ) {

      var
        t0 = Date.now(), 

        datagrams = SIM.datagrams,
        doe       = SIM.time.doe,
        mindoe    = SIM.time.mindoe,

        geometry  = cfg.geometry,
        textures  = self.prepareTextures(datagrams),
        fragments = self.prepareFragmentShader(),

        uniforms  = Object.assign(textures, {
          doe:          { type: 'f',   value: doe - mindoe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection },
        }),
        
        material  = new THREE.ShaderMaterial({
          uniforms,
          transparent:      true,
          vertexShader:     self.vertexShader(),
          fragmentShader:   self.fragmentShader(fragments),
          // lights:         true,
          // side:           THREE.FrontSide,
          // vertexColors:   THREE.NoColors,
        }),

        onBeforeRender =  function () {

          uniforms.sunDirection.value = SIM.sunDirection;
          uniforms.sunDirection.value.y = -uniforms.sunDirection.value.y; // why

          uniforms.doe.value = (
            SIM.time.doe >= times.mindoe && SIM.time.doe <= times.maxdoe ? 
              SIM.time.doe - times.mindoe :
              -9999.0
          );

          uniforms.doe.needsUpdate = true;
          uniforms.sunDirection.needsUpdate = true;

        },

        mesh = new THREE.Mesh( geometry, material )

      ;

      model.obj.add(mesh);
      mesh.onBeforeRender = onBeforeRender;

      TIM.step('Model.tmp2m.out', Date.now() -t0, 'ms');

      return model;

    },

    // https://stackoverflow.com/questions/37342114/three-js-shadermaterial-lighting-not-working
    // https://jsfiddle.net/2pha/h83py9gu/ fog + shadermaterial
    // https://github.com/borismus/webvr-boilerplate/blob/master/node_modules/three/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl

    vertexShader: function () {
      
      return `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normal;
          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

    },
    fragmentShader: function () {

      return `

        uniform float opacity;
        uniform vec3 sunDirection;

        ${frags.samplers2D}

        varying vec2 vUv;
        varying vec3 vNormal;

        // light
        float dotNL;

        // temperatur and time
        const  float NODATA = -9999.0;
        vec3 color;
        uniform float doe;
        float frac, fac1, fac2, val1, val2, value;

        // day night
        float dnMix, dnZone;
        float dnSharpness = 3.0;
        float dnFactor    = 0.15;

        void main() {

          // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
          dotNL = dot(normalize(vNormal), sunDirection);

          // sharpen the edge beween the transition
          dnZone = clamp( dotNL * dnSharpness, -1.0, 1.0);

          // convert to 0 to 1 for mixing, 0.5 for full range
          dnMix = 0.5 - dnZone * dnFactor;

          val1 = (
            ${frags.val1Ternary}
              NODATA
          );

          val2 = (
            ${frags.val2Ternary}
              NODATA
          );

          if (doe == NODATA){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
          
          } else if (val1 == NODATA) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 0.1);

          } else if (val2 == NODATA) {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 0.1);

          } else {
            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = (val1 * fac1 + val2 * fac2) ;
            value = -30.01 + value * 70.0 ;

            color = (
              ${frags.palette}
            );

            gl_FragColor = vec4(color * dnMix, opacity);

            // debug
            // gl_FragColor = vec4(dnMix, dnMix, dnMix, 0.5);

          }
          
        }

      `;

    },

  };

}());

SIM.Models.clouds = (function () {

  var 
    self,     
    cfg,
    datagram,
    model = {
      obj:     new THREE.Object3D(),
      objects: {},
      sectors: [],
      mindoe:  NaN,
      maxdoe:  NaN,
      step:   function () {
        H.each(model.sectors, (_, sec) => sec.step() )
      },
      url2doe: function (url) {

        // "data/gfs/tcdcclm/2017-06-15-12.tcdcclm.10.dods"
        // TODO: deal with multiple patterns

        var 
          file = url.split('/').slice(-1)[0],
          mom  = moment.utc(file, cfg.sim.patterns[0]);

        return mom.toDate() / 864e5;

      },
      calcUrls: function (moms) {

        var urls = [];

        moms.forEach(mom => {
          cfg.sim.patterns.forEach(pattern => {
            urls.push(cfg.sim.dataroot + mom.format(pattern))
          });
        });

        return urls;

      },
    },
    worker = new Worker('js/sim.models.clouds.worker.js'),

  end;

  var payload = new Float32Array([1,2,3,4,5,6]);

  worker.postMessage({topic: 'quadratic', payload, id: Date.now() }, [payload.buffer]);

  worker.onmessage = function (event) {
    // console.log('answer', event.data);
  };


  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    updateMinMax: function () {
      model.mindoe = Math.min.apply(Math, Object.keys(model.objects));
      model.maxdoe = Math.max.apply(Math, Object.keys(model.objects));
    },
    // findDoes: function (target) {

    //   var doe1, doe2;

    //   Object.keys(model.objects)
    //     .sort( (a, b) =>  parseFloat(a) > parseFloat(b))
    //     .forEach( doe => {

    //       doe1 = doe < target          ? doe : doe1;
    //       doe2 = doe > target && !doe2 ? doe : doe2;

    //     });

    //     return [doe1, doe2];

    // },
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      model.show    = self.show;
      model.prepare = self.prepare;

      return model;

    },
    show: function (doe) {

      var doe1, doe2;

      // that's probaby to much
      while (model.obj.children.length) {
        model.obj.remove(model.obj.children[0]);
      }

      if (model.objects[doe]) {

        // that's a hit
        model.obj.add(model.objects[doe]);
        model.objects[doe].material.uniforms.factor.value = 1.0;
        model.objects[doe].material.uniforms.factor.needsUpdate = true;

      } else if (doe > model.mindoe && doe < model.maxdoe) {

        // mix them!
        doe1 = doe  % 0.25;
        doe2 = doe1 + 0.25;
        model.obj.add(model.objects[doe1]);
        model.obj.add(model.objects[doe2]);

        model.objects[doe1].material.uniforms.factor.value = parseFloat(doe)  - parseFloat(doe1);
        model.objects[doe2].material.uniforms.factor.value = parseFloat(doe2) - parseFloat(doe);
        model.objects[doe1].material.uniforms.factor.needsUpdate = true;
        model.objects[doe2].material.uniforms.factor.needsUpdate = true;

        console.log('clouds.show.mix', doe1, doe, doe2);

      } else {

        // bail out!
        console.warn('clouds.show.error', 'doe', doe, model.mindoe, model.maxdoe);

      }

    },
    prepare: function ( doe ) {
    
      TIM.step('Model.clouds.in', doe);

      if ( !datagram.tcdcclm.data[doe] ) {debugger;}

      var
        t0 = Date.now(),
        i, p, m, ibp, ibc, coord, points, material, percentage, 
        size     = cfg.size,
        amount   = cfg.amount,
        radius   = cfg.radius,
        pool     = SIM.coordsPool.slice(amount).pool,
        geometry = new THREE.BufferGeometry(),

        attributes = {
          percentage: new THREE.BufferAttribute( new Float32Array( amount * 1), 1 ),
          position:   new THREE.BufferAttribute( new Float32Array( amount * 3), 3 ),
        },

      end;

      for ( i=0, p=0; i < pool.length; i+=1, p+=3 ) {

        coord = pool[i];
        percentage = datagram.tcdcclm.linearXY(doe, coord.lat, coord.lon) / 100;

        attributes.position.array[p + 0] = coord.x;
        attributes.position.array[p + 1] = coord.y;
        attributes.position.array[p + 2] = coord.z;

        attributes.percentage.array[i + 0] = percentage;

      }

      geometry.addAttribute( 'position',   attributes.position );
      geometry.addAttribute( 'percentage', attributes.percentage );
      
      material = new THREE.ShaderMaterial( {
        uniforms:       {
          size:     { type: 'f', value: size },
          radius:   { type: 'f', value: radius },
          factor:   { type: 'f', value: 1.0 },
          seed:     { type: 'f', value: Math.random() },
          distance: { type: 'f', value: SCN.camera.position.length() - CFG.earth.radius },
        },
        vertexShader:   self.vertexShader(),
        fragmentShader: self.fragmentShader(),
        transparent:    true,
      });
      
      points = new THREE.Points( geometry, material );

      points.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
        material.uniforms.seed.value = Math.random();
        material.uniforms.seed.needsUpdate = true;
        material.uniforms.distance.value = camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.needsUpdate = true;
      };

      // model.obj.add(points);

      model.objects[doe] = points;
      self.updateMinMax();

      TIM.step('Model.clouds.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        attribute float percentage;

        uniform float  size;
        uniform float  radius;
        uniform float  distance;

        varying vec4  vColor;
        varying vec3  vPos;

        void main() {

          vec3 pos  = position * 2.0; // radius;
          vPos = position;

          vColor = vec4(1.0, 1.0, 1.0, percentage);

          gl_PointSize = size * percentage / (distance * 2.0);
          gl_Position  = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

         }
      
      `;

    },
    fragmentShader: function () {

      return `

        varying vec4 vColor;
        varying vec3 vPos;

        uniform float  factor;

        float rand(vec2 co){
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {

          if (rand(vPos.xy) > 0.5){
            gl_FragColor = vColor;

          } else {
            discard;

          }

        }

      `;

    }

  };

}());

if( typeof importScripts === 'function') {

  var SIM = {};

  importScripts(
    'aws.helper.js', 
    'aws.tools.js'
  );

  // say hello
  setTimeout(function () {

    var a = H.range(0, 10, 1);

    var  ta = new Float32Array(a);

    postMessage({ ta });


  }, 100);

  // process something
  onmessage = function(event) {

    var 
      result,
      id      = event.data.id,
      topic   = event.data.topic,
      payload = event.data.payload;

    // console.log('cloud.job', topic, id, typeof payload);

    if (topics[topic]) {

      result = topics[topic](payload);

      postMessage({id, result});

    } else {
      console.warn('cloud.job: unknown topic', topic);

    }

  };

  var topics = {

    quadratic: function (data) {
      return new Float32Array(data.map(n => n * n));
    },

    parse: function (dods) {

    }

  };


}

SIM.Models.jetstream = (function () {

  var 
    self, cfg, datagram,
    model = {
      obj:      new THREE.Object3D(),
      sectors:  [],
      urls:     [],
      minDoe:   NaN,
      maxDoe:   NaN,
    };

  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    calcMinMax: function (moms) {
      // assumes sorted moms
      model.minDoe = SIM.mom2doe(moms[0]);
      model.maxDoe = SIM.mom2doe(moms.slice(-1)[0]);
    },
    calcUrls: function (moms) {

      moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },   
    create: function (config, moms, simdata) {

      cfg = config;

      if (CFG.Device.maxVertexUniforms < 4096){
        cfg.amount = 200;
      }

      datagram = simdata;
      model.prepare = self.prepare;

      self.calcUrls(moms);
      self.calcMinMax(moms);

      return model;

    },

    prepare: function (doe) {
      
      // TIM.step('Model.jets.in');

      var 
        t0        = Date.now(), 
        i, j, u, v, speed, width, lat, lon, color, vec3, latlon, multiline, positions, widths, colors, seeds, hsl,
        spcl      = new THREE.Spherical(),
        length    = cfg.length,
        amount    = NaN,
        factor    = 0.0003,                       // TODO: proper Math, also sync with wind10m
        alt       = cfg.radius - CFG.earth.radius,      // 0.001
        pool      = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),
        material  = SCN.Meshes.Multiline.material(cfg),
      end;


      H.each(cfg.sim.sectors, (_, sector)  => {

        seeds     = pool.filter(sector).slice(0, cfg.amount);
        amount    = seeds.length; 

        positions = new Array(amount).fill(0).map( () => []);
        colors    = new Array(amount).fill(0).map( () => []);
        widths    = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = self.convLL(lat, lon, alt);

          for (j=0; j<length; j++) {

            u = datagram.ugrdprs.linearXY(doe, lat, lon);
            v = datagram.vgrdprs.linearXY(doe, lat, lon);

            speed = Math.hypot(u, v);

            hsl   = 'hsl(' + cfg.hue + ', 40%, ' +  ~~speed + '%)'
            color = new THREE.Color(hsl);

            width = self.clampScale(speed, 0, 50, 0.5, 2.0);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spcl.setFromVector3(vec3);
            spcl.theta += u * factor;                   // east-direction
            spcl.phi   -= v * factor;                   // north-direction
            vec3 = vec3.setFromSpherical(spcl).clone();
            
            latlon = self.convV3(vec3, alt);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new SCN.Meshes.Multiline.mesh (
          positions, 
          colors, 
          widths, 
          material
        );

        model.obj.add(multiline.mesh);
        model.sectors.push(multiline);

      });

      model.obj.children[0].onAfterRender = function () {

        var i, 
          pointers = material.uniforms.pointers.value,
          offset   = 1 / cfg.length
        ;

        for (i=0; i<cfg.amount; i++) {
          pointers[i] = (pointers[i] + offset) % 1;
        }

        material.uniforms.pointers.needsUpdate = true;

        material.uniforms.distance.value = SCN.camera.position.length() - CFG.earth.radius;
        material.uniforms.distance.needsUpdate = true;
        
      }

      // TIM.step('Model.jets.out');

      return model;

    },






    // createMaterial: function (amount, options) {

    //   var     
    //     pointers = new Array(amount).fill(0).map( () => Math.random() * this.length ),
    //     distance = SCN.camera.position.length() - CFG.earth.radius
    //   ;

    //   // https://threejs.org/examples/webgl_materials_blending.html

    //   return  new THREE.RawShaderMaterial({

    //     vertexShader:    SCN.Meshes.Multiline.shaderVertex(cfg.amount),
    //     fragmentShader:  SCN.Meshes.Multiline.shaderFragment(),

    //     depthTest:       true,                    // false ignores planet
    //     depthWrite:      false,
    //     blending:        THREE.AdditiveBlending,    // NormalBlending, AdditiveBlending, MultiplyBlending
    //     side:            THREE.DoubleSide,        // FrontSide (start=skewed), DoubleSide (start=vertical)
    //     transparent:     true,                    // needed for alphamap, opacity + gradient
    //     lights:          false,                   // no deco effex, true tries to add scene.lights

    //     shading:         THREE.SmoothShading,     // *THREE.SmoothShading or THREE.FlatShading
    //     vertexColors:    THREE.NoColors,          // *THREE.NoColors, THREE.FaceColors and THREE.VertexColors.

    //     wireframe:       false,

    //     uniforms: {

    //       color:            { type: 'c',    value: options.color },
    //       opacity:          { type: 'f',    value: options.opacity },
    //       lineWidth:        { type: 'f',    value: options.lineWidth },
    //       section:          { type: 'f',    value: options.section }, // length of trail in %

    //       // these are updated each step
    //       pointers:         { type: '1fv',  value: pointers },
    //       distance:         { type: 'f',    value: distance },

    //     },

    //   });

    // },

  };

}());

SIM.Models.variables = (function () {

  var 
    self,     
    cfg,
    datagram,
    model = {
      obj: new THREE.Object3D(),
      calcUrls: function (moms) {

        var urls = [];

        moms.forEach(mom => {
          cfg.sim.patterns.forEach(pattern => {
            urls.push(cfg.sim.dataroot + mom.format(pattern))
          });
        });

        return urls;

      },
    },

  end;

  return self = {
    create: function (config, simdata) {

      cfg = config;
      datagram = simdata;

      model.prepare = self.prepare;

      return model;

    },
    prepare: function ( doe ) {

      TIM.step('Model.variables.in', doe);

      var
        t0 = Date.now(), 
        
        doe1       = doe - (doe % 0.25),
        doe2       = doe1 + 0.25,
        
        geometry = new THREE.SphereBufferGeometry(cfg.radius, 359, 180),

        attributes = {
          doe1:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe1), 1 ),
          doe2:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe2), 1 ),
        },

        uniforms = {
          doe:         { type: 'f',   value: doe },
          opacity:     { type: 'f',   value: cfg.opacity },
          sunPosition: { type: 'v3',  value: SIM.sunVector },
        },
        
        material = new THREE.ShaderMaterial( {
          uniforms,
          vertexShader:   self.vertexShader(),
          fragmentShader: self.fragmentShader(),
          transparent:    true,
          side:           THREE.FrontSide,
          vertexColors:   THREE.NoColors,
        }),
      
        mesh = new THREE.Mesh( geometry, material )

      end;

      geometry.addAttribute( 'doe1', attributes.doe1 );
      geometry.addAttribute( 'doe2', attributes.doe2 );

      model.obj.add(mesh);

      function updateDoe (doe) {

        var attrDoe1, attrDoe2, datagramm = datagram[cfg.sim.variable];

        uniforms.doe.value = doe;

        if (doe < doe1 || doe > doe2) {

          doe1 = doe  - (doe % 0.25);
          doe2 = doe1 + 0.25;

          attrDoe1 = datagramm.attribute(doe1);
          attrDoe2 = datagramm.attribute(doe2);

          if ( attrDoe1 && attrDoe2 ) {

            // console.log('updated', doe1, doe2, doe);

            geometry.attributes.doe1.array = attrDoe1;
            geometry.attributes.doe2.array = attrDoe2;

            geometry.attributes.doe1.needsUpdate = true;
            geometry.attributes.doe2.needsUpdate = true;

          } else {

            // out of range condition
            uniforms.doe.value = 0.0;
            console.log('updated', 0);

          }

        }

      }

      mesh.onAfterRender = function () {
        updateDoe(SIM.time.doe);
        uniforms.doe.needsUpdate = true;
        uniforms.sunPosition.value = SIM.sunVector;
        uniforms.sunPosition.needsUpdate = true;

      };

      TIM.step('Model.variables.out', Date.now() -t0, 'ms');

      return model;

    },
    vertexShader: function () {
      
      return `

        attribute float doe1;
        attribute float doe2;

        varying float vData1;
        varying float vData2;

        void main() {

          vData1 = doe1;
          vData2 = doe2;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
      
      `;

    },
    fragmentShader: function () {

      return `

        // precision highp int;
        // precision highp float;

        uniform float doe;

        varying float vData1;
        varying float vData2;

        float frac, fac1, fac2, value;

        vec3 color;

        void main() {

          if (doe < 1.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4); // error

          } else {

            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = -273.15 + (vData1 * fac1 + vData2 * fac2) ;

            color = (
              value < -30.0 ? vec3(0.6666666, 0.4000000, 0.666666) : // dark violett
              value < -20.0 ? vec3(0.8078431, 0.6078431, 0.898039) :
              value < -10.0 ? vec3(0.4235294, 0.8078431, 0.886274) :
              value <  +0.0 ? vec3(0.4235294, 0.9372549, 0.423529) :
              value < +10.0 ? vec3(0.9294117, 0.9764705, 0.423529) :
              value < +20.0 ? vec3(0.9843137, 0.7921568, 0.384313) :
              value < +30.0 ? vec3(0.9843137, 0.3960784, 0.305882) :
              value < +40.0 ? vec3(0.8000000, 0.2509803, 0.250980) :
                vec3(0.6000000, 0.1509803, 0.150980)                 // dark red
            );

              gl_FragColor = vec4(color, 0.3);

          }
          

        }

      `;

    }

  };

}());

SIM.Models.wind = (function () {

  var 
    self,     
    model = {
      obj:     new THREE.Object3D(),
      sectors: [],
      step:   function () {
        H.each(model.sectors, (_, sec) => sec.step() )
      },
    };

  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    colorTableAlpha: function (c, alpha){
      return (
        c === 0 ? 'rgba(170, 102, 170, ' + alpha + ')' :
        c === 1 ? 'rgba(206, 155, 229, ' + alpha + ')' :
        c === 2 ? 'rgba(108, 206, 226, ' + alpha + ')' :
        c === 3 ? 'rgba(108, 239, 108, ' + alpha + ')' :
        c === 4 ? 'rgba(237, 249, 108, ' + alpha + ')' :
        c === 5 ? 'rgba(251, 202,  98, ' + alpha + ')' :
        c === 6 ? 'rgba(251, 101,  78, ' + alpha + ')' :
        c === 7 ? 'rgba(204,  64,  64, ' + alpha + ')' :
            'black'
      );
    },
    latlon2color: function (datagramm, lat, lon) {

      var tmp2m = datagramm.tmp2m.linearXY(0, lat, lon) - 273.15;
      var col   = ~~self.clampScale(tmp2m, -40, +30, 0, 7);

      return new THREE.Color(self.colorTableAlpha(col, 1.0));

    },
    create: function (cfg, datagramm) {
      
      TIM.step('Model.wind.in');

      var t0 = Date.now(), i, j, u, v, width, speed, lat, lon, color, vec3, latlon, tmp2m,

        multiline, positions, widths, colors, seeds, 

        spherical = new THREE.Spherical(),
        length   = cfg.length,
        amount   = NaN,
        factor   = 0.0003,                       // TODO: proper Math
        alt      = cfg.radius - CFG.earth.radius,      // 0.001
        pool     = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),

      end;

      H.each(cfg.sim.sectors, (_, sector)  => {

        seeds   = pool.filter(sector).slice(0, cfg.amount);
        amount  = seeds.length; 

        positions = new Array(amount).fill(0).map( () => []);
        colors    = new Array(amount).fill(0).map( () => []);
        widths    = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = self.convLL(lat, lon, alt);

          for (j=0; j<length; j++) {

            u = datagramm.ugrd10m.linearXY(0, lat, lon);
            v = datagramm.vgrd10m.linearXY(0, lat, lon);

            speed = Math.hypot(u, v);
            color = self.latlon2color(datagramm, lat, lon);
            width = self.clampScale(speed, 0, 30, 0.4, 1.4);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spherical.setFromVector3(vec3);
            spherical.theta += u * factor; // east-direction
            spherical.phi   -= v * factor; // north-direction
            vec3 = vec3.setFromSpherical(spherical).clone();
            
            latlon = self.convV3(vec3, alt);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new Multiline (
          positions, 
          colors, 
          widths, 
          cfg
        );

        model.obj.add(multiline.mesh);
        model.sectors.push(multiline);

      });

      TIM.step('Model.wind.out');

      return model;

    },
  };


}());
SIM.Models.pratesfc = (function () {

  var 
    self, cfg, datagram,
    model = {
      obj:      new THREE.Object3D(),
      urls:     [],
      minDoe:   NaN,
      maxDoe:   NaN,
    }
  ;

  return self = {
    create: function (config, moms, simdata) {

      cfg = config;
      datagram = simdata;
      model.prepare = self.prepare;

      self.calcUrls(moms);
      self.calcMinMax(moms);

      return model;

    },
    calcMinMax: function (moms) {
      // assumes sorted moms
      model.minDoe = SIM.mom2doe(moms[0]);
      model.maxDoe = SIM.mom2doe(moms.slice(-1)[0]);
    },
    calcUrls: function (moms) {

      moms.forEach(mom => {
        cfg.sim.patterns.forEach(pattern => {
          model.urls.push(cfg.sim.dataroot + mom.format(pattern));
        });
      });

    },    
    prepare: function ( doe ) {

      TIM.step('Model.variables.in', doe);

      var
        t0 = Date.now(), 
        
        doe1       = doe - (doe % 0.25),
        doe2       = doe1 + 0.25,
        
        geometry = new THREE.SphereBufferGeometry(cfg.radius, 359, 180),

        attributes = {
          doe1:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe1), 1 ),
          doe2:    new THREE.BufferAttribute( datagram[cfg.sim.variable].attribute(doe2), 1 ),
        },

        ownuniforms   = {
          doe:          { type: 'f',   value: doe },
          opacity:      { type: 'f',   value: cfg.opacity },
          sunDirection: { type: 'v3',  value: SIM.sunDirection },
        },

        uniforms   = THREE.UniformsUtils.merge([
            // THREE.UniformsLib[ 'lights' ],
            ownuniforms       
        ]),
        
        material   = new THREE.ShaderMaterial({
          uniforms,
          // lights:         true,
          transparent:    true,
          vertexShader:   self.vertexShader(),
          fragmentShader: self.fragmentShader(),
          // side:           THREE.FrontSide,
          // vertexColors:   THREE.NoColors,
        }),
      
        onAfterRender = function  () {

          var
            doe = SIM.time.doe, 
            datagramm = datagram[cfg.sim.variable];

          uniforms.doe.value = doe;

          // check bounds
          if ( doe >= model.minDoe && doe <= model.maxDoe ) {

            // check whether update needed
            if (doe < doe1 || doe > doe2) {

              doe1 = doe  - (doe % 0.25);
              doe2 = doe1 + 0.25;

              geometry.attributes.doe1.array = datagramm.attribute(doe1);
              geometry.attributes.doe2.array = datagramm.attribute(doe2);

              geometry.attributes.doe1.needsUpdate = true;
              geometry.attributes.doe2.needsUpdate = true;

            }

          } else {
            uniforms.doe.value = 0.0;

          }

          uniforms.doe.needsUpdate          = true;
          uniforms.sunDirection.value       = SIM.sunDirection;
          uniforms.sunDirection.needsUpdate = true;

        },

        mesh = new THREE.Mesh( geometry, material )

      ;

      geometry.addAttribute( 'doe1', attributes.doe1 );
      geometry.addAttribute( 'doe2', attributes.doe2 );

      model.obj.add(mesh);
      mesh.onAfterRender = onAfterRender;

      TIM.step('Model.variables.out', Date.now() -t0, 'ms');

      return model;

    },

    // https://stackoverflow.com/questions/37342114/three-js-shadermaterial-lighting-not-working
    // https://jsfiddle.net/2pha/h83py9gu/ fog + shadermaterial
    // https://github.com/borismus/webvr-boilerplate/blob/master/node_modules/three/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl

    vertexShader: function () {
      
      return `

        attribute float doe1;
        attribute float doe2;

        varying float vData1;
        varying float vData2;

        void main() {

          vData1 = doe1;
          vData2 = doe2;

          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
      
      `;

    },
    fragmentShader: function () {

      return `

        // precision highp int;
        // precision highp float;

        uniform float doe;

        varying float vData1;
        varying float vData2;

        float frac, fac1, fac2, value;

        vec3 color;

        void main() {

          vec3 irradiance;


          if (doe < 1.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4); // error

          } else {

            frac = fract(doe);
            fac2 = mod(frac, 0.25) * 4.0;
            fac1 = 1.0 - fac2;

            value = (vData1 * fac1 + vData2 * fac2) ;

            if ( value <= 0.00005 ) {
              discard;

            } else {
              color = (
                value < 0.0001 ? vec3(0.666, 0.400, 0.666) : // dark violett
                value < 0.0002 ? vec3(0.807, 0.607, 0.898) :
                value < 0.0003 ? vec3(0.423, 0.807, 0.886) :
                value < 0.0004 ? vec3(0.423, 0.937, 0.423) :
                value < 0.0005 ? vec3(0.929, 0.976, 0.423) :
                value < 0.0006 ? vec3(0.984, 0.792, 0.384) :
                value < 0.0007 ? vec3(0.984, 0.396, 0.305) :
                value < 0.0008 ? vec3(0.800, 0.250, 0.250) :
                  vec3(0.600, 0.150, 0.150)                  // dark red
              );

              gl_FragColor = vec4(color, 0.3); //0.3 good

            }

          }
          
        }

      `;

    }

  };

}());

var SCN = (function () {

  var 
    self,
    frame         = 0,
    lastTimestamp = NaN,

    $$            = document.querySelectorAll.bind(document),

    canvas        = $$('.simulator')[0],
    home          = new THREE.Vector3(0, 0, 0),

    renderer      = new THREE.WebGLRenderer({
      canvas,
      antialias:    true,
      preserveDrawingBuffer:    true,   // screenshots
    }),

    camera,
    scene         = new THREE.Scene(),

    comb          = 1,   // 0 = no render, 1 = all frames, 2 = every other, 3 etc 

    doRender      = true,
    // doAnimate     = true,
    // doSimulate    = true,

    extensions    = {},
    objects       = {}

  ;

  return self = {
    
    home,
    scene,
    camera,
    objects,
    renderer,

    toggleRender: function (force) {
      doRender = force !== undefined ? force : !doRender;
    },
    add: function (name, obj) {
      objects[name] = obj;
      objects[name].name = name;
      scene.add(obj);
    },
    setComb : function (val) {comb = val;},
    toggle: function (obj, force) {

      if (scene.getObjectByName(obj.name) || force === false) {
        scene.remove(obj);

      } else {
        if (obj instanceof THREE.Object3D){
          scene.add(obj);

        } else {
          SCN.Tools.loader[obj.type](obj.name, obj, () => {});

        }
      }

      IFC.urlDirty = true;

    },

    isActive: function (assetname) {

      var active = false;

      H.each(objects, (name, asset) => {

        if (!active && name === assetname && asset instanceof THREE.Object3D ) {
          active = true;
        }

      });

      return active;

    },

    toggleBasemap: function (basemap) {

      var basename, lightset;

      // sanitize param
      if (typeof basemap === 'string'){
        basename = basemap;

      } else  {
        console.error('SCN.toggleBasemap', 'illegal basemap param');
      }

      H.each(objects, (name, obj) => {

        if (CFG.Objects[name] !== undefined) {

          if (name === basename){
            self.toggle(obj, true);

          } else if (CFG.BasemapIds.indexOf(CFG.Objects[name].id) !== -1 ) {
            self.toggle(obj, false);

          }

        }

      });

      lightset = CFG.Lightsets[CFG.Objects[basename].lightset];

      ANI.insert(0, ANI.library.lightset(lightset, 300));

      console.log('SCN.toggleBasemap', basename);

    },

    resize: function (geometry) {

      renderer.setSize(geometry.width, geometry.height);

      if (camera) {
        camera.aspect = geometry.aspect;
        camera.updateProjectionMatrix();
      }
      
    },
    init: function () {

      // https://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
      // renderer.setPixelRatio( window.devicePixelRatio );  // What the fuss?
      // webgl.min_capability_mode

      renderer.setClearColor(0x662200, 1.0);  // red for danger
      renderer.shadowMap.enabled = false;
      renderer.autoClear = false;             // cause HUD

      camera = self.camera = CFG.Camera.cam;
      camera.position.copy(CFG.Camera.pos);
      self.add('camera', camera);

    },

    reset: {
      controller: function () {
        IFC.Controller.reset();
      }
    },

    actions: function (folder, option, value) {

      var
        ignore = () => {},
        config = {
          Loading:  { update: ignore},
          SimTime:  { update: ignore},
          Render:   { toggle: (value) => doRender   = value },
          ResetCam: { toggle: (value) => doSimulate = value },
          Ambient: {
            toggle:       (value) => self.toggle(objects.ambient, value),
            intensity:    (value) => objects.ambient.intensity = value,
            color:        (value) => objects.ambient.color = new THREE.Color( value ),
          },
          Spot: {
            toggle:       (value) => self.toggle(objects.spot, value),
            angle:        (value) => objects.spot.angle = value,
            intensity:    (value) => objects.spot.intensity = value,
            color:        (value) => objects.spot.color = new THREE.Color( value ),
          },
          Sun: {
            toggle:       (value) => self.toggle(objects.sun, value),
            intensity:    (value) => objects.sun.intensity = value,
            skycolor:     (value) => objects.sun.color = new THREE.Color( value ),
            grdcolor:     (value) => objects.sun.groundColor = new THREE.Color( value ),
          },
          Atmosphere: {
            toggle:       (value) => self.toggle(objects.atmosphere, value),
            opacity:      (value) => objects.atmosphere.update({opacity: value}),
          },
          Assets: (function () {
            var asets = {};

            H.each(CFG.Objects, (name, config) => {
              if (config.id) {
                asets[name.toUpperCase()] = (value) => self.toggle(objects[name], value);
              }
            });

            return asets;

          }()),
          Camera: {
            reset:        (value) => self.reset.controller(),
          },
          DateTime: {
            choose:       (value) => SIM.setSimTime(value),
            'hour  +1':   (value) => SIM.setSimTime(  1, 'hours'),
            'hour  -1':   (value) => SIM.setSimTime( -1, 'hours'),
            'hour  +6':   (value) => SIM.setSimTime(  6, 'hours'),
            'hour  -6':   (value) => SIM.setSimTime( -6, 'hours'),
            'hour +24':   (value) => SIM.setSimTime( 24, 'hours'),
            'hour -24':   (value) => SIM.setSimTime(-24, 'hours'),
            'day  +30':   (value) => SIM.setSimTime( 30, 'days'),
            'day  -30':   (value) => SIM.setSimTime(-30, 'days'),
          },
          Animations: {
            Rotate:       (value) => ANI.insert(0, ANI.library.datetime.add(1, 'days', 800)), 
          },
        }
      ;

      try {
        config[folder][option](value);

      } catch (e) {
        console.warn('SCN.actions.error', folder, option, value);
        console.log(e);

      } 

    },

    prerender: function () {
      var t0 = Date.now();
      renderer.clear();
      renderer.render( scene, camera );
      renderer.render( scene, camera ); // cause onAfterRender
      renderer.clearDepth();
      IFC.Hud.render(renderer);
      IFC.Hud.render(renderer);
      TIM.step('SCN.prerender', Date.now() - t0, 'ms');
    },

    render: function render () {

      var 
        timestamp = performance.now(),
        deltasecs = (timestamp - (lastTimestamp || timestamp)) / 1000; // to secs

      requestAnimationFrame(render);

      if ( comb && !(frame % comb) ) {

        IFC.Hud.performance.begin();

        TWEEN.update();

        // move cam
        IFC.step(frame, deltasecs);

        camera.radius   = camera.position.length();
        camera.distance = camera.radius - CFG.earth.radius;

        objects.background.updatePosition();

        SIM.updateSun();
        objects.spot.position.copy(SIM.sunPosition);
        objects.sun.position.copy(SIM.sunPosition);

        // always look for new animations
        ANI.step(frame, deltasecs);

        // update globe
        renderer.clear();
        renderer.render( scene, camera );

        // update Hud
        IFC.Hud.step(frame, deltasecs);
        IFC.Hud.render(renderer);

        IFC.Hud.performance.end();

        // to next frame
        IFC.Hud.performance.render();

      }

      lastTimestamp = timestamp;
      frame += 1;

    },
    // info: function () { },
    probeDevice: function () {

      var gl = renderer.context, dev = CFG.Device;

      gl.getSupportedExtensions().forEach(ex => extensions[ex] = ex);

      dev.devicePixelRatio           = devicePixelRatio;
      dev.maxVertexUniforms          = renderer.capabilities.maxVertexUniforms;
      dev.max_texture_size           = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      dev.max_texture_image_units    = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      dev.max_cube_map_texture_size  = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
      dev.OES_texture_float          = !!extensions.OES_texture_float;
      dev.OES_texture_float_linear   = !!extensions.OES_texture_float_linear;

    },
    logFullInfo: function () {

      // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
      // Each uniform is aligned to 4 floats.

      var gl = renderer.context;

      console.log('SAMPLES',                      gl.getParameter(gl.SAMPLES));
      console.log('MAX_RENDERBUFFER_SIZE',        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
      console.log('MAX_VERTEX_UNIFORM_VECTORS ',  gl.getParameter('MAX_VERTEX_UNIFORM_VECTORS', gl.MAX_VERTEX_UNIFORM_VECTORS));
      console.log('MAX_FRAGMENT_UNIFORM_VECTORS', gl.getParameter('MAX_FRAGMENT_UNIFORM_VECTORS', gl.MAX_FRAGMENT_UNIFORM_VECTORS));

      console.log('renderer', JSON.stringify({

        children:               scene.children.length,
        geometries:             renderer.info.memory.geometries,
        calls:                  renderer.info.render.calls,
        textures:               renderer.info.memory.textures,
        faces:                  renderer.info.render.faces,
        vertices:               renderer.info.render.vertices,
        maxAttributes :         renderer.capabilities.maxAttributes,
        maxTextures :           renderer.capabilities.maxTextures,
        maxVaryings :           renderer.capabilities.maxVaryings,
        maxVertexUniforms :     renderer.capabilities.maxVertexUniforms, // this limits multiline amount
        floatFragmentTextures : renderer.capabilities.floatFragmentTextures,
        floatVertexTextures :   renderer.capabilities.floatVertexTextures,
        getMaxAnisotropy :      renderer.capabilities.getMaxAnisotropy,
        extensions:             gl.getSupportedExtensions(),

      }, null, 2));

    },

  };

}());


/*

surface.computeBoundingBox();
surface.computeBoundingSphere();
surface.computeFaceNormals();
surface.computeFlatVertexNormals();
surface.computeLineDistances();
surface.computeMorphNormals();
surface.computeFlatVertexNormals();



*/









SCN.Tools = {

  loadCube: function (name, cfg, callback) {

    var
      idx, vertex,  materials, mesh,
      geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
      urls = CFG.Faces.map( face => {

        if (cfg.cube.type === 'globe'){
          return H.replace(cfg.cube.texture, 'FACE', face);

        } else if (cfg.cube.type === 'polar') {
           return (face === 'top' || face === 'bottom') ? 
            H.replace(cfg.cube.texture, 'FACE', face) : 'images/transparent.face.512.png';
        }

      });

    for (idx in geometry.vertices) {
      vertex = geometry.vertices[idx];
      vertex.normalize().multiplyScalar(cfg.cube.radius);
    }

    geometry.computeVertexNormals();

    RES.load({urls, type: 'texture', onFinish: function (err, responses) {

      if (err) {console.log(err);}

      materials = responses.map(response => {

        return new THREE.MeshPhongMaterial(Object.assign({ 
          map:         response.data,
          shininess:   0,
          alphaTest: 0.5,
        }), cfg.material);

      });

      // mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
      mesh = new THREE.Mesh( geometry, materials );

      cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

      callback(name, mesh);

    }});

  },

  loader: {

    // 'camera': (name, cfg, callback) => {
    //   SCN.camera = self.camera = cfg.cam;
    //   camera.position.copy(CFG.Objects.perspective.pos);
    //   self.add(name, cfg.cam);
    //   callback();
    // },

    'mesh': (name, cfg, callback) => {
      SCN.add(name, cfg.mesh);
      callback();
    },

    'light': (name, cfg, callback) => {
      cfg.light = cfg.light(cfg);
      cfg.pos && cfg.light.position.copy( cfg.pos ); 
      SCN.add(name, cfg.light);
      callback();
    },

    'mesh.calculated': (name, cfg, callback) => {
      SCN.add(name, SCN.Meshes.calculate(name, cfg));
      callback();
    },

    'mesh.module': (name, cfg, callback) => {
      SCN.Meshes[name](name, cfg, function (name, mesh) {
        SCN.add(name, mesh);
        callback();
      });
    },

    'simulation': (name, cfg, callback) => {
      SIM.loadVariable(name, cfg, (name, obj) => {
        cfg.rotation && obj.rotation.fromArray(cfg.rotation);
        SCN.add(name, obj);
        callback();
      });
    },

    'geo.json': (name, cfg, callback) => {

      RES.load({type: 'text', urls: [cfg.json], onFinish: (err, responses) => {

        var obj  = new THREE.Object3D();
        var json = JSON.parse(responses[0].data);

        drawThreeGeo(json, cfg.radius, 'sphere', {
          color: cfg.color, 
          lights: true, // grrrr
        }, obj); 

        cfg.rotation && obj.rotation.fromArray(cfg.rotation);

        SCN.add(name, obj);
        callback();

      }});

    },

    'cube.textured': (name, cfg, callback) => {
      SCN.Tools.loadCube(name, cfg, (name, obj) => {
        SCN.add(name, obj);
        callback();
      });
    },

  },
};

SCN.Meshes = {

  calculate:  function (name, cfg) { return SCN.Meshes[name](cfg) },
  sector: function (cfg, callback) {

    /*
          + - + - +
          |       |
          +   +   +
          |       |
          + - + - +
    */

    var 
      MAX_RANGE = 1000,
      mesh, range, 
      reso      = cfg.resolution,
      geometry  = new THREE.BufferGeometry(),
      material  = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
      mesh      = new THREE.Line( geometry, material ),
      positions = new Float32Array( MAX_RANGE * 3 ),
      colors    = new Float32Array( MAX_RANGE * 3 ),
      toVec3    = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      },
    end;

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    updateSector(cfg.sector);

    mesh.updateSector = updateSector;

    return mesh;

    function updateSector (sector) {

      var 
        v3, 
        pos  = 0,
        lat0 = sector[0],
        lon0 = sector[1],
        lat1 = sector[2],
        lon1 = sector[3],
        width     = (Math.abs(lon1 - lon0) + 1) * reso,
        height    = (Math.abs(lat1 - lat0) + 1) * reso,
        lons      = TOOLS.flatten([
          H.linspace(lon0, lon1, width),
          H.linspace(lon1, lon1, height - 2),
          H.linspace(lon1, lon0, width),
          H.linspace(lon0, lon0, height - 2),
          [lon0]
        ]),
        lats      = TOOLS.flatten([
          H.linspace(lat0, lat0, width),
          H.linspace(lat0, lat1, height -2),
          H.linspace(lat1, lat1, width),
          H.linspace(lat1, lat0, height -2),
          [lat0]
        ]),
      end;

      H.zip(lats, lons, (lat, lon) => {

        v3 = toVec3(lat, lon);

        positions[pos + 0] = v3.x;
        positions[pos + 1] = v3.y;
        positions[pos + 2] = v3.z;
        
        colors[pos + 0] = 0.9;
        colors[pos + 1] = 0.9;
        colors[pos + 2] = 0.3;
        
        pos += 3;

      });

      geometry.setDrawRange(0, lats.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();

    }

    // function onBeforeRender () {

    // }

  },

  graticule: function (cfg, callback) {

    /*
          + - + - +
          |   |   |
          + - + - +
          |   |   |
          + - + - +
    */

    var 
      lats      = H.linspace(-180, 180, 37),
      lons      = H.linspace( -90,  90, 19),

      container = new THREE.Object3D(),

      gratGeo   = new THREE.Geometry(),
      gratMat   = new THREE.LineBasicMaterial(Object.assign({}, cfg.material, {
        // uniforms: {type: 'f', value: SCN.camera.position.length()}
      })),
      graticule =  new THREE.LineSegments(gratGeo, gratMat),

      axisMat   = new THREE.LineBasicMaterial({color: 0xffffff}),
      axisGeo   = new THREE.Geometry(),
      axis      = new THREE.Line( axisGeo, axisMat ),

      pntrMat   = new THREE.LineBasicMaterial({color: 0xffff00}),
      pntrGeo   = new THREE.Geometry(),
      pntr      = new THREE.Line( pntrGeo, pntrMat ),
      pointer   = new THREE.Vector3(),

      sunMat    = new THREE.LineBasicMaterial({color: 0xff0000}),
      sunGeo    = new THREE.Geometry(),
      sun       = new THREE.Line( sunGeo, sunMat ),

      toVec3   = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      };

    // calc parallels, 
    H.each(lats.slice(0, -1), (iLat, lat) => {
      H.each(lons.slice(0, -1), (iLon, lon) => {

        var 
          lat0 = lat,
          lat1 = lats[~~iLat + 1],
          lon0 = lon,
          lon1 = lons[~~iLon + 1],
          v1   = toVec3(lat0, lon0),
          v2   = toVec3(lat0, lon1),
          v3   = toVec3(lat0, lon0),
          v4   = toVec3(lat1, lon0);

      gratGeo.vertices.push(v1, v2, v3, v4);

      });
    });

    // earth rotation axis
    axisGeo.vertices.push(
      new THREE.Vector3( 0,  1.5, 0 ),
      new THREE.Vector3( 0, -1.5, 0 )
    );

    // mouse pointer
    pntrGeo.vertices.push(
      new THREE.Vector3( 0,    0, 0 ),
      new THREE.Vector3( 2,    2, 2 )
    );

    // sun pointer
    sunGeo.vertices.push(
      new THREE.Vector3( 0,    0, 0 ),
      new THREE.Vector3( 0,    0, 0 )
    );

    container.add(sun, pntr, axis, graticule);

    graticule.onBeforeRender = function () {

      pointer.copy(IFC.pointer.intersect).normalize().multiplyScalar(1.2);

      pntrGeo.vertices[1] = pointer;
      pntrGeo.verticesNeedUpdate = true;

      // sunGeo.vertices[0] = SCN.home;
      sunGeo.vertices[1] = SIM.sunPosition;
      sunGeo.verticesNeedUpdate = true;

    };

    return container;

  },

};
/*

  Borrowed from 
    https://github.com/spite/THREE.MeshLine/
  using MIT LICENCE

*/

SCN.Meshes.Multiline = {

  mesh: function (trailsVectors, trailsColors, trailsWidths, material) {

    var idx = 0;

    this.bytes      = NaN;
    this.amount     = trailsVectors.length;
    this.length     = trailsVectors[0].length;
    this.points     = this.amount * this.length;

    this.geometry   = new THREE.BufferGeometry();
    // this.material   = this.createMaterial(options);
    
    this.attributes = {
      lineIndex: Float32Array,
      colors:    Float32Array,
      next:      Float32Array,
      position:  Float32Array,
      previous:  Float32Array,
      side:      Float32Array,
      uv:        Float32Array,
      width:     Float32Array,
      index:     Uint16Array,
    };

    this.lines = H.zip(trailsVectors, trailsColors, trailsWidths, (vectors, colors, widths) => {
      return new SCN.Meshes.Multiline.line(idx++, vectors, colors, widths);
    });

    H.each(this.attributes, (name, bufferType) => {

      var
        target,
        pointer     = 0,
        indexOffset = 0,
        itemSize    = this.lines[0].attributes[name].itemSize,
        totalLength = this.lines[0].attributes[name].array.length * this.amount,
        positLength = this.lines[0].attributes['position'].count;

      this.attributes[name] = new THREE.BufferAttribute( new bufferType( totalLength ), itemSize );
      target = this.attributes[name].array;
      
      H.each(this.lines, (idx, mesh) => {

        var i,
          source = mesh.attributes[name].array,
          length = source.length;

        if (name === 'index'){
          for (i=0; i<length; i++) {
            target[pointer + i] = source[i] + indexOffset;
          }

        } else {
          for (i=0; i<length; i++) {
            target[pointer + i] = source[i];
          }
        }

        pointer     += length;
        indexOffset += positLength;

      });

      if (name === 'index'){
        this.geometry.setIndex(this.attributes.index);

      } else {
        this.geometry.addAttribute( name, this.attributes[name] );

      }

    });

    this.geometry.computeBoundingSphere();

    this.mesh = new THREE.Mesh( this.geometry, material );

    this.bytes = Object
      .keys(this.attributes)
      .map(attr => this.attributes[attr].array.length)
      .reduce( (a, b) =>  a + b, 0)
    ;

  },
  material: function (cfg) {

      var     
        pointers = new Array(cfg.amount).fill(0).map( () => Math.random() * cfg.length ),
        distance = SCN.camera.position.length() - CFG.earth.radius
      ;

      // https://threejs.org/examples/webgl_materials_blending.html

      return  new THREE.RawShaderMaterial({

        vertexShader:    SCN.Meshes.Multiline.shaderVertex(cfg.amount),
        fragmentShader:  SCN.Meshes.Multiline.shaderFragment(),

        depthTest:       true,                    // false ignores planet
        depthWrite:      false,
        blending:        THREE.AdditiveBlending,    // NormalBlending, AdditiveBlending, MultiplyBlending
        side:            THREE.DoubleSide,        // FrontSide (start=skewed), DoubleSide (start=vertical)
        transparent:     true,                    // needed for alphamap, opacity + gradient
        lights:          false,                   // no deco effex, true tries to add scene.lights

        shading:         THREE.SmoothShading,     // *THREE.SmoothShading or THREE.FlatShading
        vertexColors:    THREE.NoColors,          // *THREE.NoColors, THREE.FaceColors and THREE.VertexColors.

        wireframe:       false,

        uniforms: {

          color:            { type: 'c',    value: cfg.color },
          opacity:          { type: 'f',    value: cfg.opacity },
          lineWidth:        { type: 'f',    value: cfg.lineWidth },
          section:          { type: 'f',    value: cfg.section }, // length of trail in %

          // these are updated each step
          pointers:         { type: '1fv',  value: pointers },
          distance:         { type: 'f',    value: distance },

        },

      });

  },

  shaderVertex: function (amount) { return `

    // precision highp float;

    attribute float side;
    attribute vec2  uv;
    attribute vec3  next;
    attribute vec3  position;
    attribute vec3  previous;

    attribute float width;
    attribute vec3  colors;
    attribute float lineIndex;

    uniform mat4  projectionMatrix;
    uniform mat4  modelViewMatrix;

    uniform float distance;
    uniform float lineWidth;
    uniform vec3  color;
    uniform float opacity;

    uniform float pointers[  ${amount}  ];  // start for each line
    
    varying vec2  vUV;
    varying vec4  vColor;
    varying float vHead;
    varying float vCounter;

    vec2 dir;
    vec2 dir1;
    vec2 dir2;
    vec2 normal;
    vec4 offset;

    void main() {


        // vUV       = uv;
        vHead     = pointers[int(lineIndex)];   // get head for this segment
        vCounter  = fract(lineIndex);           // get pos of this segment 
        vColor    = vec4( colors, opacity );

        mat4 m = projectionMatrix * modelViewMatrix;

        vec4 finalPosition = m * vec4( position, 1.0 );
        vec4 prevPos       = m * vec4( previous, 1.0 );
        vec4 nextPos       = m * vec4( next, 1.0 );

        vec2 currP = finalPosition.xy / finalPosition.w;
        vec2 prevP = prevPos.xy       / prevPos.w;
        vec2 nextP = nextPos.xy       / nextPos.w;

        if      ( nextP == currP ) { dir = normalize( currP - prevP) ;}
        else if ( prevP == currP ) { dir = normalize( nextP - currP) ;}
        else {
            dir1 = normalize( currP - prevP );
            dir2 = normalize( nextP - currP );
            dir  = normalize( dir1  + dir2 );
        }

        normal  = vec2( -dir.y, dir.x );
        normal *= lineWidth * width * distance;

        offset = vec4( normal * side, 0.0, 1.0 );
        finalPosition.xy += offset.xy;

        gl_Position = finalPosition;

    }`;

  },
  shaderFragment: function () { return `

    precision mediump float;

    float alpha  = 0.0;

    uniform float section;   // visible segment length

    varying vec4  vColor;    // color from attribute, includes uni opacity
    varying float vHead;     // head of line segment
    varying float vCounter;  // current position, goes from 0 to 1 

    void main() {

      vec4  color = vColor;
      float head  = vHead;
      float tail  = max(0.0, vHead - section);
      float pos   = vCounter;

      if ( pos > tail && pos < head ) {
        alpha = (pos - tail) / section;

      } else if ( pos > ( 1.0 - section ) && head < section ) {
        alpha = ( pos - section - head ) / section; 

      } else {
        discard;

      }

      gl_FragColor = vec4( color.rgb, alpha * color.a );

    }`;

  },

};

SCN.Meshes.Multiline.line = function ( idx, vertices, colors, widths ) {

  this.idx       = idx;

  this.indices   = [];
  this.lineIndex = [];
  this.next      = [];
  this.positions = [];
  this.previous  = [];
  this.side      = [];
  this.uvs       = [];
  this.widths    = [];
  this.colors    = [];

  this.length = vertices.length;

  this.init(vertices, colors, widths);
  this.process();

  this.attributes = {
    index:     new THREE.BufferAttribute( new Uint16Array(  this.indices ),   1 ),
    lineIndex: new THREE.BufferAttribute( new Float32Array( this.lineIndex ), 1 ),
    next:      new THREE.BufferAttribute( new Float32Array( this.next ),      3 ),
    position:  new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ),
    previous:  new THREE.BufferAttribute( new Float32Array( this.previous ),  3 ),
    side:      new THREE.BufferAttribute( new Float32Array( this.side ),      1 ),
    uv:        new THREE.BufferAttribute( new Float32Array( this.uvs ),       2 ),
    width:     new THREE.BufferAttribute( new Float32Array( this.widths ),    1 ),
    colors:    new THREE.BufferAttribute( new Float32Array( this.colors ),    3 ),
  }

};

SCN.Meshes.Multiline.line.prototype = {
  constructor:  SCN.Meshes.Multiline.line,
  compareV3:    function( a, b ) {

    var aa = a * 6, ab = b * 6;

    return (
      ( this.positions[ aa     ] === this.positions[ ab     ] ) && 
      ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && 
      ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] )
    );

  },

  copyV3:       function( a ) {

    var aa = a * 6;
    return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ];

  },

  init:  function( vertices, colors, widths ) {

    var j, ver, cnt, col, wid, n, l = this.length;

    for( j = 0; j < l; j++ ) {

      ver = vertices[ j ];
      col = colors[ j ];
      wid = widths[ j ];
      cnt = j / vertices.length;

      this.positions.push( ver.x, ver.y, ver.z );
      this.positions.push( ver.x, ver.y, ver.z );
      this.lineIndex.push(this.idx + cnt);
      this.lineIndex.push(this.idx + cnt);
      this.colors.push(col.r, col.g, col.b);
      this.colors.push(col.r, col.g, col.b);
      this.widths.push(wid);
      this.widths.push(wid);

      this.side.push(  1 );
      this.side.push( -1 );
      this.uvs.push( j / ( l - 1 ), 0 );
      this.uvs.push( j / ( l - 1 ), 1 );

    }

    for( j = 0; j < l - 1; j++ ) {
      n = j + j;
      this.indices.push( n,     n + 1, n + 2 );
      this.indices.push( n + 2, n + 1, n + 3 );
    }

  },

  process:      function() {

    var j, v, l = this.positions.length / 6;

    v = this.compareV3( 0, l - 1 ) ? this.copyV3( l - 2 ) : this.copyV3( 0 ) ;
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );

    for( j = 0; j < l - 1; j++ ) {
      v = this.copyV3( j );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    for( j = 1; j < l; j++ ) {
      v = this.copyV3( j );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    v = this.compareV3( l - 1, 0 ) ? this.copyV3( 1 ) : this.copyV3( l - 1 ) ;
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

  }

};


// function Multiline (trailsVectors, trailsColors, trailsWidths, material, options) {



// Multiline.prototype = {
//   constructor: Multiline,

//   onAfterRender: function (renderer, scene, camera, geometry, material) {

//     var i, 
//       pointers = this.material.uniforms.pointers.value,
//       offset   = 1 / this.length
//     ;

//     for (i=0; i<this.amount; i++) {
//       pointers[i] = (pointers[i] + offset) % 1;
//     }

//     this.material.uniforms.pointers.needsUpdate = true;

//     material.uniforms.distance.value = camera.position.length() - CFG.earth.radius;
//     material.uniforms.distance.needsUpdate = true;
    
//   },

//   check: function (val, valDefault) {
//     return val === undefined ? valDefault : val;
//   },

//   createMaterial: function (options) {

//     var     
//       pointers = new Array(this.amount).fill(0).map( () => Math.random() * this.length ),
//       distance = SCN.camera.position.length() - CFG.earth.radius
//     ;

//     // https://threejs.org/examples/webgl_materials_blending.html

//     return  new THREE.RawShaderMaterial({

//       vertexShader:    this.shaderVertex(),
//       fragmentShader:  this.shaderFragment(),

//       depthTest:       true,                    // false ignores planet
//       depthWrite:      false,
//       blending:        THREE.AdditiveBlending,    // NormalBlending, AdditiveBlending, MultiplyBlending
//       side:            THREE.DoubleSide,        // FrontSide (start=skewed), DoubleSide (start=vertical)
//       transparent:     true,                    // needed for alphamap, opacity + gradient
//       lights:          false,                   // no deco effex, true tries to add scene.lights

//       shading:         THREE.SmoothShading,     // *THREE.SmoothShading or THREE.FlatShading
//       vertexColors:    THREE.NoColors,          // *THREE.NoColors, THREE.FaceColors and THREE.VertexColors.

//       wireframe:       false,

//       uniforms: {

//         color:            { type: 'c',    value: options.color },
//         opacity:          { type: 'f',    value: options.opacity },
//         lineWidth:        { type: 'f',    value: options.lineWidth },
//         pointers:         { type: '1fv',  value: pointers },
//         section:          { type: 'f',    value: options.section }, // length of trail in %
//         distance:         { type: 'f',    value: distance },

//       },

//     });

//   },

//   shaderVertex: function () {

//     return `

//       // precision highp float;

//       attribute float side;
//       attribute vec2  uv;
//       attribute vec3  next;
//       attribute vec3  position;
//       attribute vec3  previous;

//       attribute float width;
//       attribute vec3  colors;
//       attribute float lineIndex;

//       uniform mat4  projectionMatrix;
//       uniform mat4  modelViewMatrix;

//       uniform float distance;
//       uniform float lineWidth;
//       uniform vec3  color;
//       uniform float opacity;

//       uniform float pointers[  ${this.amount}  ];  // start for each line
      
//       varying vec2  vUV;
//       varying vec4  vColor;
//       varying float vHead;
//       varying float vCounter;

//       vec2 dir;
//       vec2 dir1;
//       vec2 dir2;
//       vec2 normal;
//       vec4 offset;

//       void main() {


//           // vUV       = uv;
//           vHead     = pointers[int(lineIndex)];   // get head for this segment
//           vCounter  = fract(lineIndex);           // get pos of this segment 
//           vColor    = vec4( colors, opacity );

//           mat4 m = projectionMatrix * modelViewMatrix;

//           vec4 finalPosition = m * vec4( position, 1.0 );
//           vec4 prevPos       = m * vec4( previous, 1.0 );
//           vec4 nextPos       = m * vec4( next, 1.0 );

//           vec2 currP = finalPosition.xy / finalPosition.w;
//           vec2 prevP = prevPos.xy       / prevPos.w;
//           vec2 nextP = nextPos.xy       / nextPos.w;

//           if      ( nextP == currP ) { dir = normalize( currP - prevP) ;}
//           else if ( prevP == currP ) { dir = normalize( nextP - currP) ;}
//           else {
//               dir1 = normalize( currP - prevP );
//               dir2 = normalize( nextP - currP );
//               dir  = normalize( dir1  + dir2 );
//           }

//           normal  = vec2( -dir.y, dir.x );
//           normal *= lineWidth * width * distance;

//           offset = vec4( normal * side, 0.0, 1.0 );
//           finalPosition.xy += offset.xy;

//           gl_Position = finalPosition;

//       } 

//     `;

//   },

//   /*
//         distance = 1 => width = 1
//                    2 => width = 0.5



//   */



//   shaderFragment: function () { return `

//     precision mediump float;

//     float alpha  = 0.0;

//     uniform float section;   // visible segment length

//     varying vec4  vColor;    // color from attribute, includes uni opacity
//     varying float vHead;     // head of line segment
//     varying float vCounter;  // current position, goes from 0 to 1 

//     void main() {

//         vec4  color = vColor;
//         float head  = vHead;
//         float tail  = max(0.0, vHead - section);
//         float pos   = vCounter;

//         if ( pos > tail && pos < head ) {
//           alpha = (pos - tail) / section;

//         } else if ( pos > ( 1.0 - section ) && head < section ) {
//           alpha = ( pos - section - head ) / section; 

//         } else {
//           discard;

//         }

//         gl_FragColor = vec4( color.rgb, alpha * color.a );

//     } 

//   `;},

// };



'use strict'

SCN.Meshes.atmosphere = function (name, cfg, callback) {

  var
    transparent  = true,
    geometry     = new THREE.SphereGeometry(cfg.radius, 128, 128),
    vertexShader = `

      varying vec3 vNormal, vPosition;
      
      void main() {

        vNormal   = normal;
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

        gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      }
    `,
    fragmentShader = `

      uniform float opacity;
      uniform vec3  sunPosition;
      uniform mat4  modelMatrix;       // = object.matrixWorld
      uniform mat3  normalMatrix;      // = inverse transpose of modelViewMatrix

      varying vec3  vNormal, vPosition;

      float fresnel, atmoFactor, reflecting, dotLight;

      vec3 worldNormal, worldView;
      vec3 color, colorDay, colorDark, colorSunset, colorNight;

      void main() {
        
        worldNormal = normalize ( normalMatrix * vNormal );                            
        worldView   = normalize ( cameraPosition -  (modelMatrix * vec4(vPosition, 1.0)).xyz );

        // dot world space normal with world space sun vector
        dotLight    = dot(worldNormal, sunPosition);

        // fresnel factor
        fresnel     = 1.0 - max(dot(worldNormal, worldView), 0.0);
        reflecting  = max(0.0, dot(reflect(worldView, worldNormal), sunPosition));

        atmoFactor  = max(0.0, pow(fresnel * 1.5, 1.5)) - max(0.0, pow(fresnel, 15.0)) * 6.0;

        colorDay    = vec3( 0.3,  0.7,  1.0);
        colorDark   = vec3( 0.0,  0.0,  0.5);
        colorSunset = vec3( 1.0,  0.3,  0.1);
        colorNight  = vec3( 0.05, 0.05, 0.1);
        
        colorDark   = mix(
          colorDark, 
          colorSunset + colorSunset * reflecting * 2.0, 
          pow(reflecting, 16.0) * max(0.0, dotLight + 0.7)
        );
        
        // colorDark = vec3(1.0, 0.0, 0.0);

        color  = mix(colorDay, colorDark,  min(1.0, (dotLight / 2.0 + 0.6) * 1.7));
        color  = mix(color,    colorNight, min(1.0, (dotLight / 2.0 + 0.4) * 1.5));
        color *= atmoFactor;
        
        gl_FragColor = vec4(color, opacity);

      }
    `,
    uniforms = {
      sunPosition: {'type': 'v3', 'value': SIM.sunVector}, //.clone()},
      opacity:     {'type': 'f',  'value': cfg.opacity},
    },
    mesh = new THREE.Mesh( geometry, new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent,
        uniforms,
      }) 
    ),

  end;

  mesh.onBeforeRender = function () {
    uniforms.sunPosition.value = SIM.sunVector;
    uniforms.sunPosition.needsUpdate = true;
  };

  cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

  callback(name, mesh);

};

SCN.Meshes.background = function (name, cfg, callback) {

  var
    geometry     = new THREE.PlaneBufferGeometry( 1, 1, 1, 1),

    vertexShader = `

      attribute vec3 colors;

      varying   vec2 vUv;  
      varying   vec3 vColor;  

      void main() {
        vUv         = uv;
        vColor      = colors;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,

    fragmentShader = `

      // Note that for mobiles you'll probably want to replace this by mediump since highp might be slower.

      // precision highp int;
      // precision highp float;

      varying vec3 vColor;  

      uniform float opacity;

      void main() {
        gl_FragColor = vec4(vColor, opacity);
      }
    `,

    material = new THREE.ShaderMaterial( {
      fragmentShader,
      vertexShader,
      uniforms: {
        opacity: {type: 'f', value: 0.999}
      }
    }),

    plane = new THREE.Mesh( geometry, material ),

    updateColors = function (colors) {

      // 0, 1
      // 2, 3

      var 
        pointer = 0, 
        target  = geometry.attributes.colors.array,
        color   = new THREE.Color()
      ;

      colors.forEach( (col) => {

        color.set(col);

        target[pointer++] = color.r;
        target[pointer++] = color.g;
        target[pointer++] = color.b;

      });

      geometry.attributes.colors.needsUpdate = true;

    },
    
    updatePosition = function () {


      var 
        camera = SCN.camera,
        aspect = IFC.geometry.aspect,
        fov    = camera.fov * PI / 180,
        height = 2 * Math.tan(fov / 2) * camera.radius + 2,
        width  = height * aspect,
        factor = 1 / SCN.scene.scale.x
      ;

      plane.position.copy(camera.position.clone().negate().normalize().multiplyScalar(2));
      plane.lookAt(camera.position);
      plane.scale.set(width * factor, height * factor, 1);

    }

  ;

  geometry.addAttribute( 'colors', new THREE.BufferAttribute( new Float32Array( 12 ), 3 ));

  updateColors(cfg.colors);

  plane.updateColors   = updateColors;
  plane.updatePosition = updatePosition;

  callback(name, plane);

};

'use strict'

SCN.Meshes.basemaps = function (name, cfg, callback) {

  var
    idx, vertex,  materials, mesh,
    geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
    urls = CFG.Faces.map( face => {

      if (cfg.cube.type === 'globe'){
        return H.replace(cfg.cube.texture, 'FACE', face);

      } else if (cfg.cube.type === 'polar') {
         return (face === 'top' || face === 'bottom') ? 
          H.replace(cfg.cube.texture, 'FACE', face) : 'images/transparent.face.512.png';
      }

    }),
  end;

  for (idx in geometry.vertices) {
    vertex = geometry.vertices[idx];
    vertex.normalize().multiplyScalar(cfg.cube.radius);
  }

  geometry.computeVertexNormals();

  RES.load({urls, type: 'texture', onFinish: function (err, responses) {

    materials = responses.map(response => {

      return new THREE.MeshLambertMaterial(Object.assign({ 
        map:         response.data,
        alphaTest:   0.99,
      }), cfg.material);

    });

    // mesh = new THREE.Mesh( geometry, new THREE.MultiMaterial( materials ) );
    mesh = new THREE.Mesh( geometry, materials );

    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    callback(name, mesh);

  }});

};

'use strict'

SCN.Meshes.basecopy = function (name, cfg, callback) {

  var
    idx, vertex,  materials, mesh,
    geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16),
    urls = CFG.Faces.map( face => {

      if (cfg.cube.type === 'globe'){
        return H.replace(cfg.cube.texture, 'FACE', face);

      } else if (cfg.cube.type === 'polar') {
         return (face === 'top' || face === 'bottom') ? 
          H.replace(cfg.cube.texture, 'FACE', face) : 'images/transparent.face.512.png';
      }

    }),

    vertexShader = `

      varying   vec2 vUv;  
      varying   vec3 vNormal;  
      varying   vec3 vPosition;  

      void main() {
        vUv         = uv;
        vNormal     = normal;
        vPosition   = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader = `

      // Note that for mobiles you'll probably want to replace this by mediump since highp might be slower.

      // precision highp int;
      // precision highp float;

      varying   vec2 vUv;  
      varying   vec3 vNormal;  
      varying   vec3 vPosition;  

      uniform float opacity;

      void main() {
        gl_FragColor = vec4(vColor, opacity);
      }
    `,

  end;

  for (idx in geometry.vertices) {
    vertex = geometry.vertices[idx];
    vertex.normalize().multiplyScalar(cfg.cube.radius);
  }

  geometry.computeVertexNormals();

  RES.load({urls, type: 'texture', onFinish: function (err, responses) {

    materials = responses.map(response => {

      return new THREE.MeshPhongMaterial(Object.assign({ 
        map:         response.data,
        alphaTest:   0.99,
      }), cfg.material);

    });

    mesh = new THREE.Mesh( geometry, new THREE.MultiMaterial( materials ) );

    cfg.rotation && mesh.rotation.fromArray(cfg.rotation);

    callback(name, mesh);

  }});

};

//  https://www.3dgep.com/texturing-and-lighting-with-opengl-and-glsl/
// http://adrianboeing.blogspot.de/2011/02/sphere-effect-in-webgl.html

'use strict'

SCN.Meshes.pixels = function (name, cfg, callback) {

  var
    geometry     = new THREE.PlaneGeometry( 2, 2, 1, 1 ),
    vertexShader = `

      uniform vec2 resolution;

      float aspect;
      vec3 pos;

      void main(void) {

        // aspect = resolution.x / resolution.y;

        // pos.x = position.x; 
        // pos.y = position.y * aspect * 2.0;

        // gl_Position = vec4(pos * 0.7, 1.0); 

        gl_Position = vec4(position * 0.98, 1.0); 

      }
    `,
    fragmentShader = `

      uniform float time, distance;
      uniform vec2 resolution;
      uniform sampler2D texture;
      uniform vec3 campos;

      uniform mat4 projectionMatrix;
      // uniform mat4 viewMatrix;
      
      vec2 p, uv, coords;

      float factor, radius, aspect;

      void main(void) {

        aspect = resolution.x / resolution.y;

        // SHADERTOY: vec2 p = (2.0 * fragCoord.xy - iResolution.xy ) / iResolution.y;
        // ORG:       vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;

        p   = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;   // */ => offset diagonal
        p.y = p.y / aspect;

        radius = sqrt(dot( p, p )) * aspect * distance / 2.6;      // sqrt: works with distance

        // radius close //


        factor = (1.0 - sqrt(1.0 - radius)) / ( radius ) * distance * aspect / 11.0;

        uv.x = 0.5 + p.x * factor;
        uv.y = 0.5 + p.y * factor * 2.0;

        // uv = ( viewMatrix * vec4(uv, 1.0, 1.0) ).xy;

        if (radius < 1.0) {
          gl_FragColor = vec4(texture2D(texture, uv).xyz, 0.5);

        } else {
          gl_FragColor = vec4(1.0, 0.5, 0.0, 0.2);

        }
      
      }
    `,

    uniforms = {
      // lightPos: { type: 'v3', value: new THREE.Vector3(4, 0, 0) },

      time:       { type: 'f',  value: 0.5 },
      texture:    { type: 't',  value: CFG.Textures[cfg.texture] },
      distance:   { type: 'f',  value: SCN.camera.position.length() },
      resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      campos:     { type: 'v3', value: SCN.camera.position}

    },

    material = new THREE.ShaderMaterial( {

      fragmentShader,
      vertexShader,
      uniforms,

      side:        THREE.DoubleSide,
      transparent : true,
      opacity :     0.5,

      // blending:     THREE.NormalBlending,
      // depthTest:    false,

    }),
    mesh = new THREE.Mesh( geometry, material ),

  end;

  mesh.onBeforeRender = function () {

    material.uniforms.time.value += .005;
    material.uniforms.campos.value = SCN.camera.position;
    material.uniforms.distance.value = SCN.camera.position.length();
    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

    material.uniforms.time.needsUpdate = true;
    material.uniforms.campos.needsUpdate = true;
    material.uniforms.distance.needsUpdate = true;
    material.uniforms.resolution.needsUpdate = true;

  };

  callback(name, mesh);

};


/*




//Script by Adrian Boeing
//www.adrianboeing.com
#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D tex;

void main(void) {

  vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
  vec2 uv;

  float r = sqrt(dot(p,p));
  float f =(3.0-sqrt(4.0-5.0*r*r))/(r*r+1.0);

  uv.x = p.x*f;
  uv.y = p.y*f;
  uv.x += 1.5*sin(time);
  uv.y += cos(time*0.5);

  float w = 1.7*(p.x+p.y+r*r-(p.x+p.y-1.0)*sqrt(4.0-5.0*r*r)/3.0)/(r*r+1.0);

  vec3 col =  texture2D(tex,uv).xyz;

  gl_FragColor = vec4(col*w,1.0);

}










*/
SCN.Meshes.population = function (name, cfg, callback) {

  // check shaders here:
  // http://www.neveroccurs.com/lab/three.js/gpu_particles/?particles=256
  // http://alteredqualia.com/three/examples/webgl_cubes.html
  // https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

  // TODO: make cities facing away from origin, implement lights

  var 
    i, city, vec3,
    amount    = CITIES.length,
    positions = new Float32Array( amount * 3 ),
    size      = new Float32Array( amount * 1 ),
    geometry  = new THREE.BufferGeometry(),
    toVec3    = function (lat, lon) {
      return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
    },
    clampScale = function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    vertexShader = `

      attribute float size;

      uniform float radius;

      void main() {
        gl_PointSize    = radius * size;
        gl_Position     = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }

    `,
    fragmentShader = `

      uniform sampler2D map;
      uniform vec3 ucolor;
      uniform float opacity;

      void main() {

        vec4 color1 = texture2D( map, gl_PointCoord ).rgba;

        if (color1.a <= 0.5 ) {
          discard;
        
        } else {
          vec3 color2   = mix(ucolor, color1.rgb, 0.5);
          gl_FragColor  = vec4( color2, opacity);

        }

      }

    `,
    material  = new THREE.ShaderMaterial({ 
      vertexShader,
      fragmentShader,
      transparent:    false,
      // vertexColors:   THREE.VertexColors,
      blending:       THREE.AdditiveBlending,
      uniforms: {
        'map':        { type: 't', value: CFG.Textures['dot.white.128.png'] },
        'opacity':    { type: 'f', value: cfg.opacity },
        'radius':     { type: 'f', value: cfg.radius },
        'ucolor':     { type: 'c', value: cfg.color },
      }
    }),
    points    = new THREE.Points( geometry, material )

  ;

  for (i=0; i<amount; i++) {

    city = CITIES[i];

    vec3 = toVec3(city.lat, city.lon);

    positions[i*3 + 0] = vec3.x;
    positions[i*3 + 1] = vec3.y;
    positions[i*3 + 2] = vec3.z;

    size[i] = ~~clampScale(city.pop, 1e6, 160e6, 2.0, 160.0); // Tokyo = 22Mill

  }

  geometry.addAttribute( 'size',     new THREE.BufferAttribute( size,     1 ) );
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

  geometry.computeBoundingSphere();

  callback(name, points);

};

// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    $$ = document.querySelectorAll.bind(document),

    simulator  = $$('.simulator')[0],
    fullscreen = $$('.fullscreen')[0],

    guiCont, guiMain, guiOpen = false,

    urlDirty   = false,

    controller, 

    intersections  = [],

    modus =    'space',

    globe = {
      scan:     NaN,   // -1 = tiny globe, 1 = big, 0 = little smaller than screen
      height:   NaN,   // 2 * radius
      sector:   []
    },

    geometry = {            // canvas actually
      height:   NaN,        // canvas
      width:    NaN,
      aspect:   NaN,
      diagonal: NaN,
      distance: NaN,        // camera
      radius:   NaN,
    },

    mouse = {
      x:          NaN, 
      y:          NaN, 
      px:         NaN, 
      py:         NaN, 
      down:       false, 
      button:     NaN,
      wheel:      {x: 0, y:0},
    },

    touch = {
      x:          NaN, 
      y:          NaN, 
      px:         NaN, 
      py:         NaN, 
      down:       false, 
    },

    pointer = {
      device:       mouse,             // assumption
      overGlobe:    false,
      overScreen:   false,
      intersect:    new THREE.Vector3(0, 0, 0),
      latitude:     NaN,
      longitude:    NaN,
    },

    raycaster = new THREE.Raycaster()
    // marker    = new THREE.Vector3()

  ;

  return self = {
    
    modus,
    pointer,
    geometry,
    controller,

    urlDirty,

    init: function () {

      self.events.resize();

      self.urlDirty = urlDirty;

      guiCont = $$('div.dg.ac')[0];
      guiMain = $$('div.dg.main.a')[0];

      // move gui.dat to fullscreen container
      fullscreen.appendChild(guiCont);

      // pos gui.dat
      guiMain.style.margin   = '0';
      guiMain.style.top      = '72px';
      guiMain.style.right    = '0';
      guiMain.style.width    = '';
      guiMain.style.position = 'absolute';

      // check this
      raycaster.params.Points.threshold = 0.001;

      // globe controller
      controller = self.controller = IFC.Controller;
      controller.init(SCN.camera, SCN.renderer.domElement, {

        minDistance: CFG.Camera.minDistance,
        maxDistance: CFG.Camera.maxDistance,

        onorient: function (callback /* , deltaX, deltaY, deltaZ */ ) {

          // eat for now
          callback(0, 0, 0);

        },

        ondrag: function (callback, deltaX, deltaY, deltaZ) {

          var timescale = H.scale(pointer.device.py, 0, geometry.height, 0.5, 10) ;

          if (modus === 'space') {

            if (pointer.overGlobe) {
              callback(deltaX, deltaY, deltaZ);

            } else {
              SIM.setSimTime(deltaX, 'hours');
              callback(0, 0, 0);

            }

          } else  {
            SIM.setSimTime(deltaX, 'hours');
            callback(0, 0, 0);

          }

        },
        onwheel: function (callback, deltaX, deltaY, deltaZ) {

          /* TODO: wheel, drag
              timescale: on bottom 1/3 screen.width = 1 day
              timescale: on top    1/3 screen.width = 1 hour
          */

          var timescale = H.scale(pointer.device.py, 0, geometry.height, 0.5, 20) ;

          if (pointer.overGlobe) {
            callback(deltaX, deltaY, deltaZ);

          } else {
            SIM.setSimTime( ~~(deltaX * -5 * timescale), 'minutes');
            callback(0, 0, 0);

          }

        },

        onRelax: function () {
          self.urlDirty = true;
        }

      });

      IFC.Hud.init();

    },
    toggleGUI: function () {

      guiOpen = !guiOpen;

      guiCont.style.display = guiOpen ? 'block' : 'none';
      window.GUI.closed = !guiOpen;

    },

    show: function () {

      $$('canvas.simulator')[0].style.display = 'block';

      // IFC.Hud.resize();
      IFC.Hud.time.render();
      IFC.Tools.updateUrl();
      self.urlDirty = false;

    },
      
    activate: function () {

      IFC.Hud.activate();

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'mouseenter'],
        [simulator, 'mouseover'],
        [document,  'mouseleave'],
        [document,  'mouseout'],
        // [simulator, 'wheel'],
        [simulator, 'click'],
        // [simulator, 'dblclick'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        [document,  'contextmenu'],
        [document,  'keydown'],
        [window,    'orientationchange'],
        // [window,    'deviceorientation'], // needs https
        // [window,    'devicemotion'],
        [window,    'resize'],
      
      ], (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );

      controller.activate();

    },
    step: function step (frame, deltatime) {

      controller.step(frame, deltatime);

      self.updatePointer();
      self.updateGlobe();
      self.updateLatLon();

      if (self.urlDirty)  {
        IFC.Tools.updateUrl();
        self.urlDirty = false;
      }

    },
    events: {
      onglobeenter: function () {
        ANI.insert(0, ANI.library.scaleGLobe( 1.0,  800))
        IFC.Hud.spacetime.updateModus('space');
        IFC.Hud.performance.selectModus(1);
      },
      onglobeleave: function () {
        ANI.insert(0, ANI.library.scaleGLobe( 0.94, 800));
        IFC.Hud.spacetime.updateModus('time');
        IFC.Hud.performance.selectModus(2);
      },
      resize: function () {

        // TODO: Chrome on Android drops last event on leave fullscreen

        geometry.width    = window.innerWidth;
        geometry.height   = window.innerHeight;
        geometry.aspect   = geometry.width / geometry.height;
        geometry.diagonal = Math.hypot(geometry.width, geometry.height);

        geometry.w2       = geometry.width  / 2;
        geometry.h2       = geometry.height / 2;

        simulator.style.width  = geometry.width  + 'px';
        simulator.style.height = geometry.height + 'px';
        simulator.width        = geometry.width;
        simulator.height       = geometry.height;

        SCN.resize(geometry);
        IFC.Hud.resize(geometry);

        // geometry.width    = SCN.renderer.domElement.width;
        // geometry.height   = SCN.renderer.domElement.height;
        // geometry.aspect   = geometry.width / geometry.height;
        // geometry.diagonal = Math.hypot(geometry.width, geometry.height);


      },
      click:   function (event) { 
        // pointer.device = mouse;
        // if (!pointer.overGlobe) {GUI.closed = !GUI.closed;}

      },      
      contextmenu:   function (event) { 
        IFC.Tools.eat(event);
      },      
      dblclick:   function (event) { 
        // pointer.device = mouse;

        // if (!pointer.overGlobe) {
        //   if (screenfull.enabled) {
        //     screenfull.toggle(fullscreen);
        //   }        

        // } else {
        //   ANI.insert(0, ANI.library.cam2vector(pointer.intersect, 2))

        // }
        
        // console.log('dblclick');

      },
      mousedown:   function (event) { 

        pointer.device = mouse;
        mouse.down = true;
        mouse.button = event.button;

        // console.log('mousedown', event.button, event);

        // TODO: swap buttons, mind orbit drag

        if (mouse.button === 0) {
          // SCN.objects.arrowHelper.visible && SCN.objects.arrowHelper.setDirection( pointer.intersect );
          // marker.copy(pointer.intersect);
        }

        if (mouse.button === 2) {
          if (pointer.overGlobe){
            ANI.insert(0, ANI.library.cam2vector(pointer.intersect, 2));
          }
        }

      },
      mouseup:     function () { 
        pointer.device = mouse;
        mouse.down     = false;
        mouse.button   = NaN;
      },
      mousemove:   function (event) { 
        pointer.device = mouse;
        mouse.px = event.clientX; 
        mouse.py = event.clientY;
        mouse.x  =   ( event.clientX / geometry.width )  * 2 - 1;
        mouse.y  = - ( event.clientY / geometry.height ) * 2 + 1;
      },
      mouseenter:   function () { 
        pointer.device = mouse;
        pointer.overScreen = true;
        SCN.setComb(1);
      },
      mouseleave:  function () {
        pointer.overScreen = false;
        SCN.setComb(4);
      },
      keydown:     function (event) { 

        var keys = {
          ' ': () => SCN.toggleRender(),
          'g': () => self.toggleGUI(),
          'm': () => IFC.Hud.toggleMenu(),
          't': () => SIM.setSimTime( -1, 'hours'),
          'z': () => SIM.setSimTime(  1, 'hours'),
        };

        if (keys[event.key]) {
          keys[event.key]();          
          // console.log('IFC.keydown.done', `'${event.key}'`);
          return IFC.Tools.eat(event);
        }

      },

      touchstart:  function (event) { 
      
        console.log('touchstart');

        touch.down = event.touches.length > 0;
        touch.px   = event.touches[ 0 ].pageX;
        touch.py   = event.touches[ 0 ].pageY;
        touch.x    =   ( touch.px / geometry.width )  * 2 - 1;
        touch.y    = - ( touch.py / geometry.height ) * 2 + 1;

        pointer.device = touch;

      },
      touchmove:   function () { 
        pointer.device = touch;
      },
      touchend:    function (event) { 
        pointer.device = touch;
        touch.down = event.touches.length === 0;
      },
      touchcancel: function (event) { 
        pointer.device = touch;
        touch.down = event.touches.length === 0;
      },

      devicemotion:      function (event) { /* console.log('devicemotion', event)      */ },
      deviceorientation: function (event) { /* console.log('deviceorientation', event) */ },

      orientationchange: function (event) { console.log('orientationchange', event)       },

    },

    toggleSpaceTime: function () {

      modus = self.modus = modus === 'space' ? 'time' : 'space';

      IFC.Hud.spacetime.updateModus();

    },
    
    updateGlobe: function () {

      // https://stackoverflow.com/questions/15331358/three-js-get-object-size-with-respect-to-camera-and-object-position-on-screen

      var 
        cam      = SCN.camera,
        fov      = cam.fov * Math.PI / 180,
        height   = 2 * Math.tan( fov / 2 ) * cam.position.length(),
        fraction = CFG.earth.radius * 2 / height
      ;

      globe.height = geometry.height * fraction;

      globe.scan = (
        globe.height > geometry.diagonal                              ? 1 : // big
        globe.height > geometry.width || globe.height > geometry.height ? 0 : // fits
          -1                                                              // tiny
      );

    },
    updatePointer: function () {

      var 
        intersection, 
        isOver  = false, 
        wasOver = pointer.overGlobe
      ;

      intersections.splice(0, intersections.length);
      raycaster.setFromCamera( pointer.device, SCN.camera );
      SCN.objects.pointer.raycast(raycaster, intersections)

      if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
        pointer.intersect.copy(intersection.point).normalize();
        isOver = true;
      
      } else {
        pointer.intersect.set(0, 0, 0);

      }

      (  isOver && !wasOver ) && self.events.onglobeenter();
      ( !isOver &&  wasOver ) && self.events.onglobeleave();

      pointer.overGlobe = isOver;

    },

    updateLatLon: function () {

      var v = pointer.intersect;

      if (v.x || v.y || v.z) {
        pointer.latitude  = 90 - (Math.acos(v.y))  * 180 / PI;
        pointer.longitude = ((270 + (Math.atan2(v.x , v.z)) * 180 / PI) % 360);

      } else {
        pointer.latitude  = NaN;
        pointer.longitude = NaN;

      }

    },

  };

}());

'use strict'

IFC.initGUI = function () {

  // dat.gui
  var 
    gui = new dat.GUI({
      closeOnTop: true,
      // autoPlace: false,
      // width: GUI.DEFAULT_WIDTH
      // parent: document.querySelectorAll('div.fullscreen')[0]
    }),

    guiFolders = {},

    controllers = {

    };

    gui.closed = true;

  // dat.GUI.toggleHide(); // total hide

  H.each(CFG.Preset, (folder, options) => {

    var defs = {}, fn;

    // root params
    if (!options.isFolder) {

      defs[folder] = options;

      if (typeof options === 'function'){
        controllers[folder] = gui.add(defs, folder).onChange(options);

      } else if (typeof options === 'string') {
        controllers[folder] = gui.add(defs, folder, options).onChange(function (value) {
          SCN.actions(folder, 'update', value);
        });

      } else {
        controllers[folder] = gui.add(defs, folder, options).onChange(function (value) {
          SCN.actions(folder, 'toggle', value);
        });

      }


    } else {

      delete options.isFolder;

      // prep folders
      H.each(options, (option, value) => {
        if (option !== 'isFolder'){
          defs[option] = value.val ? value.val : value;
        }

      });

      guiFolders[folder] = gui.addFolder(folder);
      controllers[folder] = {};

      // prep actions

      H.each(options, (option, value) => {

        fn = SCN.actions.bind(null, folder, option);

        if (value.val && value.choose) {
          controllers[folder][option] = guiFolders[folder].add(defs, option, value.choose).onChange(fn);
        
        } else if (value.val) {

          if (value.step) {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value.min, value.max).step(value.step).onChange(fn);

          } else {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value.min, value.max).onChange(fn);

          }

        } else {

          if (H.endsWith(option, 'color')) {
            controllers[folder][option] = guiFolders[folder].addColor(defs, option, value).onChange(fn);

          } else if (typeof value === 'function') {
            controllers[folder][option] = guiFolders[folder].add(defs, option).onChange(fn);

          } else {
            controllers[folder][option] = guiFolders[folder].add(defs, option, value).onChange(fn);

          }

        }

      });

    }

  });

  // this is rubbish
  window.GUIcontrollers = controllers;
  window.GUI = gui;

  // controllers['Loading'].setValue('please wait a second...');

};

IFC.Tools = {

  eat: function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  },

  formatLatLon: function (prefix, ll) {
    
    ll.lat = ll.lat < 0 ? 'S ' + Math.abs(ll.lat).toFixed(0) : 'N ' + Math.abs(ll.lat).toFixed(0);
    ll.lon = ll.lon < 0 ? 'E ' + Math.abs(ll.lon).toFixed(0) : 'W ' + Math.abs(ll.lon).toFixed(0);

    return `<strong>${prefix}</strong> ${ ll.lat }, ${ ll.lon }`;

  },

  updateUrl: TOOLS.debounce(function () {

    // TODO: coords vector to Lat/Lon

    if (!CFG.isLoaded) {return;}

    var 
      prec   = 6,
      time   = SIM.time.model.format('YYYY-MM-DD-HH-mm'),
      assets = SCN.scene.children
        .filter(  c => c.visible && c.name !== 'camera')
        .map(     c => CFG.Objects[c.name].id)
        .filter( id => !!id),
      hash   = CFG.Manager.assets2hash(assets) || 0,
      pos    = SCN.camera.position,
      coords = `${H.round(pos.x, prec)};${H.round(pos.y, prec)};${H.round(pos.z, prec)}`,
      path   = `/${hash}/${time}/${coords}`;

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

  raycast: function raycast( pointer, intersects ) {

    var raycaster = raycaster.setFromCamera( pointer.device, SCN.camera );

    var geometry = this.geometry;
    var material = this.material;
    var matrixWorld = this.matrixWorld;

    if ( material === undefined ) return;

    // Checking boundingSphere distance to ray

    if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

    sphere.copy( geometry.boundingSphere );
    sphere.applyMatrix4( matrixWorld );

    if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

    //

    inverseMatrix.getInverse( matrixWorld );
    ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

    // Check boundingBox before continuing

    if ( geometry.boundingBox !== null ) {

      if ( ray.intersectsBox( geometry.boundingBox ) === false ) return;

    }

    var intersection;

    if ( geometry.isBufferGeometry ) {

      var a, b, c;
      var index = geometry.index;
      var position = geometry.attributes.position;
      var uv = geometry.attributes.uv;
      var i, l;

      if ( index !== null ) {

        // indexed buffer geometry

        for ( i = 0, l = index.count; i < l; i += 3 ) {

          a = index.getX( i );
          b = index.getX( i + 1 );
          c = index.getX( i + 2 );

          intersection = checkBufferGeometryIntersection( this, raycaster, ray, position, uv, a, b, c );

          if ( intersection ) {

            intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indices buffer semantics
            intersects.push( intersection );

          }

        }

      } else {

        // non-indexed buffer geometry

        for ( i = 0, l = position.count; i < l; i += 3 ) {

          a = i;
          b = i + 1;
          c = i + 2;

          intersection = checkBufferGeometryIntersection( this, raycaster, ray, position, uv, a, b, c );

          if ( intersection ) {

            intersection.index = a; // triangle number in positions buffer semantics
            intersects.push( intersection );

          }

        }

      }

    } else if ( geometry.isGeometry ) {

      var fvA, fvB, fvC;
      var isMultiMaterial = Array.isArray( material );

      var vertices = geometry.vertices;
      var faces = geometry.faces;
      var uvs;

      var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
      if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;

      for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

        var face = faces[ f ];
        var faceMaterial = isMultiMaterial ? material[ face.materialIndex ] : material;

        if ( faceMaterial === undefined ) continue;

        fvA = vertices[ face.a ];
        fvB = vertices[ face.b ];
        fvC = vertices[ face.c ];

        if ( faceMaterial.morphTargets === true ) {

          var morphTargets = geometry.morphTargets;
          var morphInfluences = this.morphTargetInfluences;

          vA.set( 0, 0, 0 );
          vB.set( 0, 0, 0 );
          vC.set( 0, 0, 0 );

          for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

            var influence = morphInfluences[ t ];

            if ( influence === 0 ) continue;

            var targets = morphTargets[ t ].vertices;

            vA.addScaledVector( tempA.subVectors( targets[ face.a ], fvA ), influence );
            vB.addScaledVector( tempB.subVectors( targets[ face.b ], fvB ), influence );
            vC.addScaledVector( tempC.subVectors( targets[ face.c ], fvC ), influence );

          }

          vA.add( fvA );
          vB.add( fvB );
          vC.add( fvC );

          fvA = vA;
          fvB = vB;
          fvC = vC;

        }

        intersection = checkIntersection( this, raycaster, ray, fvA, fvB, fvC, intersectionPoint );

        if ( intersection ) {

          if ( uvs && uvs[ f ] ) {

            var uvs_f = uvs[ f ];
            uvA.copy( uvs_f[ 0 ] );
            uvB.copy( uvs_f[ 1 ] );
            uvC.copy( uvs_f[ 2 ] );

            intersection.uv = uvIntersection( intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC );

          }

          intersection.face = face;
          intersection.faceIndex = f;
          intersects.push( intersection );

        }

      }

    }

  },

};
IFC.Hud = (function () {

  var 
    self,

    $$ = document.querySelectorAll.bind(document),

    doRender    = true,

    simulator   = $$('.simulator')[0],

    camera      = new THREE.OrthographicCamera (0, 0, 100, 100, 1, 10 ),
    scene       = new THREE.Scene(),
    menu        = new THREE.Object3D(),
    sprites     = {},

    touch       = {x: NaN, y: NaN, sprite: null},
    mouse       = {x: NaN, y: NaN, sprite: null},

    zone        = {left:0, top: 0, right: 0, bottom: 0}, // hittest

    menuToggled = false,
    menuScale   = NaN;
  ;

  return self = {

    menu,
    sprites,
    
    init: function () {

      var geo = IFC.geometry;

      camera.position.z = 10;

      menuScale = ( geo.width + 64 ) / geo.width * 3
      menu.scale.set(menuScale, menuScale, 1);

      self.initSprites();
      scene.add(menu);
      scene.add(camera);

      self.resize(geo);

    },
    render: function (renderer) {
      doRender && renderer.render( scene, camera );
    },
    resize: function (geometry) {

      camera.left   = - geometry.w2;
      camera.right  =   geometry.w2;
      camera.top    =   geometry.h2;
      camera.bottom = - geometry.h2;

      camera.updateProjectionMatrix();

      menuScale = ( geometry.width + 64 ) / geometry.width * 3

      self.posSprites();

    },

    initSprites: function () {

      // TODO: read sprite status from SCN.objects.XXX.visible

      var geo = IFC.geometry;

      H.each(CFG.Sprites, (name, cfg) => {

        var 
          widget = IFC.Hud[name],
          sprite = new THREE.Sprite( new THREE.SpriteMaterial({
            opacity :     cfg.material.opacity,
            transparent : true,
        }));

        // https://threejs.org/examples/webgl_sprites.html
        // material.map.offset.set( -0.5, -0.5 );
        // material.map.repeat.set( 2, 2 );

        if (cfg.visible === false) {return;}

        sprite.cfg    = cfg;
        sprite.name   = name;
        sprites[name] = sprite;

        cfg.menu ? menu.add( sprite ) : scene.add( sprite );

        // setup material
        if (cfg.material.image) {
          sprite.material.map = CFG.Textures[cfg.material.image];
        } 

        if (cfg.material.color) {
          sprite.material.color = cfg.material.color;
        }

        // setup size
        if (cfg.position.width === '100%') {
          sprite.scale.set( geo.width, cfg.position.height, 1 );

        } else {
          sprite.scale.set( cfg.position.width, cfg.position.height, 1 );

        }

        // setup event handler
        if (cfg.hover !== false) {  // is explicit

          sprite.onmouseenter = sprite.touchstart = function () {
            ANI.insert(0, ANI.library.sprite.enter(sprite, 200));
          };

          sprite.onmouseleave = sprite.touchend = function () {
            ANI.insert(0, ANI.library.sprite.leave(sprite, 200));
          };

        } else {
          sprite.onmouseleave = sprite.onmouseenter = () => {};

        }

        if (cfg.onclick) {
          sprite.click = cfg.onclick.bind(sprite, sprite);
        }

        // init widget
        if (widget) {
          widget.init(sprite, cfg);
          sprite.widget = widget;
        }

      });

    },
    posSprites: function () { 

      var
        pos, 
        w  = IFC.geometry.width,
        h  = IFC.geometry.height,
        w2 = w / 2,
        h2 = h / 2;

      H.each(sprites, (name, sprite) => {

        pos = sprite.cfg.position;

        if (pos.width === '100%') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , pos.zIndex );
          sprite.scale.setX(w);

        } else if (pos.bottom && pos.right){
          sprite.position.set( + w2 - pos.right - pos.width / 2, -h2 + pos.bottom + pos.height / 2 , pos.zIndex );

        } else if (pos.bottom && pos.left){
          sprite.position.set( - w2 + pos.left + pos.width / 2, -h2 + pos.bottom + pos.height / 2 , pos.zIndex );

        } else if (pos.right && pos.top) {
          sprite.position.set( + w2 - pos.right - pos.width / 2, h2 - pos.top - pos.height / 2 , pos.zIndex );

        } else if (pos.center && pos.center === 'x') {
          sprite.position.set( 0, h2 - pos.top - pos.height / 2 , pos.zIndex );

        } else {
          sprite.position.set( - w2 + pos.left + pos.width / 2, h2 - pos.top - pos.height / 2 , pos.zIndex );

        }

      });

    },

    toggle: function () {

      // needed for screen shots
      doRender = !doRender;
      
    },
    activate: function () {

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        [window,    'orientationchange'],
      
      ], (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );

    },

    step: function (frame, deltatime) {

      !(frame % 4) && IFC.Hud.time.render();

      IFC.Hud.spacetime.render();

    },

    events: {

      mousedown: function (event) {
        // console.log('HUD.mousedown')
      },
      mouseup: function (event) {

        mouse.sprite && mouse.sprite.click();
        // mouse.sprite && console.log('HUD.mouseup', mouse.sprite.name);

      },
      mousemove: function (event) {

        var x, y, sprite;

        x = mouse.x = event.pageX;
        y = mouse.y = event.pageY; 

        if (( sprite = self.testHit(x, y) )) {

          // fast mouse
          if (mouse.sprite && sprite !== mouse.sprite) {
            mouse.sprite.hit = false;
            mouse.sprite.onmouseleave();
            mouse.sprite = null;
          }

          if (!sprite.hit) {
            sprite.hit = true;
            sprite.onmouseenter();
          }

          mouse.sprite = sprite;


        } else {

          if (mouse.sprite) {
            mouse.sprite.hit = false;
            mouse.sprite.onmouseleave();
            mouse.sprite = null;
          }

        }

      },
      touchstart: function (event) {

        var x, y, sprite;

        if ( event.changedTouches.length === 1) {

          x = event.changedTouches[ 0 ].pageX;
          y = event.changedTouches[ 0 ].pageY;

          // console.log('HUD.touchstart', x, y);

          if (( sprite = self.testHit(x, y) )) {

            touch.x = x;
            touch.y = y;
            touch.sprite = sprite;

            // console.log('touchstart', x, y, sprite.name);

          }

        }

      },
      touchend: function (event) {

        var 
          sprite,
          x = event.changedTouches[ 0 ].pageX,
          y = event.changedTouches[ 0 ].pageY
        ;

        if (( sprite = self.testHit(x, y) )) {

          if (sprite === touch.sprite){

            sprite.click && sprite.click();

            IFC.Tools.eat(event);

          }

        }

        touch.x = NaN;
        touch.y = NaN;
        touch.sprite = null;

      },

      orientationchange: function (event) {

        self.resize();
        console.log('HUD.orientationchange')

      },

    },

    toggleMenu: function () {

      menuToggled = !menuToggled;
      menuToggled && menu.scale.set(0.01, 0.01, 1);

      ANI.insert(0, ANI.library.menu.scale(menuToggled ? 1 : menuScale, 400));

    },
    testHit: function testHit (x, y) {

      // works in screen space 0/0 = left/top

      var 
        pos, isMenu, isActive, 
        hit   = false, 
        found = null, 
        menuX = IFC.Hud.menu.position.x,
        menuY = IFC.Hud.menu.position.y,
        geo   = IFC.geometry,
        w     = geo.width,
        h     = geo.height,
        w2    = geo.w2,
        h2    = geo.h2
      ;

      H.each(sprites, (name, sprite) => {

        pos      = sprite.cfg.position;
        isMenu   = sprite.cfg.menu; 
        isActive = !(isMenu && !menuToggled);

        if (!found && isActive && !!sprite.cfg.onclick) {

          if (pos.bottom !== undefined && pos.left !== undefined){

            zone.left   = !isMenu ?     pos.left    : menuX +     pos.left;
            zone.bottom = !isMenu ? h - pos.bottom  : menuY + h - pos.bottom;
            zone.top    = zone.bottom - pos.height;
            zone.right  = zone.left   + pos.width;

          } else if (pos.right !== undefined && pos.bottom !== undefined) {

            zone.right  = !isMenu ? w - pos.right   : menuX + w - pos.right;
            zone.bottom = !isMenu ? h - pos.bottom  : menuY + h - pos.bottom;
            zone.top    = zone.bottom - pos.height;
            zone.left   = zone.right - pos.width;

          } else if (pos.right !== undefined && pos.top !== undefined) {

            zone.right  = !isMenu ? w - pos.right   : menuX + w - pos.right;
            zone.top    = !isMenu ?     pos.top     : menuY +     pos.top;
            zone.left   = zone.right - pos.width;
            zone.bottom = zone.top   + pos.height;

          } else if (pos.left !== undefined && pos.top !== undefined) {

            zone.left   = !isMenu ? pos.left    : menuX + pos.left;
            zone.top    = !isMenu ? pos.top     : menuY + pos.top;
            zone.right  = zone.left  + pos.width;
            zone.bottom = zone.top   + pos.height;

          } else if (pos.center !== undefined && pos.center === 'x') {

            // can't be menu button

            zone.top    = pos.top;
            zone.left   = w2 - pos.width / 2;
            zone.bottom = zone.top   + pos.height;
            zone.right  = zone.left  + pos.width;

          } else if (pos.center !== undefined && pos.center === 'y') {
            console.log('IFC.testHit', sprite.name, 'unhandled pos');

          } else {
            console.log('IFC.testHit', sprite.name, 'strange pos');
          }

          hit = x > zone.left && y > zone.top && x < zone.right && y < zone.bottom;

          found = hit ? sprite : null;

        }

      });

      return found;

    },

  };

}());

IFC.Hud.spacetime = (function () {

  var 
    self, cfg, modus, 
    sprite, cvs, ctx, texture,
    vecUp       = new THREE.Vector3(0, 1, 0),
    vecRot      = new THREE.Vector3(0, 0, 0)
  ;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');

      cvs.width  = 64;
      cvs.height = 64;

      texture = new THREE.CanvasTexture(cvs);

      self.updateModus();
      self.render();

    },

    updateModus: function (force) {

      modus = force === undefined ? IFC.modus : force;

      sprite.material.map = (modus === 'space') ?
        CFG.Textures['hud/space.png'] : 
        texture
      ;

      sprite.material.map.needsUpdate = true;

    },

    render: function () {

      (modus === 'space') ? self.renderSpace() : self.renderTime();
        
    },
    renderSpace: function () {
      
      var veloX, veloY, angle;

      if (IFC.controller) {

        ({veloX, veloY} = IFC.controller.info());

        if (veloX || veloY) {

          vecRot.setX(veloX);
          vecRot.setY(-veloY);
          // vecRot.normalize();

          angle = vecRot.angleTo(vecUp);
          
          sprite.material.rotation = angle;

          // console.log(angle);

        }

      }

    },
    renderTime: function () {

      // credits: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations

      var 
        w    = cvs.width,  w2 = w/2,
        h    = cvs.height, h2 = h/2,
        time = SIM.time.model,
        sec  = time.seconds(),
        min  = time.minutes(),
        hr   = time.hours() % 12;

      sprite.material.rotation = 0;

      ctx.save();

      ctx.clearRect(0, 0, w, h);
      ctx.translate(w2, h2);
      ctx.scale(0.4, 0.4);
      ctx.rotate(-Math.PI / 2);

      ctx.strokeStyle = 'white';
      ctx.lineCap = 'round';

      // Hours
      ctx.save();
      ctx.rotate(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec);
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();
      ctx.restore();

      // Minutes
      ctx.save();
      ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(56, 0);
      ctx.stroke();
      ctx.restore();

      // Circle
      ctx.beginPath();
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#ddd';
      ctx.arc(0, 0, 72, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.restore();

    }

  };

}());

IFC.Hud.time = (function () {

  var 
    self,
    sprite,
    cfg,
    cvs, ctx, // img,
    texture
  ;

  return self = {
    init:  function (mesh, config) {

      sprite = mesh;
      cfg    = config;
      cvs    = cfg.canvas;
      ctx    = cvs.getContext('2d');

      cvs.width  = cfg.position.width;
      cvs.height = cfg.position.height;

      ctx.font         = '24px monospace'
      ctx.fillStyle    = '#eee';
      ctx.textBaseline = 'bottom';

      texture = new THREE.CanvasTexture(cvs);

      sprite.material.map = texture;

      self.render();

    },
    render: function () {

      var 
        metrics,
        // simDate = SIM.time.model.format('YYYY-MM-DD'),
        // simTime = SIM.time.model.format('HH:mm [UTC]'),
        simDate = SIM.time.fmtDay,
        simTime = SIM.time.fmtHour,
        simDoe  = SIM.time.doe.toFixed(2)
      ;

      if (ctx) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        // debug
        // ctx.fillStyle = 'rgba(200, 0, 0, 0.5)'
        // ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#ddd'

        ctx.font = 'bold 22px monospace'
        metrics = ctx.measureText(simDate);
        ctx.fillText(simDate, (cvs.width - metrics.width) / 2, 34);

        ctx.font = 'bold 16px monospace'
        metrics = ctx.measureText(simTime);
        ctx.fillText(simTime, (cvs.width - metrics.width) / 2, 54);

        ctx.font = 'bold 11px monospace'
        metrics = ctx.measureText(simDoe);
        // ctx.fillText(simDoe, (cvs.width - metrics.width) / 2, 66);

        texture.needsUpdate = true;

      }

    },

  };

}());
IFC.Hud.performance = (function () {

  var 
    self, sprite,  cfg,
    cvs, ctx, back, texture, ctxBack,
    stats = {
      now:  NaN,
      last: NaN,
      fps:  NaN,
    },
    bufDur = H.createRingBuffer(60),
    bufFps = H.createRingBuffer(60),
    lineFills = {
      '0': '#666',
      '1': '#fff',
      '2': '#666',
    },
    modus = 2,
    modi = {
      1: 'Debug',
      2: 'Scene',
      3: 'Bandwidth',
    };

  return self = {
    selectModus: function (param) {

      if (typeof param === 'string') {
        debugger;
        modus = modi[param];
      } else if (typeof param === 'number') {
        modus = param;
      } else {
        modus = (modus + 1) > 3 ? 1 : (modus + 1);
      }

    },
    init:  function (mesh, config) {

      sprite  = mesh;
      cfg     = config;
      cvs     = cfg.canvas;
      ctx     = cvs.getContext('2d');
      back    = cfg.back;
      ctxBack = back.getContext('2d');

      cvs.width  = back.width  = cfg.position.width;
      cvs.height = back.height = cfg.position.height;

      texture = sprite.material.map = new THREE.CanvasTexture(cvs);

    },
    render: function () {

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      // debug
      // ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
      // ctx.fillRect(0, 0, cvs.width, cvs.height);

      self['render' + modi[modus]]();

      texture.needsUpdate = true;

    },
    renderDebug:     function () {

      var 
        line = 1,
        state = IFC.controller.status(),
        tmp2m = NaN
      ;

      // tmp2m = SIM.models.tmp2m && SIM.models.tmp2m.interpolateLL(IFC.pointer.latitude, IFC.pointer.longitude) - KELVIN;

      // ctx.font = '11px monospace'
      // ctx.fillStyle = '#ddd';
      // ctx.textBaseline = 'bottom';

      // // ctx.fillText('alpha: ' + state.alpha, 4, line++ * 14);
      // // ctx.fillText('beta:  ' + state.beta,  4, line++ * 14);
      // // ctx.fillText('gamma: ' + state.gamma, 4, line++ * 14);

      // ctx.fillText('LAT: ' + IFC.pointer.latitude.toFixed(4),  4, line++ * 14);
      // ctx.fillText('LON: ' + IFC.pointer.longitude.toFixed(4), 4, line++ * 14);
      // ctx.fillText('TMP: ' + (tmp2m ? tmp2m.toFixed(1) : 'X') + ' °C',          4, line++ * 14);

    },
    renderBandwidth: function () {

      ctx.font      = '11px monospace'
      ctx.fillStyle = '#ddd';

      ctx.fillText('bandwidth', 4, cvs.height / 2);

    },
    renderScene:     function () {

      var 
        val, i,
        off  = 1,
        max  = 18,
        zero = 29 + max;

      val = H.scale(stats.fps, 0, 60, 0, max ),

      ctxBack.globalCompositeOperation = 'source-over';

      // paint fps line in new column
      ctxBack.fillStyle = stats.fps > 50 ? '#008800' : '#ee0000';
      ctxBack.fillRect(back.width - off, zero, off, -val);

      ctxBack.globalCompositeOperation = 'copy';

      // move left off pixel column
      ctxBack.drawImage(back, off, 0, back.width - off, back.height, 0, 0, back.width - off, back.height);

      // render front
      ctx.drawImage(back, 0, 0);

      // horizontal lines
      for (i=0; i<3; i++){
        ctx.fillStyle = lineFills[i];
        ctx.fillRect(0, cvs.height/4.5 * (i +1), cvs.width, 1.1);
      }

      // print fps, dur
      ctx.font = '11px monospace'
      ctx.fillStyle = '#ddd';
      ctx.fillText(bufDur.avg().toFixed(1) + 'd',   100, 62);
      ctx.fillText(bufFps.avg().toFixed(1) + 'fps',   0, 62);

    },
    begin: function () {
      stats.now = window.performance.now();
      stats.fps = stats.last ? 1000 / (stats.now - stats.last) : 60;
      bufFps.push(stats.fps);
      stats.last = stats.now;
    },
    end:   function () {
      bufDur.push(window.performance.now() - stats.now);
    },
  };


}());
'use strict'

IFC.Controller = (function () {

  const
    PI    = Math.PI,
    TAU   = PI * 2,
    EPS   = 0.000001,
    max   = Math.max,
    min   = Math.min,
    abs   = Math.abs,
    hypot = Math.hypot
  ;

  var 
    self, interval, cam, home, dispatcher,

    cfg        = {},
    spcl       = new THREE.Spherical(),

    enabled    = false,

    frameCounter = 0,

    attOrientX = H.createAttenuator(10),
    attOrientY = H.createAttenuator(10),

    veloX      = 0,
    veloY      = 0,
    veloZ      = 0,

    alpha      = NaN,
    beta       = NaN,
    gamma      = NaN,

    keys       = { down: false, key: ''},
    mouse      = { down: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } },
    touch      = { down: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } }, // 1 finger
    swipe      = { diff: {x: NaN, y:NaN }, last: {x: NaN, y:NaN } }, // 2 fingers

    isMoving   =  false,
    wasMoving  =  false,

    status     = {},

    defaults   = {

      minDistance:   1.2,
      maxDistance:   8.0,

      onwheel:       null,
      ondrag:        null,
      onorient:      null,
      
      onkey:         () => {},

      onRelax:       () => {},
      onAwake:       () => {},

      keys:          ['t', 'z', 'u', 'i', 'o', 'p'],
      lookAt:        new THREE.Vector3(0, 0, 0),

      dampX:         0.94,
      dampY:         0.94,
      dampZ:         0.90,

      keyXimpulse:   0.05,
      keyYimpulse:   0.05,
      keyZimpulse:   0.5,

      wheelYimpulse: 0.5,
      wheelXimpulse: 0.5,

      moveXimpulse:  0.004,
      moveYimpulse:  0.004,

      keyInterval:   100,

      keyactions: {
        'y': () => self.stop(),
        'x': () => self.reset(),
        'a': (ix        ) => self.impulse( -ix,   0,   0),   // X, rotate left  negative
        'd': (ix        ) => self.impulse(  ix,   0,   0),   // X, rotate right positive
        'w': (ix, iy    ) => self.impulse(   0, -iy,   0),   // Y, rotate up    negative, inverted
        's': (ix, iy    ) => self.impulse(   0,  iy,   0),   // Y, rotate down  positive, inverted
        'e': (ix, iy, iz) => self.impulse(   0,   0,  iz),   // Z, zoom   out   positive
        'q': (ix, iy, iz) => self.impulse(   0,   0, -iz),   // Z, zoom   in    positive
      }

    };

  function eat (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  function scale (x, xMin, xMax, min, max) {
    return (max - min) * (x - xMin) / (xMax - xMin) + min;
  }

  function distanceScale (x, min, max) {
    return (max-min)*(x-cfg.minDistance)/(cfg.maxDistance-cfg.minDistance)+min;
  }

  return self = {

    spherical: spcl,

    status: function () {

      status.alpha = alpha;
      status.beta  = beta;
      status.gamma = gamma;

      status.veloX = veloX;
      status.veloY = veloY;
      status.veloZ = veloZ;

      status.attOrientX = attOrientX();
      status.attOrientY = attOrientY();

      return status;

    },

    init: function (camera, element, config) {

      cam  = camera;
      home = cam.position.clone();

      dispatcher = [
        [element,   'mousedown'],
        [element,   'mouseup'],
        [element,   'mousemove'],
        [element,   'mouseleave'],
        [element,   'wheel'],
        [element,   'touchstart'],
        [element,   'touchmove'],
        [element,   'touchend'],
        [element,   'touchcancel'],
        [document,  'keydown'],
        [document,  'keyup'],
        // [window,    'devicemotion'],
        [window,    'deviceorientation'],   // against fixed frame
      ];
      
      spcl.setFromVector3(cam.position);

      Object.assign(cfg, defaults, config);

    },
    
    activate: function () {
      enabled = true;
      H.each(dispatcher, (_, e) => e[0].addEventListener(e[1], self.events[e[1]], false) );
    },
    deactivate: function () {
      enabled = false;
      H.each(dispatcher, (_, e) => e[0].removeEventListener(e[1], self.events[e[1]], false) );
    },

    info: function () {
      return {
        veloX,
        veloY,
        veloZ,
      }
    },
    reset: function () {
      self.stop();
      cam.position.copy(home);
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

      var radius = cam.radius;

      if (enabled) {

        frameCounter += 1;

        veloX = abs(veloX) > EPS ? veloX * cfg.dampX : 0;  // right/left
        veloY = abs(veloY) > EPS ? veloY * cfg.dampY : 0;  // up/down
        veloZ = abs(veloZ) > EPS ? veloZ * cfg.dampZ : 0;  // zoom

        isMoving = veloX || veloY || veloZ;

        (  isMoving && !wasMoving ) && cfg.onAwake();
        ( !isMoving &&  wasMoving ) && cfg.onRelax();

        wasMoving = isMoving;

        if (veloX || veloY) {

          spcl.radius = radius;
          spcl.theta += veloX * deltatime;           // E/W
          spcl.phi   += veloY * deltatime;           // N/S

          // keep between zero and TAU
          spcl.theta = spcl.theta > TAU ? spcl.theta - TAU : spcl.theta;

          // mind the poles
          spcl.phi = max(EPS,      spcl.phi);
          spcl.phi = min(PI - EPS, spcl.phi);

          cam.position.setFromSpherical(spcl);

          // calc lat/lon
          cam.phi    = spcl.phi;
          cam.theta  = spcl.theta;
          cam.radius = spcl.radius;

        }

        if (veloZ) {

          radius *= 1 + ( veloZ * deltatime / radius );

          radius  = (
            radius < cfg.minDistance ? cfg.minDistance :
            radius > cfg.maxDistance ? cfg.maxDistance :
              radius
          );

          cam.position.setLength(radius);

        }

        cam.lookAt(cfg.lookAt);

      }

    },

    events: {
      deviceorientation: function (event) {

        // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
        // https://www.html5rocks.com/en/tutorials/device/orientation/
        
        !(frameCounter % 10) && attOrientX(event.gamma);  // [-90,90]    tilted right-to-left
        !(frameCounter % 10) && attOrientY(event.beta);   // [-180,180]  tilted front-to-back

        var 
          deltaX = event.gamma - attOrientX(),
          deltaY = event.beta  - attOrientY();

        alpha = event.alpha;   // ~0 pointing north, [0,360]
        beta  = event.beta;    // ~0 on flat surface, +90  top titlted up
        gamma = event.gamma;   // ~0 on flat surface, -90, tilted left

        if (abs(deltaX) > 0.1 || abs(deltaX) > 0.1) {

          deltaX = scale (deltaX, -20, +20, -0.1, +0.1 );
          deltaY = scale (deltaY, -20, +20, -0.1, +0.1 );

          if (cfg.onorient) {
            cfg.onorient(self.impulse, deltaX, deltaY, 0);

          } else {
            self.impulse(deltaX, deltaY, 0);

          }

        }

      },
      mouseleave:      function (event) {
        self.events.mouseup(event);
      },
      mousedown:    function (event) {
        mouse.down.x = event.pageX;
        mouse.down.y = event.pageY;
        mouse.last.x = event.pageX;
        mouse.last.y = event.pageY;
      },
      mouseup:      function (event) {
        mouse.down.x = NaN;
        mouse.down.y = NaN;
        mouse.last.x = NaN;
        mouse.last.y = NaN;
      },
      mousemove:    function (event) {

        var 
          deltaX, deltaY, 
          distance = cam.position.length(),
          factor   = distanceScale(distance, 1, cfg.maxDistance - cfg.minDistance)
        ;

        if ( !isNaN(mouse.down.x) ) {

          deltaX = (mouse.last.x - event.pageX) * cfg.moveXimpulse * factor;
          deltaY = (mouse.last.y - event.pageY) * cfg.moveYimpulse * factor;

          if (cfg.ondrag) {
            cfg.ondrag(self.impulse, deltaX, deltaY, 0);

          } else {
            self.impulse(deltaX, deltaY, 0);

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
          impFactor = distanceScale(distance, 0.2, cfg.maxDistance - cfg.minDistance)
        ;

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

        if (cfg.onwheel) {
          cfg.onwheel(self.impulse, deltaX, deltaY, deltaZ)

        } else {
          self.impulse(deltaX, deltaY, deltaZ);

        }
        
        return eat(event);

      },
      touchcancel:    function (event) {
        self.stop();
      },
      touchend:   function (event) {

        // console.log('touchend');

        if (event.touches.length === 1) {
          // touch.last.x = event.changedTouches[0].pageX;
          // touch.last.y = event.changedTouches[0].pageY;
        }

        touch.down.x = NaN;
        touch.down.y = NaN;
        swipe.diff.x = NaN;
        swipe.diff.y = NaN;

      },
      touchstart:   function (event) {

        switch ( event.touches.length ) {

          case 1: 
            touch.down.x = event.touches[ 0 ].pageX;
            touch.down.y = event.touches[ 0 ].pageY;
            touch.last.x = touch.down.x;
            touch.last.y = touch.down.y;
          break;

          case 2: 
            swipe.diff.x = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            swipe.diff.y = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            swipe.last.x = swipe.diff.x;
            swipe.last.y = swipe.diff.y;
          break;

          case 3: 
            // not implemented yet
          break;

        }

      },
      touchmove:  function (event) {

        var 
          deltaX, deltaY, deltaZ,
          distance  = cam.position.length(),
          impFactor = distanceScale(distance, 1, cfg.maxDistance - cfg.minDistance)
        ;

        if (event.changedTouches.length === 1) {

          deltaX = (touch.last.x - event.changedTouches[0].pageX) * cfg.moveXimpulse * impFactor;
          deltaY = (touch.last.y - event.changedTouches[0].pageY) * cfg.moveYimpulse * impFactor;

          if (cfg.ondrag) {
            cfg.ondrag(self.impulse, deltaX, deltaY, 0)

          } else {
            self.impulse(deltaX, deltaY, 0);

          }

          touch.last.x = event.changedTouches[0].pageX;
          touch.last.y = event.changedTouches[0].pageY;

          return eat(event);

        }

        if ( event.changedTouches.length === 2 ) { 

          swipe.diff.x = event.changedTouches[ 0 ].pageX - event.changedTouches[ 1 ].pageX;
          swipe.diff.y = event.changedTouches[ 0 ].pageY - event.changedTouches[ 1 ].pageY;

          deltaZ = hypot(swipe.diff.x, swipe.diff.y) - hypot(swipe.last.x, swipe.last.y);

          self.impulse(0, 0, -deltaZ * impFactor * 0.01);

          swipe.last.x = swipe.diff.x;
          swipe.last.y = swipe.diff.y;

          // touch.last.x = event.changedTouches[0].pageX;
          // touch.last.y = event.changedTouches[0].pageY;

          return eat(event);

        }

      },
      keydown:    function (event) {

        var 
          distance  = cam.position.length(),
          impFactor = distanceScale(distance, 1, cfg.maxDistance - cfg.minDistance),
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
        [ CFG.Manager.lockOrientation, [ 'portrait-primary' ] ],
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
        [ navigator.vibrate.bind(navigator), [200] ], // needs https soon;

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

      var sequence = [];


      H.each(CFG.Objects, (name, config) => {

        var fn;

        if (config.type !== 'simulation'){

          config.name = name;

          if (config.visible){

            fn = function (callback) {
              self.message('', name);
              setTimeout(function () {
                SCN.Tools.loader[config.type](name, config, callback);
              }, delay);
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

      function registerResEvent () {
        RES.onload = function (url) {
          $info.text(url.split('/').slice(-1)[0]);
        }
      }

      function unregisterResEvent () {
        RES.onload = null;
      }

      var sequence = [
        [registerResEvent]
      ];

      H.each(CFG.Objects, (name, config) => {

        var action;

        if (config.type === 'simulation'){

          config.name = name;

          if (config.visible){

            action = function (callback) {
              self.message('', config.title);
              setTimeout(function () {
                SCN.Tools.loader[config.type](name, config, callback);
              }, delay);
            };

            sequence.push([action, 'callback']);

          } else {
            SCN.objects[name] = config;

          }
        }

      });

      sequence.push([unregisterResEvent]);

      return sequence;

    },

  };

}() );