
## VERTEX

varying vec3 vPositionW;
varying vec3 vNormalW;

attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec4 vertex_tangent;
attribute vec2 vertex_texCoord0;
attribute vec2 vertex_texCoord1;
attribute vec4 vertex_color;

uniform mat4 matrix_viewProjection;
uniform mat4 matrix_model;
uniform mat3 matrix_normal;

vec3 dPositionW;
mat4 dModelMatrix;
mat3 dNormalMatrix;
vec3 dLightPosW;
vec3 dLightDirNormW;
vec3 dNormalW;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec4 posW = dModelMatrix * vec4(vertex_position, 1.0);
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}

vec3 getNormal() {
    dNormalMatrix = matrix_normal;
    return normalize(dNormalMatrix * vertex_normal);
}

void main(void) {
    gl_Position = getPosition();
   vPositionW    = getWorldPosition();
   vNormalW    = dNormalW = getNormal();
}


## FRAGMENT


#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec3 view_position;
uniform vec3 light_globalAmbient;
float square(float x) {
    return x*x;
}
float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}
vec3 saturate(vec3 x) {
    return clamp(x, vec3(0.0), vec3(1.0));
}
vec4 dReflection;
vec3 dAlbedo;
vec3 dNormalW;
vec3 dViewDirW;
vec3 dDiffuseLight;
vec3 dSpecularLight;
vec3 dLightDirNormW;
vec3 dSpecularity;
float dAlpha;
float dAtten;
uniform vec3 light0_color;
uniform vec3 light0_direction;

void getNormal() {
    dNormalW = normalize(vNormalW);
}
vec4 texture2DSRGB(sampler2D tex, vec2 uv) {
    return texture2D(tex, uv);
}
vec4 textureCubeSRGB(samplerCube tex, vec3 uvw) {
    return textureCube(tex, uvw);
}
vec3 gammaCorrectOutput(vec3 color) {
    return color;
}
vec3 gammaCorrectInput(vec3 color) {
    return color;
}
float gammaCorrectInput(float color) {
    return color;
}
vec4 gammaCorrectInput(vec4 color) {
    return color;
}
vec3 toneMap(vec3 color) {
    return color;
}
vec3 addFog(vec3 color) {
    return color;
}
vec3 cubeMapProject(vec3 dir) {
    return dir;
}
vec3 processEnvironment(vec3 color) {
    return color;
}
uniform vec3 material_diffuse;
void getAlbedo() {
    dAlbedo = material_diffuse.rgb;
}
uniform float material_opacity;
void getOpacity() {
    dAlpha = material_opacity;
}
uniform vec3 material_emissive;

vec3 getEmission() {
    // Dot the world space normal with the world space directional light vector
    float nDotL = dot(dNormalW, light0_direction);
    // fresnel factor
    float fresnel = 1.0 - max(dot(dNormalW, dViewDirW), 0.0);
    float atmosphereFactor = max(0.0, pow(fresnel * 1.5, 1.5)) - max(0.0, pow(fresnel, 15.0)) * 6.0;
    vec3 atmosphereColorDay = vec3(0.3, 0.7, 1);
    vec3 atmosphereColorDark = vec3(0, 0, 0.5);
    vec3 atmosphereColorSunset = vec3(1, 0.3, 0.1);
    vec3 atmosphereColorNight = vec3(0.05, 0.05, 0.1);
    
    float reflecting = max(0.0, dot(reflect(dViewDirW, dNormalW), light0_direction));
    
    atmosphereColorDark = mix(atmosphereColorDark, atmosphereColorSunset + atmosphereColorSunset * reflecting * 2.0, pow(reflecting, 16.0) * max(0.0, nDotL + 0.7));
    
    vec3 atmosphereColor = mix(atmosphereColorDay, atmosphereColorDark, min(1.0, (nDotL / 2.0 + 0.6) * 1.7));
    atmosphereColor = mix(atmosphereColor, atmosphereColorNight, min(1.0, (nDotL / 2.0 + 0.4) * 1.5));
    atmosphereColor *= atmosphereFactor;
    
    return atmosphereColor;
}

float getLightDiffuse() {
    return max(dot(dNormalW, -dLightDirNormW), 0.0);
}
vec3 combineColor() {
    return dAlbedo * dDiffuseLight;
}

void addAmbient() {
    dDiffuseLight += light_globalAmbient;
}
void getViewDir() {
    dViewDirW = normalize(view_position - vPositionW);
}

void main(void) {
    dDiffuseLight = vec3(0);
    dSpecularLight = vec3(0);
    dReflection = vec4(0);
    dSpecularity = vec3(0);
   getOpacity();
   getViewDir();
   getNormal();
   getAlbedo();
   addAmbient();
   dLightDirNormW = light0_direction;
   dAtten = 1.0;
       dAtten *= getLightDiffuse();
       dDiffuseLight += dAtten * light0_color;


   gl_FragColor.rgb = combineColor();
   gl_FragColor.rgb += getEmission();
   gl_FragColor.rgb = addFog(gl_FragColor.rgb);
   gl_FragColor.rgb = toneMap(gl_FragColor.rgb);
   gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);
gl_FragColor.a = 1.0;

}
