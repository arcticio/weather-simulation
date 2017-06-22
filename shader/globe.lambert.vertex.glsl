precision highp float;
precision highp int;
#define SHADER_NAME MeshLambertMaterial
#define VERTEX_TEXTURES
#define GAMMA_FACTOR 2
#define MAX_BONES 1019
#define USE_MAP
#define NUM_CLIPPING_PLANES 0
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
#ifdef USE_COLOR
  attribute vec3 color;
#endif
#ifdef USE_MORPHTARGETS
  attribute vec3 morphTarget0;
  attribute vec3 morphTarget1;
  attribute vec3 morphTarget2;
  attribute vec3 morphTarget3;
  #ifdef USE_MORPHNORMALS
    attribute vec3 morphNormal0;
    attribute vec3 morphNormal1;
    attribute vec3 morphNormal2;
    attribute vec3 morphNormal3;
  #else
    attribute vec3 morphTarget4;
    attribute vec3 morphTarget5;
    attribute vec3 morphTarget6;
    attribute vec3 morphTarget7;
  #endif
#endif
#ifdef USE_SKINNING
  attribute vec4 skinIndex;
  attribute vec4 skinWeight;
#endif

#define LAMBERT
varying vec3 vLightFront;
#ifdef DOUBLE_SIDED
  varying vec3 vLightBack;
#endif
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

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )
  varying vec2 vUv;
  uniform vec4 offsetRepeat;
#endif

#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
  attribute vec2 uv2;
  varying vec2 vUv2;
#endif
#ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
    varying vec3 vWorldPosition;
  #else
    varying vec3 vReflect;
    uniform float refractionRatio;
  #endif
#endif

bool testLightInRange( const in float lightDistance, const in float cutoffDistance ) {
  return any( bvec2( cutoffDistance == 0.0, lightDistance < cutoffDistance ) );
}
float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
    if( decayExponent > 0.0 ) {
#if defined ( PHYSICALLY_CORRECT_LIGHTS )
      float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
      float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
      return distanceFalloff * maxDistanceCutoffFactor;
#else
      return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
#endif
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
  #ifndef PHYSICALLY_CORRECT_LIGHTS
    irradiance *= PI;
  #endif
  return irradiance;
}
#if 0 > 0
  struct DirectionalLight {
    vec3 direction;
    vec3 color;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
  };
  uniform DirectionalLight directionalLights[ 0 ];
  void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {
    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;
    directLight.visible = true;
  }
#endif
#if 0 > 0
  struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
  };
  uniform PointLight pointLights[ 0 ];
  void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {
    vec3 lVector = pointLight.position - geometry.position;
    directLight.direction = normalize( lVector );
    float lightDistance = length( lVector );
    if ( testLightInRange( lightDistance, pointLight.distance ) ) {
      directLight.color = pointLight.color;
      directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
      directLight.visible = true;
    } else {
      directLight.color = vec3( 0.0 );
      directLight.visible = false;
    }
  }
#endif
#if 1 > 0
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
#endif
#if 1 > 0
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
    #ifndef PHYSICALLY_CORRECT_LIGHTS
      irradiance *= PI;
    #endif
    return irradiance;
  }
#endif
#if defined( USE_ENVMAP ) && defined( PHYSICAL )
  vec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {
    #ifdef DOUBLE_SIDED
  float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
#else
  float flipNormal = 1.0;
#endif

    vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
    #ifdef ENVMAP_TYPE_CUBE
      vec3 queryVec = flipNormal * vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
      #ifdef TEXTURE_LOD_EXT
        vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );
      #else
        vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
      #endif
      envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
    #elif defined( ENVMAP_TYPE_CUBE_UV )
      vec3 queryVec = flipNormal * vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
      vec4 envMapColor = textureCubeUV( queryVec, 1.0 );
    #else
      vec4 envMapColor = vec4( 0.0 );
    #endif
    return PI * envMapColor.rgb * envMapIntensity;
  }
  float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {
    float maxMIPLevelScalar = float( maxMIPLevel );
    float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );
    return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
  }
  vec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {
    #ifdef ENVMAP_MODE_REFLECTION
      vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );
    #else
      vec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );
    #endif
    #ifdef DOUBLE_SIDED
  float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
#else
  float flipNormal = 1.0;
#endif

    reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
    float specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );
    #ifdef ENVMAP_TYPE_CUBE
      vec3 queryReflectVec = flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
      #ifdef TEXTURE_LOD_EXT
        vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
      #else
        vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
      #endif
      envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
    #elif defined( ENVMAP_TYPE_CUBE_UV )
      vec3 queryReflectVec = flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
      vec4 envMapColor = textureCubeUV(queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent));
    #elif defined( ENVMAP_TYPE_EQUIREC )
      vec2 sampleUV;
      sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
      sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
      #ifdef TEXTURE_LOD_EXT
        vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );
      #else
        vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );
      #endif
      envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
    #elif defined( ENVMAP_TYPE_SPHERE )
      vec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );
      #ifdef TEXTURE_LOD_EXT
        vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
      #else
        vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
      #endif
      envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
    #endif
    return envMapColor.rgb * envMapIntensity;
  }
#endif

#ifdef USE_COLOR
  varying vec3 vColor;
#endif
#ifdef USE_MORPHTARGETS
  #ifndef USE_MORPHNORMALS
  uniform float morphTargetInfluences[ 8 ];
  #else
  uniform float morphTargetInfluences[ 4 ];
  #endif
#endif
#ifdef USE_SKINNING
  uniform mat4 bindMatrix;
  uniform mat4 bindMatrixInverse;
  #ifdef BONE_TEXTURE
    uniform sampler2D boneTexture;
    uniform int boneTextureWidth;
    uniform int boneTextureHeight;
    mat4 getBoneMatrix( const in float i ) {
      float j = i * 4.0;
      float x = mod( j, float( boneTextureWidth ) );
      float y = floor( j / float( boneTextureWidth ) );
      float dx = 1.0 / float( boneTextureWidth );
      float dy = 1.0 / float( boneTextureHeight );
      y = dy * ( y + 0.5 );
      vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
      vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
      vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
      vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
      mat4 bone = mat4( v1, v2, v3, v4 );
      return bone;
    }
  #else
    uniform mat4 boneMatrices[ MAX_BONES ];
    mat4 getBoneMatrix( const in float i ) {
      mat4 bone = boneMatrices[ int(i) ];
      return bone;
    }
  #endif
#endif

#ifdef USE_SHADOWMAP
  #if 0 > 0
    uniform mat4 directionalShadowMatrix[ 0 ];
    varying vec4 vDirectionalShadowCoord[ 0 ];
  #endif
  #if 1 > 0
    uniform mat4 spotShadowMatrix[ 1 ];
    varying vec4 vSpotShadowCoord[ 1 ];
  #endif
  #if 0 > 0
    uniform mat4 pointShadowMatrix[ 0 ];
    varying vec4 vPointShadowCoord[ 0 ];
  #endif
#endif

#ifdef USE_LOGDEPTHBUF
  #ifdef USE_LOGDEPTHBUF_EXT
    varying float vFragDepth;
  #endif
  uniform float logDepthBufFC;
#endif
#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )
  varying vec3 vViewPosition;
#endif

void main() {
  #if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )
  vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
#endif
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
  vUv2 = uv2;
#endif
  #ifdef USE_COLOR
  vColor.xyz = color.xyz;
#endif
  
vec3 objectNormal = vec3( normal );

  #ifdef USE_MORPHNORMALS
  objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
  objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
  objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
  objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
#endif

  #ifdef USE_SKINNING
  mat4 boneMatX = getBoneMatrix( skinIndex.x );
  mat4 boneMatY = getBoneMatrix( skinIndex.y );
  mat4 boneMatZ = getBoneMatrix( skinIndex.z );
  mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif
  #ifdef USE_SKINNING
  mat4 skinMatrix = mat4( 0.0 );
  skinMatrix += skinWeight.x * boneMatX;
  skinMatrix += skinWeight.y * boneMatY;
  skinMatrix += skinWeight.z * boneMatZ;
  skinMatrix += skinWeight.w * boneMatW;
  skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;
  objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
#endif

  #ifdef FLIP_SIDED
  objectNormal = -objectNormal;
#endif
vec3 transformedNormal = normalMatrix * objectNormal;

  
vec3 transformed = vec3( position );

  #ifdef USE_MORPHTARGETS
  transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
  transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
  transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
  transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
  #ifndef USE_MORPHNORMALS
  transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
  transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
  transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
  transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
  #endif
#endif

  #ifdef USE_SKINNING
  vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
  vec4 skinned = vec4( 0.0 );
  skinned += boneMatX * skinVertex * skinWeight.x;
  skinned += boneMatY * skinVertex * skinWeight.y;
  skinned += boneMatZ * skinVertex * skinWeight.z;
  skinned += boneMatW * skinVertex * skinWeight.w;
  skinned  = bindMatrixInverse * skinned;
#endif

  #ifdef USE_SKINNING
  vec4 mvPosition = modelViewMatrix * skinned;
#else
  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
#endif
gl_Position = projectionMatrix * mvPosition;

  #ifdef USE_LOGDEPTHBUF
  gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;
  #ifdef USE_LOGDEPTHBUF_EXT
    vFragDepth = 1.0 + gl_Position.w;
  #else
    gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;
  #endif
#endif

  #if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )
  vViewPosition = - mvPosition.xyz;
#endif

  #if defined( USE_ENVMAP ) || defined( PHONG ) || defined( PHYSICAL ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )
  #ifdef USE_SKINNING
    vec4 worldPosition = modelMatrix * skinned;
  #else
    vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
  #endif
#endif

  #ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
    vWorldPosition = worldPosition.xyz;
  #else
    vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vReflect = reflect( cameraToVertex, worldNormal );
    #else
      vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
    #endif
  #endif
#endif

  vec3 diffuse = vec3( 1.0 );
GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = normalize( -mvPosition.xyz );
GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;
vLightFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
  vLightBack = vec3( 0.0 );
#endif
IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;
#if 0 > 0
  
#endif
#if 1 > 0
  
    getSpotDirectLightIrradiance( spotLights[ 0 ], geometry, directLight );
    dotNL = dot( geometry.normal, directLight.direction );
    directLightColor_Diffuse = PI * directLight.color;
    vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
    #ifdef DOUBLE_SIDED
      vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
    #endif
  
#endif
#if 0 > 0
  
#endif
#if 1 > 0
  
    vLightFront += getHemisphereLightIrradiance( hemisphereLights[ 0 ], geometry );
    #ifdef DOUBLE_SIDED
      vLightBack += getHemisphereLightIrradiance( hemisphereLights[ 0 ], backGeometry );
    #endif
  
#endif

  #ifdef USE_SHADOWMAP
  #if 0 > 0
  
  #endif
  #if 1 > 0
  
    vSpotShadowCoord[ 0 ] = spotShadowMatrix[ 0 ] * worldPosition;
  
  #endif
  #if 0 > 0
  
  #endif
#endif

}
