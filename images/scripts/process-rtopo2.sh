#!/bin/bash

# ncrename -d londim,lon RTopo-2.0.1_1min_aux.nc rt01.nc
# ncrename -d londim,lon rt01.nc rt02.nc
# gdal_translate  NETCDF:"rt02.nc":amask rtopo2.amask.tif

gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=-90  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.bottom.4096.tif

gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees"     \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.top.4096.tif

gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=-90  +lat_0=0  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.left.4096.tif

gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=90  +lat_0=0  +datum=WGS84 +units=degrees"     \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.right.4096.tif


gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=0  +datum=WGS84 +units=degrees"      \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.front.4096.tif

gdalwarp                                                                      \
    -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=1000                     \
    -s_srs EPSG:4326                                                          \
    -t_srs "+proj=gnom  +lon_0=180  +lat_0=0  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137                                     \
    -ts 4096 4096                                                             \
    rtopo2.amask.tif globe.rtopo2.back.4096.tif


declare -a faces=("bottom" "top" "front" "back" "left" "right")

for face in "${faces[@]}"; do
  convert globe.rtopo2.${face}.4096.tif globe.rtopo2.${face}.mask.4096.png
done

for face in "${faces[@]}"; do

  convert globe.rtopo2.${face}.mask.4096.png           \
      -fuzz 0% -fill "#808080" -opaque "#000000"       \
      -fuzz 0% -fill "#aaaaaa" -opaque "#010101"       \
      -fuzz 0% -fill "#cccccc" -opaque "#020202"       \
      -fuzz 0% -fill "#333333" -opaque "#030303"       \
      globe.rtopo2.${face}.4096.png   

done

echo done

# colCont    = '#333333' # '0.5'  from 3
# colRiver   = '#555555' # '0.5'
# colLake    = '#555555' # '0.6'
# colWater   = '#808080' # '0.7'  from 0
# colLandIce = '#aaaaaa' # '0.7'  from 1
# colShelf   = '#cccccc' # '0.7'  from 2

