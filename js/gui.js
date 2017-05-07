
// dat.gui
var gui = new dat.GUI();
var guiCamera = gui.addFolder('Camera');
var guiSurface = gui.addFolder('Surface');
var guiMarkers = guiSurface.addFolder('Markers');
var guiAtmosphere = gui.addFolder('Atmosphere');
var guiAtmosphericGlow = guiAtmosphere.addFolder('Glow');

// dat.gui controls object
// var cameraControls = new function () {
//   this.speed = cameraRotationSpeed;
//   this.orbitControls = !cameraAutoRotation;
// }();

var surfaceControls = new function () {
  this.rotation = 0;
  this.bumpScale = 0.05;
  this.shininess = 10;
}();

var markersControls = new function () {
  this.address = '';
  this.color = 0xff0000;
  this.placeMarker = function () {
    placeMarkerAtAddress(this.address, this.color);
  };
}();

var atmosphereControls = new function () {
  this.opacity = 0.8;
}();

var atmosphericGlowControls = new function () {
  this.intensity = 0.7;
  this.fade = 7;
  this.color = 0x93cfef;
}();

// dat.gui controls
// guiCamera.add(cameraControls, 'speed', 0, 0.1).step(0.001).onChange(function (value) {
//   cameraRotationSpeed = value;
// });
// guiCamera.add(cameraControls, 'orbitControls').onChange(function (value) {
//   cameraAutoRotation = !value;
//   orbitControls.enabled = value;
// });

guiSurface.add(surfaceControls, 'rotation', 0, 6).onChange(function (value) {
  earth.getObjectByName('surface').rotation.y = value;
});
guiSurface.add(surfaceControls, 'bumpScale', 0, 1).step(0.01).onChange(function (value) {
  earth.getObjectByName('surface').material.bumpScale = value;
});
guiSurface.add(surfaceControls, 'shininess', 0, 30).onChange(function (value) {
  earth.getObjectByName('surface').material.shininess = value;
});

guiMarkers.add(markersControls, 'address');
guiMarkers.addColor(markersControls, 'color');
guiMarkers.add(markersControls, 'placeMarker');

// guiAtmosphere.add(atmosphereControls, 'opacity', 0, 1).onChange(function (value) {
guiAtmosphere.add({opacity: 0.8}, 'opacity', 0, 1).onChange(function (value) {
  earth.getObjectByName('atmosphere').material.opacity = value;
});

guiAtmosphericGlow.add(atmosphericGlowControls, 'intensity', 0, 1).onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms['c'].value = value;
});
guiAtmosphericGlow.add(atmosphericGlowControls, 'fade', 0, 50).onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms['p'].value = value;
});
guiAtmosphericGlow.addColor(atmosphericGlowControls, 'color').onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms.glowColor.value.setHex(value);
});