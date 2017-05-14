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
