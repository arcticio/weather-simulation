/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, SIM, TIM, H, async, DEBUG */
/*jshint -W030 */

/*

Data URL:      http://nomads.ncep.noaa.gov:9090/dods/gfs_0p25/gfs20160510/gfs_0p25_06z
Description:   GFS 0.25 deg starting from 06Z10may2016, downloaded May 10 10:42 UTC
Longitude:     0.00000000000°E to 359.75000000000°E   (1440 points, avg. res. 0.25°)
Latitude:      -90.00000000000°N to 90.00000000000°N   (721 points, avg. res. 0.25°)
Altitude:      1000.00000000000 to 10.00000000000       (26 points, avg. res. 39.6)
Time:          06Z10MAY2016 to 06Z20MAY2016             (81 points, avg. res. 0.125 days)

DOCU: http://nomads.ncdc.noaa.gov/guide/?name=advanced

*/

SIM.Model = (function () {

    "use strict";

    var self,

        server = "//ice-pics.appspot.com/nomads", 

        configs = {
            "0.25d_1h": {
                name            : "0.25d_1h",
                url             : "",
                resolution      : 0.25,
                root            : server + "/gfs_0p25_1hr",
                timeRange       : 120,
                timeDistance    : 1,
                timeSteps       : 120 // Range / Distance
            },
            "0.25d_3h": {
                name            : "0.25d_3h",
                url             : "",
                resolution      : 0.25,
                root            : server + "/gfs_0p25",
                timeRange       : 56,
                timeDistance    : 2,
                timeSteps       : 28
            }
        },

        // setting default model
        cfg = configs["0.25d_1h"];

    return {

        boot: function () {
            return (self = this);

        }, sync: function (callback) {

            var response;

            SIM.Syncer.sync(cfg, function (err, subfolder) {
                if (err){return;}
                response = subfolder.slice(0, 8) + "_" + subfolder.slice(-3)
                cfg.url = cfg.root + "/gfs" + subfolder;
                callback(response);
            });
        
        }, get : function (url, callback) {
            var req = new XMLHttpRequest();
            req.open("GET", url);
            req.send(null);
            req.onload = function () {
                callback(null, req.responseText);
            };
            req.onerror = function (e) {
                callback(e, null);
            };

        }, getForecast : function (lat, lng, chartinfo, callback) {

            lng = lng < 0 ? 180 + (lng + 180) : lng;

            var tasks, 
                nLat = ~~H.scale(lat,  -90,  +90, 0,  720)     + '',
                nLng = ~~H.scale(lng,    0, +360, 0, 1440 -1)  + '',
                cons = H.format("[0:%s:%s][%s][%s]", cfg.timeDistance, cfg.timeRange -1, nLat, nLng),
                vari2url = function (vari) {
                    return cfg.url + ".ascii?" + vari + cons;
                };

            DEBUG && console.log("model.getForecast cons/lat/lon", cons, ~~lat, ~~lng);

            tasks = chartinfo.varis.map(vari2url).map(function (url) {
                return function (callback) {
                    self.get(url, function (err, dods) {

                        if (err){callback(err, null); return;}

                        var errs = self.parseForErrors(dods);

                        if (errs){
                            callback(errs, null);
                        } else {
                            callback(null, [chartinfo, self.parseSingleDods(dods)]);
                            // callback(null, chartinfo, self.parseSingleDods(dods));
                        }

                    });
                };

            });

            async.parallel(tasks, callback);


        }, toDate : function (datum) {

            var day = parseInt(datum, 10),
                flt = parseFloat(datum),
                scs = (flt - day) * (24 * 60 * 60),
                utc  = new Date(Date.UTC(-1, 0, day, 0, 0, scs)),
                year = utc.getUTCFullYear();

            utc.setUTCFullYear(year+2);
            return utc;

        }, stripHours : function (date) {

            return new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            ));

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


        }, parseMultiDods : function (dods) {

            var t0 = Date.now(),

                trenner = ', ',
                snan  = "9.999E20",
                lines = dods.split("\n").filter(function (l) {return l.trim().length; }),
                info  = lines.slice(-6),
                head  = lines.slice(0),

                vari  = head.split(trenner)[0],
                shape = head.match( /(\[\d+)/g ).join(' ').match(/(\d+)/g).map(Number),

                tims  = info[1].split(trenner).map(self.toDate),
                lats  = Float32Array.from(info[3].split(trenner).map(Number)),
                lons  = Float32Array.from(info[5].split(trenner).map(Number)),

                date  = self.stripHours(tims[0]),

                data  = Float32Array.from(
                    self.flatten(lines
                        .slice(1, -6)
                        .map(line => line.split(trenner).slice(1))
                    ).map(num => num === snan ? NaN : parseFloat(num))
                ),
                spend = Date.now() - t0;

            return {lats, lons, tims, shape, vari, date, data, spend};


        }, parseSingleDods : function (dods) {

            var token, numFloat, 
                datagramm  = {}, 
                lines = dods.split("\n").filter(function (l) {return l.trim().length; }),
                vari = lines[0].split(",")[0],
                lng  = parseFloat(lines[cfg.timeSteps + 6]);

            datagramm.datas  = [];
            datagramm.vari   = vari;
            datagramm.stamps = lines[cfg.timeSteps + 2].split(", ").map(self.toDate);
            datagramm.lat    = parseFloat(lines[cfg.timeSteps + 4]);
            datagramm.lng    = lng > 180 ? -180 + (lng - 180): lng;

            lines.slice(1, cfg.timeSteps + 1).forEach(function (line) {
                token = line.split(", ")[1];
                numFloat = (token === "9.999E20") ? NaN : parseFloat(token);
                datagramm.datas.push( SIM.Vars[vari].adjust ? 
                    SIM.Vars[vari].adjust(numFloat) : 
                    numFloat
                );
            });

            datagramm.min = Math.min.apply(Math, datagramm.datas.filter(function (n) {return !isNaN(n); }));
            datagramm.max = Math.max.apply(Math, datagramm.datas.filter(function (n) {return !isNaN(n); }));

            datagramm.minDate = self.stripHours(datagramm.stamps[0]);

            // console.log(vari, datagramm.min, datagramm.max, datagramm.datas.map(function (n) { return n.toFixed(1); }));

            return datagramm;


        }, parseForErrors : function (text) {

            var nodes = $.parseHTML( text ),
                errors = nodes
                    .filter(function (node){
                        return (node.innerText || node.innerHTML || "").toLowerCase().indexOf("error") !== -1;
                    })
                ;

            return !errors.length ? null : errors.map(function (e) {return e.innerHTML;});

        }



    };

}()).boot();