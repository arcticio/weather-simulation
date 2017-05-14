/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals SIM, TIM, H, $, DEVELOP */
/*jshint -W030 */

"use strict";

SIM.Blender = (function () {

    var self, 
        images = null,
        size   = NaN,
        doe    = NaN,
        slice  = NaN,
        doeMin = +1e6,
        doeMax = -1e6,
        doesSorted = null;

    return {
        boot: function () {
            return (self = this);

        }, makeUrl: function (iso) {
            
            var suffix = DEVELOP ? "?DEV" : "";
            return "//noiv.pythonanywhere.com/cors/amsr2/2016_0125_masked/amsr2-" + iso + ".png" + suffix;

        }, closestDoe: function (doe) {

            var i, lower, upper, len = doesSorted.length;

            for (i=1; i<len; i++) {
                if (doesSorted[i] > doe) {
                    lower = doesSorted[i-1];
                    upper = doesSorted[i];
                    return Math.abs( lower - doe ) < Math.abs( upper - doe ) ? lower : upper;
                }
            }

        }, loadImage: function (iso, onfinish) {

            var doe, img, url = self.makeUrl(iso);

            // console.log("loadImage", url);

            $.ajax({type: "HEAD", async: true, url: url

            }).done(function(message, text, xhr){

                // console.log("done", xhr, text, message);

                var mime = xhr.getResponseHeader("Content-Type");

                if ( mime === "image/png" ){

                    img = new Image();

                    img.crossOrigin = "anonymous";

                    img.onload = function () {
                        doe = H.iso2doe(iso);
                        images[doe] = img;
                        onfinish();
                    };
                    img.onerror = function () {
                        doe = H.iso2doe(iso);
                        console.log("SIM.Blender.onerror:", iso);
                        onfinish();
                    };
                    img.src = url;

                } else {

                    // console.log( "loadImage.fail", mime);

                    onfinish();
                }


            }).fail(function ( xhr, text, error) {

                console.log( "loadImage.fail", xhr, text, error);

                onfinish();

            });
        

        }, loadRange: function (isoRange, progress, onfinish) {

            var loaded = 0, sorter = function (a, b) {return a < b ? 1 : -1;};

            images = {};

            isoRange.forEach(function (url) {
                self.loadImage(url, function () {
                    loaded += 1;
                    progress(loaded);
                    if (loaded === isoRange.length){

                        doesSorted = Object.keys(images).sort(sorter);

                        if (doesSorted.length){
                            doeMax = doesSorted.slice(0)[0];
                            doeMin = doesSorted.slice(-1)[0];
                            TIM.step("LOADED", ["SIM.Blender:", doeMin, "->", doeMax].join(" "));
                        } else {
                            images = null;
                            TIM.step("LOADED", ["SIM.Blender:", "nothing"].join(" "));
                        }

                        onfinish();

                    }
                });
            });

        }, setDateSize: function (date, cvssize){

            var hours = date.getUTCHours();

            size   = cvssize;
            doe    = H.date2doe(date);                                                // give access to day of data
            slice  = (
                hours ===  0 ? 0.00 :
                hours ===  6 ? 0.25 :
                hours === 12 ? 0.50 :
                    1
            );

        }, blend: function (ctx, totalAlpha){

            var doeClose, oldAlpha = ctx.globalAlpha;

            if (!images){return;}

            if ( images[doe] && images[doe +1] ){

                ctx.globalAlpha = totalAlpha - totalAlpha * slice;
                ctx.drawImage(images[doe], 0, 0, size, size);

                ctx.globalAlpha = totalAlpha * slice;
                ctx.drawImage(images[doe +1], 0, 0, size, size);

                ctx.globalAlpha = oldAlpha;

            } else {

                doeClose = (
                    doe <= doeMin ? doeMin :
                    doe >= doeMax ? doeMax :
                        self.closestDoe(doe)
                );

                ctx.globalAlpha = 0.05;
                ctx.drawImage(images[doeClose], 0, 0, size, size);
                ctx.globalAlpha = oldAlpha;

            }

        }

    };


}()).boot();