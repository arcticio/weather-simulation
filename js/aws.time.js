/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, TIM, padZero */

// function isDate(d) {
//   if ( Object.prototype.toString.call(d) !== "[object Date]" ){return false;}
//   return !isNaN(d.getTime());
// }


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
