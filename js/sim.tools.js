

function CoordsPool(amount, sector) {

  this.amount  = amount;
  this.sector  = sector;
  this.pool    = [];
  this.pointer = 0;

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
      lon = (270 + Math.atan2(x , z) * DEGRAD) % 360;

      this.pool.push({ x, y, z, lat, lon });

    }

    return this;

  },
  filter (sector) {

    var i, out = [];

    for (i=0; i<this.amount; i++) {

      coord = this.pool[i];
      
      if ( 
          coord.lat > sector[0] && 
          coord.lon > sector[1] && 
          coord.lat < sector[2] && 
          coord.lon < sector[3] 
        ) {
        out.push(coord);
      }

    }

    return out;

  }, 
  slice: function (amount) {

    var out = this.pool.slice(this.pointer, this.pointer + amount);
    
    this.pointer += amount;

    return out;

  }

};


