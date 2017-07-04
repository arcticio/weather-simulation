
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