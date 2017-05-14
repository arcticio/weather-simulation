/*jslint bitwise: true, browser: true, evil:true, devel: true, todo: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, SIM, TIM, H, dataTimeRanges, async, Slider, Sections, proj4, saveAs, CanvasJS, gifshot */
/*jshint -W030 */

var Simulator = (function () {

    "use strict";

    var self, ctx, cav, size, slider, simTime, ctxColorBar,

        TAU             = 2 * Math.PI,
        PI              = Math.PI,

        // dodsVaris       = ["tmp2m", "prmslmsl"],

        projSource      = new proj4.Proj('+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs'),
        projTarget      = new proj4.Proj('EPSG:4326'),
        extend          = 4194304,

        display         = "part",       // vis toggles
        doGears         = false,
        doDeco          = false,
        doCheck         = 5,            // run fps check
        doLatLon        = false,        // show chart latlon
        hasData         = false,

        isTouch         =  'ontouchstart' in document.documentElement,

        variables       = {},           // keeps the data
        variable        = "tmp2m",      // default selected for datat view

        maxSpeed        =  0,           // for deco

        fps             = 30,           // msecs = 1000 / fps
        frames          =  0,        
        doAnimate       = false,        // to
        animationFrame  = NaN,
        fpsBuffer       = null,
        durBuffer       = null,

        // particle engine
        amount          = 750,
        border          = 50,           // outside draw area 
        particles       = [],           // container
        tracers         = [],           // container
        trash           = [],           // container
        maxSteps        = 30,           // max livecycle of a particle in frames TODO: conv to seconds
        timeFrame       =  0,           // initialzed after new slider, signals particle cache
        minSpeed        =  1,           // if p.speed drops below, p is reborn elsewhere
        uvFac           =  0.25,        // damp resulting wind speed, higher > longer lines, TODO: needs math for day range
        dampColor       =  "rgba(255, 255, 255, 0.85)",   // color to soft blend particles out
        Particle = function(x, y, step){
            this.x      = this.x1 = this.orgx = x;
            this.y      = this.y1 = this.orgy = y;
            this.step   = step;
            this.speed  = 0; 
            this.width  = 0;
            this.color  = "";
            this.tracer = false;
            this.mark   = false;
            this.cache  = H.range(maxSteps +1).map(function () {return {u: NaN, v: NaN};});
        },

        
        lastTime        =  0.0,         // prevents double action

        charts = {
            "1": { id: 1,
                chart: null,
                varis: ["tmp2m", "prmslmsl"],
                div:   "sim-chart-1"
            },
            "2": { id: 2,
                chart: null,
                varis: ["apcpsfc", "gustsfc"],
                div:   "sim-chart-2"
            },
            "3": { id: 3,
                chart: null,
                varis: ["dlwrfsfc", "dswrfsfc"],
                div:   "sim-chart-3"
            }
        },
        
        mouse = {
            x:    NaN,
            y:    NaN,
            fx:   384,  // helps on auto load gfs
            fy:   384,
            lat:  NaN,
            lng:  NaN,
            down: false
        },
        effects = {
            interval: null,
            mouseWait: function () {
                var pi = (Date.now()/200) % TAU;
                ctx.strokeStyle = "#FFFFFF";
                ctx.fillStyle   = "#FFFF00";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(mouse.fx, mouse.fy, 12, pi - 2, pi, true);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(mouse.fx, mouse.fy,  3, 0, TAU);
                ctx.fill();
            },
            chartLatLon: function () {
                ctx.strokeStyle = "#FFFFFF";
                ctx.fillStyle   = "#FF0000";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(mouse.fx, mouse.fy, 10, 0, TAU);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(mouse.fx, mouse.fy,  3, 0, TAU);
                ctx.fill();
            },
            mouseBlink: function (color) {
                ctx.fillStyle = color || "white";
                ctx.beginPath();
                ctx.arc(mouse.fx, mouse.fy, 12, 0, TAU);
                ctx.fill();
            }
        },

        events = {
            resize: function () {

                var winWidth = $(window).width(), cvsHeight = $("#simulator").height();

                self.drawColorBar(ctxColorBar);

                if (winWidth < 992){
                    $(".sim-chart").css({height: 200});
                } else {
                    $(".sim-chart").css({height: cvsHeight/3});
                }

            },
            onloadDods: function (errors, chartdatas) {

                var lh = 24;

                // console.log("mouseup", errors, data);

                clearInterval(effects.interval);

                if (errors){
                    effects.mouseBlink("red");
                    doLatLon = false;
                    ctx.fillStyle = "white";
                    if (errors.length){
                        errors.forEach(function (line) {
                            ctx.fillText(line, 12, lh);
                            lh += 12;
                        });
                    } else {
                        ctx.fillText("ERROR with GFS", 12, lh);
                    }

                } else {
                    effects.mouseBlink();
                    self.renderChart(chartdatas);
                    setTimeout(function () {doLatLon = true;}, 200);

                }

            },
            mouseup: function () {

                mouse.down = false;

                clearInterval(effects.interval);
                effects.interval = setInterval(effects.mouseWait, 32);

                self.hideCharts([1, 2, 3]);
                $(".sim-chart-info").html("retrieving forecast from GFS...");
                SIM.Model.getForecast(mouse.lat, mouse.lng, charts[1], events.onloadDods);
                SIM.Model.getForecast(mouse.lat, mouse.lng, charts[2], events.onloadDods);
                SIM.Model.getForecast(mouse.lat, mouse.lng, charts[3], events.onloadDods);

            },
            mousemove: function (e) {
                var rect = cav.getBoundingClientRect();
                mouse.x = ~~(e.clientX - rect.left);
                mouse.y = ~~(e.clientY - rect.top);
            },
            mousedown: function () {
                
                var latlng, f = cav.width / parseInt($("#simulator").css("width"), 10);

                mouse.fx = mouse.x * f;
                mouse.fy = mouse.y * f;
                latlng = project(mouse.fx, mouse.fy);
                mouse.lat = latlng.y;
                mouse.lng = latlng.x;
                mouse.down = true;

                doLatLon = false;

                // console.log("Click:", "lat:", latlng.y.toFixed(2), "lng", latlng.x.toFixed(2));

            },
            mouseScroll: function (e) {
                step(e.originalEvent.detail < 0 ? 'right' : 'left');
                return false;
            },
            mouseWheel: function (e) {
                step(e.originalEvent.wheelDelta > 0 ? 'right' : 'left');
                return false;
            },
            visibility: function (visible){
                // console.log("simulator.visible", visible);
                if (visible){
                    hasData && self.animateStart();
                } else {
                    self.animateStop();
                }
            }
        },
        project = function (mouseX, mouseY) {

            var x = scale(mouseX, 0, cav.width, -extend,  extend),
                y = scale(mouseY, 0, cav.height, extend, -extend);

            return proj4.transform(projSource, projTarget, {x: x, y: y});

        },
        unproject = function (lat, lng) {

            var x, y, xy = proj4.transform(projTarget, projSource, {x: lng, y: lat});

            x = scale(xy.x, -extend,  extend, 0, cav.width);
            y = scale(xy.y,  extend, -extend, 0, cav.height);

            return {x: x, y: y};

        },
        clampScale = function (x, xMin, xMax, min, max) {
            var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
            return val < min ? min : val > max ? max : val;
        },
        pad = function (s) {return ("00" + s).slice(-2);},
        step = function (where){slider.setValue(parseFloat(slider.getValue()) + (where === 'right' ? +0.25 : -0.25), false, true);},
        scale = function (x,xMin,xMax,min,max){return (max-min)*(x-xMin)/(xMax-xMin)+min;},
        rgbGrey = function (g){return "rgb(" + g + "," + g + "," + g + ")";},
        rgbGreyAlpha = function (g, alpha){return "rgba(" + g + "," + g + "," + g + ","  + alpha + ")";},
        colorTableAlpha = function (c, alpha){
            return (
                c === 0 ? "rgba(170, 102, 170, " + alpha + ")" :
                c === 1 ? "rgba(206, 155, 229, " + alpha + ")" :
                c === 2 ? "rgba(108, 206, 226, " + alpha + ")" :
                c === 3 ? "rgba(108, 239, 108, " + alpha + ")" :
                c === 4 ? "rgba(237, 249, 108, " + alpha + ")" :
                c === 5 ? "rgba(251, 202,  98, " + alpha + ")" :
                c === 6 ? "rgba(251, 101,  78, " + alpha + ")" :
                c === 7 ? "rgba(204,  64,  64, " + alpha + ")" :
                    "black"
            );
        },
        colorTableHex = {
            "0" : "#aa66aa", // lila dark,
            "1" : "#ce9be5", // lila,
            "2" : "#76cee2", // blue,
            "3" : "#6cef6c", // green,
            "4" : "#edf96c", // yellow,
            "5" : "#ffbb55", // orange,
            "6" : "#fb654e", // red,
            "7" : "#cc4040"  // red dark,
        },
        colorTableDegree = {
            "0" : "-40°C", // lila dark,
            "1" : "-30°C", // lila,
            "2" : "-20°C", // blue,
            "3" : "-10°C", // green,
            "4" : "  0°C", // yellow,
            "5" : "+10°C", // orange,
            "6" : "+20°C", // red,
            "7" : "+30°C"  // red dark,
        };

    return {
        boot: function () {
            return (self = this);
        },
        utcDatetime: function () {
            var time = parseFloat(slider.getValue());
            return new Date(Date.UTC(1970, 0, ~~time + 1, 24 * (time % 1))).toUTCString();
        },
        conv: function  (para) {
            var d;
            if (para.length === 10 ){
                d = para.split('-');
                return new Date(Date.UTC(d[0], d[1] -1, d[2]));
            } else {
                return [para.getUTCFullYear(), pad(para.getUTCMonth() +1), pad(para.getUTCDate())].join('-');
            }
        },
        makeDayRange: function (iso1, iso2) {
            var d1 = self.conv(iso1), d2 = self.conv(iso2), range = [];
            while (d1 <= d2){
                range.push(self.conv(d1));
                d1.setUTCDate(d1.getUTCDate() + 1);
            }
            return range;
        },
        makeFilenameDate: function(d){
          return [
            d.getUTCFullYear(),
            H.padZero(d.getUTCMonth() +1),
            H.padZero(d.getUTCDate()),
            H.padZero(d.getUTCHours())
          ].join("-") + "H";
        },

    // SHOTS, compose

        createFilename: function (type) {

            var time = parseFloat(slider.getValue()),
                datetime = new Date(Date.UTC(1970, 0, ~~time + 1, 24 * (time % 1)));

            return "weathersim-" + self.makeFilenameDate(datetime) + "." + type;

        },
        screenshot: function () {

            // https://github.com/eligrey/FileSaver.js

            var canvas, oldDeco = doDeco;

            doDeco = false;

            self.animateStart();
            canvas = self.compose(cav, 32 + 512 + 20);
            canvas.toBlob(function(blob) {
                saveAs(blob, self.createFilename("png"));
            }, "image/png");

            doDeco = oldDeco;

            return false;

        },
        videoshot: function () {

            var img, imgData, blob, framesVideo = 30, size = 512,
                images = [], oldCheck = doCheck, oldAmount = amount;

            function finish (obj) {

                self.animateStart();

                $('#simulation-header .fa-spinner')
                    .addClass('fa-film')
                    .removeClass('fa-spin')
                    .removeClass('fa-spinner')
                ;

                if(!obj.error) {
                    blob = H.base64toBlob(obj.image.slice(22), "image/gif");
                    saveAs(blob, self.createFilename("gif"));
                    // imgData = obj.image;
                    // window.open(imgData, '_blank', '');
                    // animatedImage = document.createElement('img');
                    // animatedImage.src = imgData;
                    // $('#simulation-header').append(animatedImage);
                }

                doCheck = oldCheck;
                self.updateAmount(oldAmount);

            }

            $('#simulation-header .fa-film')
                .addClass('fa-spinner')
                .addClass('fa-spin')
                .removeClass('fa-film')
            ;

            doDeco   = false;
            doLatLon = false;

            self.updateAmount(1250);

            setTimeout(function () {

                self.animateRecord(framesVideo, function (frame, canvas) {

                    canvas = self.compose(cav, size);
                    img = new Image();
                    img.src = canvas.toDataURL();
                    images.push(img);

                    if (frame === framesVideo){

                        gifshot.createGIF({
                            gifWidth:   size,
                            gifHeight:  size + 52,
                            interval:   0.066666 / 2,
                            numFrames:  framesVideo,
                            images:     images
                        }, finish);

                    }

                });


            }, 1200);

            return false;

        },
        compose: function (canvas, size) {

            size = size || 512;

            var top = 32, btm = 20, height = top + size + btm, logo = top -8, brd = 16,
                cvs = $("#sim-compositor")[0],
                ctx = cvs.getContext("2d"),
                bck = $("#sim-background")[0],
                log = $(".navbar-brand img")[0];

            cvs.width = size; cvs.height = height;

            // header back, sim back, sim fore
            ctx.fillStyle = "#2c3b47";
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            ctx.drawImage(bck, 0, top, size, size);
            ctx.drawImage(canvas, 0, top, size, size);

            // logo
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.font = "20px sans-serif";
            ctx.fillText("arctic.io".split("").join(String.fromCharCode(8202)), logo + brd + brd/2, 22);
            ctx.drawImage(log, brd, (top - logo) / 2, logo, logo);

            // Title
            ctx.textAlign = "right";
            ctx.font = "18px monospace";
            ctx.fillText("GFS Weather Simulation", size - brd, 22);

            // GMT
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, top, size, 14 + 6);

            ctx.textAlign = "right";
            ctx.font = "bold 14px monospace";
            ctx.fillStyle = "white";
            ctx.fillText(self.utcDatetime().replace(":00:00", ":00"), size - brd, top + 14 + 2);

            ctx.textAlign = "left";
            ctx.font = "14px monospace";
            ctx.fillText("2m temp. 10m wind", brd, top + 14 + 2);

            // colorbar
            ctx.textAlign = "left";
            self.drawColorBar(ctx, top + size, btm);

            return cvs;

        },
        drawColorBar: function (ctx, top, height){

            top = top || 0; height = height || 20;

            var x, w8 = ctx.canvas.width/8, fontsize = height - 6;

            for (x=0; x<8; x++){
                ctx.fillStyle = colorTableHex[x];
                ctx.fillRect(x * w8, top, w8, height);
                ctx.font = fontsize + "px monospace";
                ctx.fillStyle = "black";
                ctx.fillText(colorTableDegree[x], x * w8 + 2, top + fontsize +2);
            }

        },

    // INIT, onload

        prepSlider: function (marray) {

            // https://github.com/seiyria/bootstrap-slider#functions

            var max = Math.max.apply(Math, Object.keys(marray.data)) + 3 * 0.25,
                min = Math.min.apply(Math, Object.keys(marray.data)),
                now = roundUp(H.date2doeFloat(Date.now()));

            function fmt (time) {
                var dd = new Date(Date.UTC(1970, 0, ~~time + 1, 24 * (time % 1)));
                return [dd.getUTCFullYear(), pad(dd.getUTCMonth() +1), pad(dd.getUTCDate())].join("-");
            }

            function roundUp(num){
                return num + (0.25 - (num % 0.25));
            }

            if (slider) {
                $('#simulation .slider.slider-horizontal').unbind('DOMMouseScroll', events.mouseScroll);
                $('#simulation .slider.slider-horizontal').unbind('mousewheel',     events.mouseWheel);
                slider.destroy();
            }

            slider = new Slider("#sim-slider", {
                step:  0.25,
                value: (now > min && now < max) ? now : min,
                ticks: [min, max],
                tooltip: 'hide'
            });

            $("#sim-time-label-l").text(fmt(min));
            $("#sim-time-label-r").text(fmt(max));

            $('#simulation .slider.slider-horizontal').bind('DOMMouseScroll', events.mouseScroll);
            $('#simulation .slider.slider-horizontal').bind('mousewheel',     events.mouseWheel);

            slider.on("change", self.updateTime);

        },
        prependRange : function (diff) {

            var datum2 = dataTimeRanges['gfs-simulation'][0][1],
                d      = datum2.split("-"),
                d1     = new Date(Date.UTC(d[0], d[1] -1, d[2] -diff)),
                datum1 = [d1.getUTCFullYear(), pad(d1.getUTCMonth() +1), pad(d1.getUTCDate())].join("-");

            dataTimeRanges['gfs-simulation'].unshift([datum1, datum2]);

        },
        selectedRange: function () {

            // var key = $('#sim-ranges').find("option:selected").val().split(" - ");
            // return dataTimeRanges['gfs-simulation'][key];
            return dataTimeRanges['gfs-simulation'][0];

        },
        onload: function(canvas){

            var range;

            // cav  = $(canvas)[0];
            // ctx  = cav.getContext("2d");
            // size = cav.width;

            // ctxColorBar = $("#sim-colorbar")[0].getContext("2d");

            // simTime = $("#sim-time-label-m");

            // cav.addEventListener('mousemove', events.mousemove, false);
            // cav.addEventListener('mousedown', events.mousedown, false);
            // cav.addEventListener('mouseup',   events.mouseup,   false);

            // Sections.on("simulation", events.visibility);

            fpsBuffer = H.createRingBuffer(60);
            durBuffer = H.createRingBuffer(60);

            // init ranges
            // self.prependRange(10);
            range = dataTimeRanges['gfs-simulation'][0];

            // DEBUG Range
            // dataTimeRanges['gfs-simulation'].unshift(["1970-01-02", "1970-01-02"]);

            // init range picker
            // $.each(dataTimeRanges['gfs-simulation'], function(key, value) {
            //     $('#sim-ranges').append($("<option/>", {
            //         value: key, text: value[0] + " - " + value[1]
            //     }));
            // });
            // $('#sim-ranges').on('change', function(){
            //     self.loadRange(self.finishLoad);
            // }).selectpicker('refresh');

            // $(window).on("resize", events.resize);  // draws colorbar
            // events.resize();

            // $("#sim-fps").val(fps);

            // show/hide gears section
            // $("#sim-gears").css({display: doGears ? 'block' : 'none'});

            TIM.step("LOADING", "SIM: " + JSON.stringify(dataTimeRanges['gfs-simulation'][0]));

            // little offset for the GUI
            setTimeout(function () {
                self.loadRange(self.finishLoad);
            }, 200);

            // Sync, Pole chart data
            // SIM.Model.sync(function (run) {
            //     effects.mouseWait();
            //     $(".sim-chart-info").html(H.format("retrieving data from GFS (%s) ...", run));
            //     SIM.Model.getForecast(90, 0, charts[1], events.onloadDods);
            //     SIM.Model.getForecast(90, 0, charts[2], events.onloadDods);
            //     SIM.Model.getForecast(90, 0, charts[3], events.onloadDods);
            // });

        },
        loadRange: function(callback){

            function progessBlob (e) {
                currLoad += e.diff;
                // ctx.fillStyle = "rgba(255, 255, 255, 1)";
                // ctx.fillRect(0, 0, cav.width / fullLoad * currLoad, 24);
                // ctx.fillStyle = "black";
                // ctx.font = "16px sans serif";
                // ctx.fillText("GFS 2m Temp, 10m Wind: " + ~~(100 / fullLoad * currLoad) + "%", 4, 16);
            }

            function progessImage (e) {
                currImage = e;
                ctx.fillStyle = "rgba(255, 255, 255, 1)";
                ctx.fillRect(0, 0, cav.width / fullImage * currImage, 24);
                ctx.fillStyle = "black";
                ctx.font = "16px sans serif";
                ctx.fillText("AMSR2 Sea Ice Concentration: " + ~~(100 / fullImage * currImage) + "%", 4, 16);
            }

            function iso2file (iso) {
                return iso.split("-")[0] + "/" + iso + ".sim" ;
            }

            var dateRange = self.selectedRange(),
                dates = self.makeDayRange(dateRange[0], dateRange[1]),
                currLoad  = 0, 
                currImage = 0, 
                fullImage = dates.length, 
                fullLoad  = dates.length * (101540),
                tasks     = dates.map(iso2file).map(function (file) { 
                    return function (callback) {
                        var blobs = new SIM.Blobs(file, progessBlob, function () {
                            callback(null, blobs);
                        });
                    };
                });

            // full reset
            variables = {};
            doAnimate = false;
            // ctx.clearRect(0, 0, cav.width, cav.height);

            // SIM.Blender.loadRange(dates, progessImage, function () {
            //     ctx.clearRect(0, 0, cav.width, cav.height);
                async.parallel(tasks, callback);
            // });

        },
        finishLoad: function(err, results){

            var marray, doe, t0 = Date.now(), bytes = 0, days = 0;

            if (err){console.error(err);} else {
                // console.log("results", results);
            }

            results.forEach(function (res) {

                if (!Object.keys(variables).length){
                    Object.keys(res.vars).forEach(function (vari) {
                        marray = new SIM.MArray();
                        marray.grid  = res.vars[vari].grid;
                        variables[vari] = marray;
                    });
                }

                Object.keys(res.vars).forEach(function (vari) {
                    doe = ~~(res.Day / 864e5);
                    variables[vari].data[doe]       = res.vars[vari].data;
                    variables[vari].data[doe].shape = res.vars[vari].shape;
                    variables[vari].analyzeDoe(doe);
                });

            });

            // some feedback
            // ctx.clearRect(0, 0, cav.width, cav.height);

            Object.keys(variables).forEach(function (vari) {
                bytes += variables[vari].bytes();
                days   = results.length;
            });
            TIM.step("LOADED", [((Date.now() - t0) / 1000).toFixed(2), "secs", bytes, "bytes", days, "days"].join(" "));


            // self.prepSlider(variables.ugrd10m);
            // self.updateTime();
            // self.updateFps();
            self.updateAmount(amount);
            // self.toggleDisplay("part");

            hasData = true;

            SIM.init(variables);

            // if(Sections.isVisible("simulation")){
            //     setTimeout(self.animateStart, 500);
            // }

        },

    // ANIMATION 

        animateRecord: function (length, callback) {

            var fps = 30;

            self.animateStop();
            self.animateStart(fps, function (frame, cvs) {

                if (frame > length){
                    self.animateStop();
                
                } else {
                    callback(frame, cvs);

                }

            });

        },
        animateToggle:  function () {
            if(doAnimate){
                self.animateStop();
            } else {
                self.animateStart();
            }
        },
        animateStop:  function () {
            doAnimate = false;
            cancelAnimationFrame(animationFrame);
            $("#sim-btn-toggle").text("Run");
        },

        animateStart: function (requestedFps, callback) {

            requestedFps = requestedFps || fps;

            var t0 = 0, now = 0, elapsed,
                interval = 1000 / requestedFps,
                then = Date.now(),
                last = then;

            frames = 0;
            doAnimate = true;
            cancelAnimationFrame(animationFrame);
            $("#sim-btn-toggle").text("Stop");
            self.updateParticles();
            animate();

            function animate () {

                if (!doAnimate){return;}

                animationFrame = requestAnimationFrame(animate);

                now = Date.now();
                elapsed = now - then;

                if (elapsed > interval) {

                    t0   = Date.now();
                    then = now - (elapsed % interval);
                    fpsBuffer.push(1000 / (t0 - last));
                    last = t0;

                    frames += 1;
                    timeFrame += 1;

                    self.updateParticles();
                    self.render();

                    doDeco   && self.decorate(t0);
                    doLatLon && effects.chartLatLon();
                    callback && callback(frames, cav);

                    doCheck && ((frames % 120) === 0) && self.adjustFps();

                    durBuffer.push(Date.now() - t0);

                }

            }

        },
        adjustFps: function () {

            var dur = durBuffer.avg(),
                max = (1000 / fps) * 0.6;

            if (dur > max) {
                fps     = (fps > 10) ? fps -10    : 5;
                doCheck = (fps > 10) ? doCheck -1 : 0;
                $("#sim-fps").val(fps);
                self.animateStart();

                TIM.step("ADJUSTED",  ["FPS", "dur:", dur.toFixed(1), "max", max.toFixed(1), "fps", fps, "frame", frames, "avg", fpsBuffer.avg().toFixed(1)].join(" "));
            }

        },

    // REDNER 

        render: function render () {

            var i, p, len = particles.length;
            
            ctx.globalCompositeOperation = "destination-in";
            ctx.fillStyle = dampColor;
            ctx.fillRect(0, 0, size, size);        
            ctx.globalCompositeOperation = "source-over";
            ctx.lineCap = "round";

            // Sea Ice
            SIM.Blender.blend(ctx, 0.3);

            for (i=0; i<len; i++){

                p = particles[i];
                p.step += 1;

                self.check(p);
                self.forward(p);
                self.update(p);

                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.lineWidth   = p.width;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x1, p.y1);
                ctx.stroke();

                p.x = p.x1;
                p.y = p.y1;

            }

            // Tracer
            len = tracers.length;
            for (i=0; i<len; i++){

                p = tracers[i];
                self.forward(p);
                self.check(p);

                ctx.beginPath();
                ctx.strokeStyle = "white";
                ctx.lineWidth   = 3.0;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x1, p.y1);
                ctx.stroke();

                p.x = p.x1;
                p.y = p.y1;
                
            }

            len = trash.length;
            for (i=0; i<len; i++){
                self.deleteParticle(tracers, function (part) {return part === trash[i];});
            }
            if (trash.length) {trash.splice(0, trash.length);}

        },
        renderData: function () {

            var x, y, value, grey, color, 
                marray = variables[variable],
                cube   = marray.first(),
                shape  = cube.shape,
                xy  = shape[1] - 1,
                wh  = size / xy,
                min = marray.min,
                max = marray.max;

            ctx.clearRect(0, 0, cav.width, cav.height);

            for (x=0; x<xy; x++){
                for (y=0; y<xy; y++){

                    value = marray.getXY(x, y);

                    if (variable === "icec"){
                        if (value === -128){
                            ctx.fillStyle = "rgba(0,0,0,0)";
                        } else {
                            grey = scale(value, -128, +127, 128, 255);
                            ctx.fillStyle = rgbGrey(~~grey);
                        }

                    } else if (variable === "tmp2m"){
                        color = ~~clampScale(value, -40, +30, 0, 7);
                        ctx.fillStyle = colorTableAlpha(color, 0.6);

                    } else {
                        grey = scale(value, min, max, 0, 255);
                        ctx.fillStyle = rgbGreyAlpha(~~grey, 0.6);

                    }
                    
                    ctx.fillRect(x * wh, y * wh, wh, wh);
                    
                }
            }

            // Sea Ice
            SIM.Blender.blend(ctx, 0.7);


        },    

        hideCharts: function (list) {

            var chart;

            // $.each( $(".canvasjs-chart-canvas"), function(index, cvs) {
            //     cvs.getContext("2d").clearRect(0, 0, cvs.width, cvs.height);
            // });

            list.forEach(function (id){
                if ((chart = charts[id].chart)){
                    chart.options.data.forEach(function (datatset) {
                        // datatset.visible = false;
                        datatset.color = "transparent";
                        datatset.lineColor = "transparent";
                    });
                    chart.render();
                }
            });

        },
        renderChart: function (chartdatas) {

            var chart, 
                chartinfo   = chartdatas[0][0],
                id          = chartinfo.id,
                primVari    = chartdatas[0][0].varis[0],
                secVari     = chartdatas[1][0].varis[1],
                datagramms  = chartdatas.map(function (datas) {return datas[1];}),
                ref         = datagramms[0],
                lng         = ref.lng + (ref.lng > 0 ? "°E" : "°W"),
                dateFormatter = function (d) {
                    return [
                      d.getUTCFullYear(),
                      H.padZero(d.getUTCMonth() +1),
                      H.padZero(d.getUTCDate())
                    ].join("-") + "&nbsp;" + H.padZero(d.getUTCHours()) + "h" + "&nbsp;UTC";
                },
                numberFormatter = function (num) {
                    return parseFloat(num).toFixed(1);
                },
                config = {
                    animationEnabled:       true,
                    animationDuration:      1000,
                    exportFileName:         H.format("GFS-Forecast %s, %s", ref.lat + "°N", lng),    
                    exportEnabled:          true,
                    backgroundColor:        "#4D4D4D",
                    colorSet:               "nomads",
                    toolTip: {
                        shared: false,
                        contentFormatter: function (e) {

                            var i, vari, content = " ", letter, metric;

                            for (i = 0; i < e.entries.length; i++) {
                                vari     = e.entries[i].dataSeries.name;
                                metric   = SIM.Vars[vari].unit;
                                letter   = SIM.Vars[vari].letter;
                                content += dateFormatter(e.entries[i].dataPoint.x) + "<br />";
                                content += letter + ": " + numberFormatter(e.entries[i].dataPoint.y) + "&nbsp;" + metric + "<br />";
                            }

                            return content;

                        }
                    },
                    legend: {
                        fontSize:           12,
                        fontColor:          "#EEE",
                        cursor:             'pointer',
                        itemclick:          function (e) {console.log("CLICK", e);},
                        dockInsidePlotArea: false,
                        horizontalAlign:    "center", // left, center ,right 
                        verticalAlign:      "top"  // top, center, bottom
                    },
                    axisX: {
                        lineThickness:      2,
                        labelFontSize:      11,
                        labelFontColor:     "#EEE",
                        valueFormatString:  "UTC:YY-MM-DD",
                        gridThickness:      0.25,
                        minimum:            ref.minDate,
                        interval:           24,
                        intervalType:       "hour"
                    },
                    axisY: {
                        labelFontSize:      11,
                        labelFontColor:     "#EEE",
                        gridThickness:      0.5
                        // margin:             160,
                        // labelAutoFit:       false
                    },
                    axisY2: {
                        labelFontSize:      11,
                        labelFontColor:     "#EEE",
                        minimum:            SIM.Vars[secVari].range[0], 
                        maximum:            SIM.Vars[secVari].range.slice(-1)[0]
                        // margin:             160,
                        // labelAutoFit:       false
                    },
                    data: []
                };

            // both get same ragne/min/max
            if (SIM.Vars[primVari].range){
                config.axisY.minimum = SIM.Vars[primVari].range[0];
                config.axisY.maximum = SIM.Vars[primVari].range.slice(-1)[0];
                if (SIM.Vars[primVari].range.length > 2) {
                    // config.axisY.stripLines = SIM.Vars[primVari].range.slice(1, -1).map(function (value) {
                    //     return {value: value};
                    // });
                }
            }

            datagramms.forEach(function (datagramm) {

                var vari  = datagramm.vari,
                    series = {
                        dataPoints:         [], 
                        type:               "line",  
                        name:               vari,
                        visible:            true,
                        connectNullData:    false,
                        vari:               vari,
                        showInLegend:       true, 
                        color:              SIM.Vars[vari].color,
                        LineColor:          SIM.Vars[vari].color,
                        axisYType:          SIM.Vars[vari].axis,
                        legendText:         SIM.Vars[vari].legend,
                        markerType:         "circle",  //"circle", "square", "cross", "none"
                        markerSize:         1,
                        lineThickness:      3,
                        xValueFormatString: "UTC:YYYY-MM-DD HH K",
                        mouseover: function( /* e */){
                            // console.log("over", e.dataPoint.x);
                        },
                        mousemove: function( /* e */){
                            // console.log("move", e.dataPoint.x);
                        },
                        mouseout: function( /* e */){
                            // console.log("out", e.dataPoint.x);
                        }
                    };

                H.zip(datagramm.stamps, datagramm.datas, function (stamp, datapoint) {
                    series.dataPoints.push({x: stamp, y: isNaN(datapoint) ? null : datapoint});
                });

                config.data.push(series);

            });

            $(".sim-chart-info").html(H.format("Forecast: %s, %s", ref.lat + "°N", lng));
            $("#" + chartinfo.div).css({display: "block"});
            chart = charts[id].chart = new CanvasJS.Chart(chartinfo.div, config);
            chart.render();
            $(".canvasjs-chart-container button img").attr("src", "/images/simulator/chart-button.png");

            // console.log(chart);


        },
        decorate: function (t1) {

            var w = cav.width, f = cav.width / parseInt($("#simulator").css("width"), 10),
                mx = ~~(mouse.x * f), my = ~~(mouse.y * f),
                sys = "",
                t = "t2m: " + variables.tmp2m.interpolateXY(mx, my).toFixed(1) + "°C",
                u = variables.ugrd10m.interpolateXY(mx, my),
                v = variables.vgrd10m.interpolateXY(mx, my),
                s = "speed: " + Math.sqrt(u * u + v * v).toFixed(1) + " m/s, ",
                ms = maxSpeed.toFixed(1) + " m/s max wind",
                info = "mouse: " + mouse.x + ", " + mouse.y + ", " + t + ", " + s + ms;

            sys  = frames + " / " + ("00" + (Date.now() - t1)).slice(-2) + "ms, ";
            sys += "fps: " + (fpsBuffer.avg()).toFixed(1) + ", ";
            sys += "particles: " + particles.length + ", ";
            sys += "tracers: " + tracers.length + ", ";

            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, 0, w, 36);

            ctx.fillStyle = "white";
            ctx.font = "16px monospace";
            ctx.fillText(sys,  4, 16);
            ctx.fillText(info, 4, 32);

        },
        deleteParticle: function (a, fn){var i=0,o=0;while(a[i]!==undefined){if(fn(a[i])){a.splice(i,1);o++;}else{i++;}}return o;  },
        
    // PARTICLE 

        updateParticles: function(){

            var i, p, len = particles.length;
            
            if (amount === len) { 
                return; 

            } else if (amount > len) {
                for (i=len; i<amount; i++){
                    p = new Particle(
                        Math.random() * (size + border + border) - border, 
                        Math.random() * (size + border + border) - border, 
                        ~~(Math.random() * (maxSteps + 0.5))
                    );
                    particles.push(p);
                    self.forward(p);
                }
                TIM.step("CREATED", amount - len + " particles");

            } else {
                particles.splice(amount, particles.length - amount);
                TIM.step("DROPPED", amount - len + " particles");

            }

        },
        check: function(p){

            if (p.tracer && (p.x < 0 || p.x > size || p.y < 0 || p.y > size || p.speed < minSpeed)){
                trash.push(p);
            }
            
            if (!p.tracer && (p.step >= maxSteps)){
                p.x     = p.orgx;
                p.y     = p.orgy;
                p.step  = 0;
                p.s     = 0;
                p.color = "";
            }
                  
        },
        forward: function(p){

            var x, y, u, v, step = p.step;

            if (timeFrame >= maxSteps){
                u = p.cache[step].u;
                v = p.cache[step].v;

            } else {
                x = p.x < 0 ? 0 : p.x > size ? size : p.x,
                y = p.y < 0 ? 0 : p.y > size ? size : p.y,
                u = variables.ugrd10m.interpolateXY(x, y),
                v = variables.vgrd10m.interpolateXY(x, y);
                p.cache[step].u = u;
                p.cache[step].v = v;

            }
            
            p.speed = Math.sqrt(u * u + v * v);
            p.x1 = p.x + u * uvFac;
            p.y1 = p.y - v * uvFac;

            maxSpeed = p.speed > maxSpeed ? p.speed : maxSpeed;
            
        },

        forwardX: function(p){
            
            var 
                x = p.x < 0 ? 0 : p.x > size ? size : p.x,
                y = p.y < 0 ? 0 : p.y > size ? size : p.y,
                u = variables.ugrd10m.interpolateXY(x, y),
                v = variables.vgrd10m.interpolateXY(x, y);
            
            p.speed = Math.sqrt(u * u + v * v);
            p.x1 = p.x + u * uvFac;
            p.y1 = p.y - v * uvFac;

            maxSpeed = p.speed > maxSpeed ? p.speed : maxSpeed;
            
        },
        update: function (p){

            var x, y, color, t2m, speed = p.speed;

            if (!p.color){
                x       = p.x < 0 ? 0 : p.x > size ? size : p.x;
                y       = p.y < 0 ? 0 : p.y > size ? size : p.y;
                t2m     = variables.tmp2m.interpolateXY(x, y);
                color   = ~~clampScale(t2m, -40, +30, 0, 7);
                p.color = colorTableHex[color];
            }

            p.width = (
                speed <  2.5 ? 2.0 :
                speed <  5.0 ? 2.5 :
                speed < 10.0 ? 3.0 :
                speed < 20.0 ? 3.5 :
                    4.0
            );

        },

    // UI 

        toggleDisplay: function(what, vari){

            vari = vari || 'tmp2m';

            ctx.clearRect(0, 0, cav.width, cav.height);

            $('input[value="' + what + '"]').prop("checked", true);

            if (what === "part"){
                self.animateStart();
                $('#sim-field-data').prop('disabled', true);

            } else if (what === "data"){
                self.animateStop();
                variable = 'tmp2m';
                $('#sim-field-data').prop('disabled', false);
                $('input[value="' + vari + '"]').prop("checked", true);
                self.renderData();

            }

            display = what;

        },
        toggleData: function(vari){
            display !== "data" && Simulator.toggleDisplay('data', vari);
            variable = vari;
            self.renderData();
        },
        toggleGears: function(){
            doGears = doDeco = !doGears;
            $("#sim-gears").css({display: doGears ? 'block' : 'none'});
        },
        toggleInfo: function () {

            var 
                classShowInfoGui  = "col-xs-offset-1 col-xs-10 col-sm-offset-1 col-sm-10 col-md-offset-0 col-md-8 col-lg-offset-0 col-lg-7 sim-gui",
                classHideInfoGui  = "col-xs-offset-1 col-xs-10 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8 col-lg-offset-2 col-lg-7 sim-gui";

            if ($("#simulation .sim-info").css("display") === "none"){
                // show both
                $("#simulation .sim-info").css({display: 'block'});
                // $("#simulation .sim-gui").attr("class", classShowInfoGui);

            } else {
                $("#simulation .sim-info").css({display: 'none'});
                // $("#simulation .sim-gui").attr("class", classHideInfoGui);
            }

        },
        updateFps: function(){
            fps      = ~~$("#sim-fps").val();
            maxSpeed = fps;
            uvFac    = 0.25 / (fps / 30);
            self.animateStart();
            TIM.step("UPDATED-FPS", ["fps:", fps, "avg", fpsBuffer.avg().toFixed(1)].join(" "));
        },
        updateAmount: function(newAmount){
            if (newAmount) {
                $("#sim-amount").val(newAmount);   
            }
            amount = ~~$("#sim-amount").val();

            // set cache back
            timeFrame = 0;
            
        },
        updateTime: function(){

            var datetime, time = parseFloat(slider.getValue());

            if (time && time !== lastTime){

                // set cache back
                timeFrame = 0;

                datetime = new Date(Date.UTC(1970, 0, ~~time + 1, 24 * (time % 1)));

                $("#sim-time-label-m").text(datetime.toUTCString().replace(":00:00", ":00")); 

                Object.keys(variables).forEach(function (name) {
                    variables[name].setDateSize(datetime, size);
                });

                SIM.Blender.setDateSize(datetime, size);

                (display === "data") && self.renderData();

                lastTime = time;

            }

        }

    };


}()).boot();
