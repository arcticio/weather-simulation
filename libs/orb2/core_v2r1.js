// core2.js  sub-script for orb2.js
// NOTE orb.js and orb2.js is not compatible.
//
// Orb 2.0.1 - Javascript Library for Astronomical Calcrations
//
// Copyright (c) 2015 KASHIWAI, Isana
// Dual licensed under the MIT (MIT-LICENSE.txt), 
// and GPL (GPL-LICENSE.txt) licenses.
//
// Date: 2015-01-09 00:00:00 JST
// Rev: 0001
//

// This script includes "json2.js" on the last part of the file.
// "json2.js" creates a global JSON object
// Copyright/License: Public Domain
// ref. http://www.JSON.org/js.html

"use strict";
// var Core
Orb.Core = {
  Tool : {
  DataLoader : function(option){
    var XMLhttpObject;
    var createXMLhttpObject = function(){
      XMLhttpObject = false;
      if(window.XMLHttpRequest) {
        XMLhttpObject = new XMLHttpRequest();
      }else if(window.ActiveXObject) {
        try {
          XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP");
        }catch(e){
          if(console){console.log(e)}
          XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP");
        }
      }
      return XMLhttpObject;
    }
    
    var Loader = function(option) {
      XMLhttpObject=createXMLhttpObject();
      if (!XMLhttpObject){return;}
      XMLhttpObject.open("GET", option.path, option.ajax);
      XMLhttpObject.send(null);
      if(option.ajax==false){
        try{
          if(option.format === "json"){
            var data = JSON.parse(XMLhttpObject.responseText);
          }else{
            var data = XMLhttpObject.responseText;
          }
          if(option.callback !== undefined){
            option.callback(data);
          }else{
            return data;
          }
        }catch(e){
          if(console){console.log(e)}
          return;
        }
      }else{
        try{
          XMLhttpObject.onreadystatechange = function() {
            if(XMLhttpObject.readyState == 4){
              if(XMLhttpObject.status == 200){
                var data = JSON.parse(XMLhttpObject.responseText);
                if(callback){
                  callback(data);
                }else{
                  return data;
                }
              }
            }else{
              return;
            }
          }
        }catch(e){
          if(console){console.log(e)}
          return;
        }
      }
    }
    return Loader(option);
  } // end Core.Tool.DataLoader
}, // end Core.Tool

Time :  function(date){
  if(!date){
    var _date = new Date();
  }else{
    var _date = date;
  }

  var _getUTCArray = function(_date){
    return {
      year: _date.getUTCFullYear(),
      month: _date.getUTCMonth()+1,
      day: _date.getUTCDate(),
      hours: _date.getUTCHours(),
      minutes: _date.getUTCMinutes(),
      seconds: _date.getUTCSeconds()
    }
  }
  
  var _utc = _getUTCArray(_date);
  var _time_in_day = function(){
      return _utc.hours/24 + _utc.minutes/1440 + _utc.seconds/86400
  }  
  var _jd = function(){
      var year = _utc.year;
      var month = _utc.month;;
      var day = _utc.day;
      var calender = "";

      if(month <= 2){
        var year = year - 1;
        var month = month + 12;
      }

      var julian_day = Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day-1524.5;

      if (calender == "julian"){
        var transition_offset=0;
      }else if(calender == "gregorian"){
        var tmp = Math.floor(year/100);
        var transition_offset=2-tmp+Math.floor(tmp/4);
      }else if(julian_day<2299160.5){
        var transition_offset=0;
      }else{
        var tmp = Math.floor(year/100);
        var transition_offset=2-tmp+Math.floor(tmp/4);
      }
      var jd=julian_day+transition_offset ;
      return jd;
  }
  var _gmst = function(){
      var rad=Math.PI/180;
      var time_in_sec = _utc.hours*3600 + _utc.minutes*60 + _utc.seconds;
      var jd = _jd();
      //gmst at 0:00
      var t = (jd-2451545.0)/36525;
      var gmst_at_zero = (24110.5484 + 8640184.812866*t+0.093104*t*t+0.0000062*t*t*t)/3600;
      if(gmst_at_zero>24){gmst_at_zero=gmst_at_zero%24;}
      //gmst at target time
      var gmst = gmst_at_zero+(time_in_sec * 1.00273790925)/3600;
      //mean obliquity of the ecliptic
      var e = 23+26.0/60+21.448/3600 -46.8150/3600*t -0.00059/3600*t*t +0.001813/3600*t*t*t;
      //nutation in longitude
      var omega = 125.04452-1934.136261*t+0.0020708*t*t+t*t*t/450000;
      var long1 = 280.4665 + 36000.7698*t;
      var long2 = 218.3165 + 481267.8813*t;
      var phai = -17.20*Math.sin(omega*rad)-(-1.32*Math.sin(2*long1*rad))-0.23*Math.sin(2*long2*rad) + 0.21*Math.sin(2*omega*rad);
      gmst =gmst + ((phai/15)*(Math.cos(e*rad)))/3600
      if(gmst<0){gmst=gmst%24+24;}
      if(gmst>24){gmst=gmst%24;}
      return gmst
  }

  var _mjd = function(){
      var jd = _jd();
      var mjd = jd - 2400000.5;
      return mjd;
  }
 
  var _tjd = function(){
      var jd = _jd();
      var tjd=jd - 2440000.5;
      return tjd;
  }
  var _delta_t = function(){
      //NASA - Polynomial Expressions for Delta T
      //http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
      var year = _utc.year;
      var month = _utc.month;;
      var y = year + (month - 0.5)/12

      if(year<=-500){
        var u = (y-1820)/100
        var dt = -20 + 32 * u*u;
      }else if(year>-500 && year<=500){
        var u = y/100;
        var dt = 10583.6 - 1014.41 * u + 33.78311 * u*u - 5.952053 * u*u*u - 0.1798452 * u*u*u*u + 0.022174192 * u*u*u*u*u + 0.0090316521 * u*u*u*u*u; 
      }else if(year>500 && year<=1600){
        var u = (y-1000)/100
        var dt = 1574.2 - 556.01 * u + 71.23472 * u*u + 0.319781 * u*u*u - 0.8503463 * u*u*u*u - 0.005050998 * u*u*u*u*u + 0.0083572073 * u*u*u*u*u*u;
      }else if(year>1600 && year<=1700){
        var t = y - 1600
        var dt = 120 - 0.9808 * t - 0.01532 * t*t + t*t*t/7129
      }else if(year>1700 && year<=1800){
        var t = y - 1700
        var dt = 8.83 + 0.1603 * t - 0.0059285 * t*t + 0.00013336 * t*t*t - t*t*t*t/1174000
      }else if(year>1800 && year<=1860){
        var t = y - 1800
        var dt = 13.72 - 0.332447 * t + 0.0068612 * t*t + 0.0041116 * t*t*t - 0.00037436 * t*t*t*t + 0.0000121272 * t*t*t*t*t - 0.0000001699 * t*t*t*t*t*t + 0.000000000875 * t*t*t*t*t*t*t;
      }else if(year>1860 && year<=1900){
        var t = y - 1860
        var dt = 7.62 + 0.5737 * t - 0.251754 * t*t + 0.01680668 * t*t*t -0.0004473624 * t*t*t*t + t*t*t*t*t/233174
      }else if(year>1900 && year<=1920){
        var t = y - 1900
        var dt = -2.79 + 1.494119 * t - 0.0598939 * t*t + 0.0061966 * t*t*t - 0.000197 * t*t*t*t
      }else if(year>1920 && year<=1941){
        var t = y - 1920
        var dt = 21.20 + 0.84493*t - 0.076100 * t*t + 0.0020936 * t*t*t
      }else if(year>1941 && year<=1961){
        var t = y - 1950
        var dt = 29.07 + 0.407*t - t*t/233 + t*t*t/2547
      }else if(year>1961 && year<=1986){
        var t = y - 1975
        var dt = 45.45 + 1.067*t - t*t/260 - t*t*t/718
      }else if(year>1986 && year<=2005){
        var t = y - 2000
        var dt = 63.86 + 0.3345 * t - 0.060374 * t*t + 0.0017275 * t*t*t + 0.000651814 * t*t*t*t + 0.00002373599 * t*t*t*t*t
      }else if(year>2005 && year<=2050){
        var t = y - 2000
        var dt = 62.92 + 0.32217 * t + 0.005589 * t*t
      }else if(year>2050 && year<=2150){
        /*
        This expression is derived from estimated values of ΔT in the years 2010 and 2050. The value for 2010 (66.9 seconds) is based on a linearly extrapolation from 2005 using 0.39 seconds/year (average from 1995 to 2005). The value for 2050 (93 seconds) is linearly extrapolated from 2010 using 0.66 seconds/year (average rate from 1901 to 2000).
        */
        var dt = -20 + 32 * ((y-1820)/100)*((y-1820)/100) - 0.5628 * (2150 - y)
        //The last term is introduced to eliminate the discontinuity at 2050.
      }else if(year>2150){
        var u = (y-1820)/100
        var dt = -20 + 32 * u*u
      }
    return dt;
    } // end of DeltaT()

    var _et = function(){
      var et = new Date();
      et.setTime(_date.getTime() + _delta_t());
      var time = new Orb.Time(et);
      return time;
    }
    
    var _utc_string = function FormatUTCDate(){
    return _utc.year +"-"+ZeroFill(_utc.month) + "-" + ZeroFill(_utc.day)  + " " + ZeroFill(_utc.hours) + ":" + ZeroFill(_utc.minutes) + ":" + ZeroFill(_utc.seconds);// + "." + ZeroFill((milliseconds/10).toFixed(0))
  }

  var _local_string = function FormatLocalDate(date){
    var date = _date
    var year = date.getFullYear()
    var month = date.getUTCMonth()+1
    if(month>12){
      year = year +1;
      month = 12-month;
    }
    var day = date.getDate() 
    var hours = date.getHours()
    var minutes = date.getMinutes() 
    var seconds = date.getSeconds()
    //var milliseconds = date.getMilliseconds()
    return year +"-"+ZeroFill(month) + "-" + ZeroFill(day)  + " " + ZeroFill(hours) + ":" + ZeroFill(minutes) + ":" + ZeroFill(seconds); //+ "." + ZeroFill((milliseconds/10).toFixed(0))
  }

  function ZeroFill(num){
    if(num<10){
     var str = "0" + num;
    }else{
     var str = num;
    }
    return str;
  }

  return {
    date : _date,
    year: Number(_utc.year),
    month: Number(_utc.month),
    day: Number(_utc.day),
    hours: Number(_utc.hours),
    minutes: Number(_utc.minutes),
    seconds: Number(_utc.seconds),
    time_in_day: _time_in_day,
    timezone: _date.getTimezoneOffset()/60,
    utc_string:_utc_string(),
    local_string:_local_string(),
    jd : function(){
      return _jd()+ _time_in_day()
    },
    gmst: _gmst,
    mjd: _mjd,
    tjd: _tjd,
    delta_t: _delta_t,
    et: _et
  } // end of return Core.Time
}, // end of Core.Time

Observer: function(pos){
  var rad=Math.PI/180;
  var a = 6377.39715500; // earth radius
  var e2 = 0.006674372230614;
  var n = a/(Math.sqrt(1-e2*Math.cos(pos.latitude*rad)))
  var ToRectangular = function(time,pos){
      var lat = pos.latitude;
      var lng = pos.longitude;
      var gmst = time.gmst();
      var lst = gmst*15 + lng;
      var a = 6378.135  //Earth's equational radius in WGS-72 (km)
      var f = 0.00335277945 //Earth's flattening term in WGS-72 (= 1/298.26)
      var sin_lat =Math.sin(lat*rad);
      var c = 1/Math.sqrt(1+f*(f-2)*sin_lat*sin_lat);
      var s = (1-f)*(1-f)*c;  
      return {
        x: a*c*Math.cos(lat*rad)*Math.cos(lst*rad),
        y: a*c*Math.cos(lat*rad)*Math.sin(lst*rad),
        z: a*s*Math.sin(lat*rad)
      }
  }
  return {
    position:{
      geographic: function(){
        return pos
      },
      rectangular: function(time){
        return ToRectangular(time,pos)
      }
    } 
  }// end of return Core.Observer
},
Observation:function(param){
 var target = param.target;
 var observer = param.observer;
  // Private members.
  var rad=Math.PI/180;
  var _radec2horizontal = function(time,target,observer){
      var ra = Number(target.ra);
      var dec = Number(target.dec);
      var latitude = Number(observer.latitude);
      var longitude = Number(observer.longitude);
      var altitutude = Number(observer.altitutude);
      dec = dec*rad
      var gmst = time.gmst();
      var hour_angle = (gmst*15 + longitude - (ra*15));
      var h = hour_angle*rad;
      var lat = latitude*rad;
      var azimuth = (Math.atan2(-Math.cos(dec)*Math.sin(h),Math.sin(dec)*Math.cos(lat)-Math.cos(dec)*Math.sin(lat)*Math.cos(h)))/rad;
      var elevation = (Math.asin(Math.sin(dec)*Math.sin(lat)+Math.cos(lat)*Math.cos(dec)*Math.cos(h)))/rad;
      if (azimuth<0){
        azimuth = azimuth%360 +360
      }
      return {
      azimuth : azimuth,
      elevation : elevation,
     }
  }
  var _rect2horizontal = function(time,rect,observer){
      var lat = observer.latitude;
      var lng = observer.longitude;
      var obsv = new Orb.Observer(observer);
      var ob  =obsv.position.rectangular(time)
      var rx0= rect.x - ob.x;
      var ry0= rect.y - ob.y
      var rz0= rect.z - ob.z
      var gmst = time.gmst();
      var lst = gmst*15 + lng;
      var rs = Math.sin(lat*rad)*Math.cos(lst*rad)*rx0 + Math.sin(lat*rad)*Math.sin(lst*rad)*ry0-Math.cos(lat*rad)*rz0;
      var re = -Math.sin(lst*rad)*rx0 + Math.cos(lst*rad)*ry0;
      var rz = Math.cos(lat*rad)*Math.cos(lst*rad)*rx0+Math.cos(lat*rad)*Math.sin(lst*rad)*ry0 + Math.sin(lat*rad)*rz0;
      var range = Math.sqrt(rs*rs+re*re+rz*rz);
      var elevation = Math.asin(rz/range);
      var azimuth  = Math.atan2(-re,rs);
      azimuth = azimuth/rad+180;
      if (azimuth>360){
        azimuth = azimuth%360;
      }
      return {
      azimuth : azimuth,
      elevation : elevation,
     }
  }
  var _horizontal = function(time){
    if(target.ra && target.dec){
      var horizontal = _radec2horizontal(time,target,observer)
    }else if(target.position.equatorial){
      var radec = target.position.equatorial(time)
      var horizontal = _radec2horizontal(time,radec,observer)
    }else if(target.position.rectangular){
      var rect = target.position.rectangular(time);
      var horizontal = _rect2horizontal(time,rect,observer)
    }
    return horizontal
  }
  return {
    // equatorial to horizontal
    horizontal: function(time){
        return _horizontal(time);
    } // end Orb.Observation.horizontal
  } // end of return
} // end of Orb.Observation

}