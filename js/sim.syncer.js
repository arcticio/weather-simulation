/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, SIM, TIM, H, DEBUG */
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

SIM.Syncer = (function () {

    var self;

    return {
        boot: function () {return (self = this);

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


        }, parseForErrors : function (text) {

            var nodes = $.parseHTML( text ),
                errors = nodes.filter(function (node){
                    return (node.innerText || node.innerHTML || "").toLowerCase().indexOf("error") !== -1;
                });

            return !errors.length ? null : errors.map(function (e) {return e.innerHTML;});


        }, sync : function (cfg, callback) {

            self.get( cfg.root, function (err, text) {

                var title, errors, nodes, dayurl, last, runs;

                if (err){
                    callback(err, null); 
                    return;
                }

                if (( errors = self.parseForErrors(text) )){
                    TIM.step("FAILED", "GFS Latest: ");
                    callback(err, null);
                    return;
                }

                nodes = $.parseHTML( text );

                // check for error
                title = nodes.filter(function (node){return node.nodeName === "TITLE";})[0].innerHTML;
                if (title.toLowerCase().indexOf("error") !== -1){
                    TIM.step("FAILED", "GFS Latest: ");
                    console.log("Model.sync: title:", title);
                    return;
                }

                last = nodes
                    .filter(function (node) {return node.nodeName === "B";})
                    .map(function (node) {
                        var l = node.innerHTML.length; 
                        return node.innerHTML.slice(l-10, l-2);
                    })
                    .sort().slice(-1)[0]
                ;

                dayurl = cfg.root + "/gfs" + last;

                TIM.step("SYNCED", "GFS Day: " + dayurl.split("/").slice(-1)[0]);

                self.get(dayurl, function (err, text) {

                    if (err){callback && callback(err, null); return;}

                    runs = $.parseHTML( text )
                        .filter(function (node) {
                            return node.nodeName === "B" && node.innerHTML.indexOf("anl") === -1;
                        })
                        .map(function (node) {
                            var l = node.innerHTML.length; 
                            return (
                                cfg.name === "0.25d_1h" ?
                                    node.innerHTML.slice(l-17, l-1) :
                                    node.innerHTML.slice(l-13, l-1)
                            );
                        })
                        .sort().slice(-1)
                    ;

                    TIM.step("SYNCED", "GFS Run: " + runs[0]);

                    callback(null, last + "/" + runs[0]);

                });

            });


        }

    };


}()).boot();