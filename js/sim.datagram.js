
SIM.Datagram = function (vari) {

    this.data = {};
    this.vari  = vari;
};

SIM.Datagram.prototype = {

    constructor: SIM.Datagram,

    parse: function (doe, dods) {

        var data = this.parseMultiDods(dods);

        this.data[doe] = data;

        this.info = this.analyze(data);

        return this;
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
            head  = lines[0], //.slice(0, 1)[0],
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

    linearXY: function (doe, lat, lonin) {

        /*
            time  = 0, 1, ...
        */

        var 
            lon   = (lonin + 180) % 360,
            data  = this.data[doe].data,
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
