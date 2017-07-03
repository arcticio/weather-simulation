
precision highp float;
precision highp int;

#define SHADER_NAME MeshPhongMaterial
#define ALPHATEST 0.5
#define GAMMA_FACTOR 2
#define USE_MAP
#define NUM_CLIPPING_PLANES 0
#define UNION_CLIPPING_PLANES 0

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

#define TONE_MAPPING
#define saturate(a) clamp( a, 0.0, 1.0 )

uniform float toneMappingExposure;
uniform float toneMappingWhitePoint;

vec3 LinearToneMapping( vec3 color ) {
  return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  return saturate( color / ( vec3( 1.0 ) + color ) );
}

#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )

vec3 Uncharted2ToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  color = max( vec3( 0.0 ), color - 0.004 );
  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}

vec3 toneMapping( vec3 color ) { return LinearToneMapping( color ); }

vec4 LinearToLinear( in vec4 value ) {
  return value;
}
vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
  return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );
}
vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
  return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );
}
vec4 sRGBToLinear( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );
}
vec4 LinearTosRGB( in vec4 value ) {
  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );
}
vec4 RGBEToLinear( in vec4 value ) {
  return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );
}
vec4 LinearToRGBE( in vec4 value ) {
  float maxComponent = max( max( value.r, value.g ), value.b );
  float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
  return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );
}
vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
  return vec4( value.xyz * value.w * maxRange, 1.0 );
}
vec4 LinearToRGBM( in vec4 value, in float maxRange ) {
  float maxRGB = max( value.x, max( value.g, value.b ) );
  float M      = clamp( maxRGB / maxRange, 0.0, 1.0 );
  M            = ceil( M * 255.0 ) / 255.0;
  return vec4( value.rgb / ( M * maxRange ), M );
}
vec4 RGBDToLinear( in vec4 value, in float maxRange ) {
    return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );
}
vec4 LinearToRGBD( in vec4 value, in float maxRange ) {
    float maxRGB = max( value.x, max( value.g, value.b ) );
    float D      = max( maxRange / maxRGB, 1.0 );
    D            = min( floor( D ) / 255.0, 1.0 );
    return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );
}

const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );

vec4 LinearToLogLuv( in vec4 value )  {
  vec3 Xp_Y_XYZp = value.rgb * cLogLuvM;
  Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
  vec4 vResult;
  vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
  float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
  vResult.w = fract(Le);
  vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
  return vResult;
}

const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );

vec4 LogLuvToLinear( in vec4 value ) {
  float Le = value.z * 255.0 + value.w;
  vec3 Xp_Y_XYZp;
  Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);
  Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;
  Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;
  vec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;
  return vec4( max(vRGB, 0.0), 1.0 );
}

vec4 mapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 envMapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 emissiveMapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 linearToOutputTexel( vec4 value ) { return LinearToLinear( value ); }

#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#define PI 3.14159265359
#define PI2 6.28318530718
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )

float pow2( const in float x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }

highp float rand( const in vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract(sin(sn) * c);
}

struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};

struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};

struct GeometricContext {
  vec3 position;
  vec3 normal;
  vec3 viewDir;
};

vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  float distance = dot( planeNormal, point - pointOnPlane );
  return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
  return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}

vec3 packNormalToRGB( const in vec3 normal ) {
  return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
  return 1.0 - 2.0 * rgb.xyz;
}

const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( const in float v ) {
  vec4 r = vec4( fract( v * PackFactors ), v );
  r.yzw -= r.xyz * ShiftRight8; return r * PackUpscale;
}

float unpackRGBAToDepth( const in vec4 v ) {
  return dot( v, UnpackFactors );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
  return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
  return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
  return ( near * far ) / ( ( far - near ) * invClipZ - far );
}


bool testLightInRange( const in float lightDistance, const in float cutoffDistance ) {
  return any( bvec2( cutoffDistance == 0.0, lightDistance < cutoffDistance ) );
}

float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
  if( decayExponent > 0.0 ) {
    return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
  }
  return 1.0;
}

vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {
  return RECIPROCAL_PI * diffuseColor;
}

vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {
  float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
  return ( 1.0 - specularColor ) * fresnel + specularColor;
}
float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {
  float a2 = pow2( alpha );
  float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
  float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
  return 1.0 / ( gl * gv );
}
float G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
  float a2 = pow2( alpha );
  float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
  float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
  return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
  float a2 = pow2( alpha );
  float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
  return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
  float alpha = pow2( roughness );
  vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
  float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
  float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
  float dotNH = saturate( dot( geometry.normal, halfDir ) );
  float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
  vec3 F = F_Schlick( specularColor, dotLH );
  float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );
  float D = D_GGX( alpha, dotNH );
  return F * ( G * D );
}
vec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
  float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
  vec4 r = roughness * c0 + c1;
  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
  vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
  return specularColor * AB.x + AB.y;
}
float G_BlinnPhong_Implicit( ) {
  return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
  return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {
  vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
  float dotNH = saturate( dot( geometry.normal, halfDir ) );
  float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
  vec3 F = F_Schlick( specularColor, dotLH );
  float G = G_BlinnPhong_Implicit( );
  float D = D_BlinnPhong( shininess, dotNH );
  return F * ( G * D );
}
float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
  return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
}
float BlinnExponentToGGXRoughness( const in float blinnExponent ) {
  return sqrt( 2.0 / ( blinnExponent + 2.0 ) );
}


uniform vec3 ambientLightColor;

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
  vec3 irradiance = ambientLightColor;
  irradiance *= PI;
  return irradiance;
}


struct SpotLight {
  vec3 position;
  vec3 direction;
  vec3 color;
  float distance;
  float decay;
  float coneCos;
  float penumbraCos;
  int shadow;
  float shadowBias;
  float shadowRadius;
  vec2 shadowMapSize;
};

uniform SpotLight spotLights[ 1 ];

void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {
  vec3 lVector = spotLight.position - geometry.position;
  directLight.direction = normalize( lVector );
  float lightDistance = length( lVector );
  float angleCos = dot( directLight.direction, spotLight.direction );
  if ( all( bvec2( angleCos > spotLight.coneCos, testLightInRange( lightDistance, spotLight.distance ) ) ) ) {
    float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );
    directLight.color = spotLight.color;
    directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );
    directLight.visible = true;
  } else {
    directLight.color = vec3( 0.0 );
    directLight.visible = false;
  }
}

struct HemisphereLight {
  vec3 direction;
  vec3 skyColor;
  vec3 groundColor;
};
uniform HemisphereLight hemisphereLights[ 1 ];
vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {
  float dotNL = dot( geometry.normal, hemiLight.direction );
  float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
  vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
  irradiance *= PI;
  return irradiance;
}

varying vec3 vViewPosition;
varying vec3 vNormal;

struct BlinnPhongMaterial {
  vec3  diffuseColor;
  vec3  specularColor;
  float specularShininess;
  float specularStrength;
};

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  irradiance *= PI;
  reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
  reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}

#define RE_Direct       RE_Direct_BlinnPhong
#define RE_IndirectDiffuse    RE_IndirectDiffuse_BlinnPhong
#define Material_LightProbeLOD( material )  (0)


//////////////////////////////////////////////////

void main() {

  vec4 diffuseColor = vec4( diffuse, opacity );
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;

  float specularStrength;
  specularStrength = 1.0;

  // #ifdef DOUBLE_SIDED
  float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
  
  vec3 normal = normalize( vNormal ) * flipNormal;
  
  BlinnPhongMaterial material;
  material.diffuseColor = diffuseColor.rgb;
  material.specularColor = specular;
  material.specularShininess = shininess;
  material.specularStrength = specularStrength;
    
  GeometricContext geometry;
  geometry.position = - vViewPosition;
  geometry.normal = normal;
  geometry.viewDir = normalize( vViewPosition );

  IncidentLight directLight;

  SpotLight spotLight;
  spotLight = spotLights[ 0 ];
  getSpotDirectLightIrradiance( spotLight, geometry, directLight );

  RE_Direct( directLight, geometry, material, reflectedLight );
    
  vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );      
  irradiance += getHemisphereLightIrradiance( hemisphereLights[ 0 ], geometry );
    
  RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  
  gl_FragColor = vec4( outgoingLight, diffuseColor.a );

  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );

  gl_FragColor = linearToOutputTexel( gl_FragColor );

}
