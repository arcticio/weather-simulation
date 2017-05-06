
'use strict';

var container, renderer, camera, controls, scene, sphere;
var mesh, targets, positionShader, simulationShader, textureShader, clearShader;
var rtScene, rtQuad, rtCamera;
var orthoScene, orthoMesh, orthoQuad, orthoCamera;
var targetPos = 0, targetTexture = 0;
var textureFBO;

var helper;

var streakType = 1;
var streakType = 0;  // thin

var isMobile = {
  any: false
};

document.getElementById( 'toggleStreakBtn' ).addEventListener( 'click', function( e ){

  streakType = 1 - streakType;
  textureShader.uniforms.streakType.value = streakType;

});


var cameraPosition = 0;
var cameraPosition = 1; //outside

document.getElementById( 'toggleCamBtn' ).addEventListener( 'click', function( e ){

  cameraPosition = 1 - cameraPosition;
  if( cameraPosition == 0 ) {
    if( isMobile.any ) {
      camera.position.set( 0, 0, 0 );
    } else {
      camera.position.set( 0, 0, 90 );
    }
  } else {
    if( isMobile.any ) {
      camera.position.set( 0, 0, 0 );
    } else {
      camera.position.set( 0, 0, 190 );
    }
  }

});

var container = document.getElementById( 'container' );

function createRenderTarget() {

  return new THREE.WebGLRenderTarget( 1, 1, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    depthBuffer: true
  });

}

function initScene() {

  var width = isMobile.any ? 128 : 128;
  var height = isMobile.any ? 128 : 128;

  var data = new Float32Array( width * height * 4 );

  var r = 1;

  for( var i = 0, l = width * height; i < l; i ++ ) {

    var phi =      Math.random() * 2 * Math.PI;
    var costheta = Math.random() * 2 -1;
    var theta =    Math.acos( costheta );

    r = .85 + .15 * Math.random();

    data[ i * 4 ]     = r * Math.sin( theta) * Math.cos( phi );
    data[ i * 4 + 1 ] = r * Math.sin( theta) * Math.sin( phi );
    data[ i * 4 + 2 ] = r * Math.cos( theta );
    data[ i * 4 + 3 ] = Math.random() * 100; // frames life time

  }

  var texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat, THREE.FloatType );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  helper.attach( texture, 'original' );

  var rtTexturePos = new THREE.WebGLRenderTarget( width, height, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
    depthBuffer: false,
    generateMipmaps: false
  });

  targets = [ rtTexturePos, rtTexturePos.clone() ];

  simulationShader = new THREE.RawShaderMaterial( {
    uniforms:{
      original: { type: 't', value: texture },
      positions: { type: 't', value: texture },
      time: { type: 'f', value: 0 }
    },
    vertexShader: document.getElementById( 'simulation-vs' ).textContent,
    fragmentShader: document.getElementById( 'simulation-fs' ).textContent,
    side: THREE.DoubleSide
  } );

  rtScene = new THREE.Scene();
  rtCamera = new THREE.OrthographicCamera( -width / 2, width / 2, -height / 2, height / 2, -500, 1000 );
  rtQuad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( width, height ),
    simulationShader
  );
  rtScene.add( rtQuad );

  renderer.render( rtScene, rtCamera, rtTexturePos );

  helper.attach( targets[ 0 ], 'positions' );
  helper.attach( targets[ 1 ], 'positions' );

  var pointsGeometry = new THREE.BufferGeometry();
  var positions = new Float32Array( width * height * 3 * 3 );
  var ptr = 0;

  for( var y = 0; y < height; y++ ){
    for( var x = 0; x < width; x++ ) {
      positions[ ptr ] = x / width;
      positions[ ptr + 1 ] = y / width;
      positions[ ptr + 2 ] = 0;
      ptr += 3;
    }

  }

  pointsGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

  var particleMaterial = new THREE.RawShaderMaterial( {
    uniforms:{
      positions: { type: 't', value: rtTexturePos }
    },
    vertexShader: document.getElementById( 'particle-vs' ).textContent,
    fragmentShader: document.getElementById( 'particle-fs' ).textContent
  } );

  mesh = new THREE.Points(
    pointsGeometry,
    particleMaterial
  );
  scene.add( mesh ); // lila dots

  var tex = createRenderTarget();

  var texSize = 4096;
  tex.setSize( texSize, texSize / 2 );
  textureFBO = [ tex, tex.clone() ];

  textureFBO[ 0 ].texture.wrapS = textureFBO[ 0 ].texture.wrapT = THREE.RepeatWrapping;
  textureFBO[ 1 ].texture.wrapS = textureFBO[ 1 ].texture.wrapT = THREE.RepeatWrapping;

  helper.attach( textureFBO[ 0 ], 'texture' );
  helper.attach( textureFBO[ 1 ], 'texture' );

  textureShader = new THREE.RawShaderMaterial( {
    uniforms:{
      streakType: { type: 'f', value: streakType },
      positions: { type: 't', value: textureFBO[ targetTexture ].texture },
      dimensions: { type: 't', value: new THREE.Vector2( texSize, texSize / 2 ) }
    },
    vertexShader: document.getElementById( 'texture-vs' ).textContent,
    fragmentShader: document.getElementById( 'texture-fs' ).textContent,
    side: THREE.DoubleSide,
    transparent: true
  } );

  orthoScene = new THREE.Scene();
  orthoCamera = new THREE.OrthographicCamera( -tex.width / 2, tex.width / 2, -tex.height / 2, tex.height / 2, -1000, 1000 );
  orthoMesh = new THREE.Points( pointsGeometry, textureShader );
  orthoScene.add( orthoMesh );

  clearShader = new THREE.RawShaderMaterial( {
    uniforms: {
      texture: { type: 't', value: texture.texture }
    },
    vertexShader: document.getElementById( 'clear-vs' ).textContent,
    fragmentShader: document.getElementById( 'clear-fs' ).textContent,
    side: THREE.DoubleSide,
    transparent: true
  } );

  orthoQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( tex.width, tex.height ), clearShader );
  orthoScene.add( orthoQuad );

  function azimuth( vector ) {

    return Math.atan2( vector.z, - vector.x );

  }

  function inclination( vector ) {

    return Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

  }

  var sphereGeometry = new THREE.IcosahedronBufferGeometry( 100, 5 );

  var light = new THREE.HemisphereLight( 0xff9d5c, 0x5cadff, 1 );
  // scene.add( light );

  var ambientLight = new THREE.AmbientLight( 0x202020 );
  // scene.add( ambientLight );

  var light1 = new THREE.SpotLight( 0xffffff, .5, 100, .25, .2, .1 );
  light1.position.set( 0, 40, 0 );
  light1.castShadow = true;
  light1.shadow.mapSize.width = light1.shadow.mapSize.height = 1024;
  scene.add( light1 );

  var light2 = new THREE.SpotLight( 0xffffff, .5, 100, .5, .2, .1 );
  light2.position.set( -10, 20, 4 );
  light2.castShadow = true;
  light2.shadow.mapSize.width = light2.shadow.mapSize.height = 1024;
  scene.add( light2 );

  sphere = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({
      map: tex.texture,
      transparent: !true,
      side: THREE.DoubleSide
    })
  );
  scene.add( sphere );

}

function init() {

  container = document.getElementById( 'container' );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 10000 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  camera.lookAt( camera.target );
  scene.add( camera );

  renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0, 1 );
  container.appendChild( renderer.domElement );

  helper = new FBOHelper( renderer );
  helper.show( false );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  if( isMobile.any ) {
    camera.position.set( 0, 0, 0 );
    controls = new THREE.DeviceOrientationControls( camera );
  } else {
    camera.position.set( 0, 0, 190 );
    controls = new THREE.OOrbitControls( camera, renderer.domElement );
    controls.enableZoom = true;
  }

  // addFullscreenShortcut( renderer.domElement, onWindowResized );

  initScene();
  onWindowResized();

  window.addEventListener( 'resize', onWindowResized );

  animate();

}

function onWindowResized( event ) {

  var w = container.clientWidth;
  var h = container.clientHeight;

  renderer.setSize( w, h );
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  helper.setSize( w, h );

}

function animate() {

  requestAnimationFrame( animate );

  controls.update();

  simulationShader.uniforms.time.value = .0001 * performance.now();
  simulationShader.uniforms.positions.value = targets[ targetPos ].texture;
  targetPos = 1 - targetPos;
  renderer.render( rtScene, rtCamera, targets[ targetPos ] );

  renderer.autoClear = false;

  orthoQuad.visible = true; orthoMesh.visible = false;
  clearShader.uniforms.texture.value = textureFBO[ targetTexture ].texture;
  targetTexture = 1 - targetTexture;
  renderer.render( orthoScene, orthoCamera, textureFBO[ targetTexture ] );

  textureShader.uniforms.positions.value = targets[ targetPos ].texture;
  orthoQuad.visible = false; orthoMesh.visible = true;
  renderer.render( orthoScene, orthoCamera, textureFBO[ targetTexture ] );
  
  sphere.material.map = textureFBO[ targetTexture ];
  renderer.autoClear = true;

  mesh.material.uniforms.positions.value = targets[ targetPos ].texture;

  renderer.render( scene, camera );
  helper.update();

}

window.addEventListener( 'load', init );
