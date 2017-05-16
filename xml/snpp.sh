#!/bin/bash

gdalwarp -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=500 -ts 2048 2048:             \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137                                    \
    GIBS_Globe_SNPP.xml  globe.snpp.top.2048.tif    





gdal_translate -of JPEG -co "QUALITY=80" globe.snpp.top.2048.tif  globe.snpp.top.2048.jpg

exit


gdalwarp -r cubic -overwrite -wo SAMPLE_GRID=YES  -ts 2048 2048:             \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137                                    \
    GIBS_Terra_MODIS_true.xml  earth.top.globe.2048.tif    

gdal_translate -of JPEG -co "QUALITY=94" earth.top.globe.2048.tif   earth.top.globe.2048.jpg
gdal_translate -of JPEG -outsize 500 250 GIBS_Aqua_MODIS_true.xml onearth_global_mosaic.jpg

exit 

    GIBS_Aqua_MODIS_true.xml    -overwrite earth.top.1024.tif     


echo ""
echo bottom
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=-90  +datum=WGS84 +units=degrees"  \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.bottom.tif      

echo ""
echo top
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees"   \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.top.tif         

echo ""
echo right
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=90  +lat_0=0  +datum=WGS84 +units=degrees"   \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.right.tif       

echo ""
echo left
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=-90  +lat_0=0  +datum=WGS84 +units=degrees"  \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.left.tif        

echo ""
echo front
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=0  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.front.tif       

echo ""
echo back
gdalwarp -r cubic -overwrite -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES       \
    -t_srs "+proj=gnom  +lon_0=-180  +lat_0=0  +datum=WGS84 +units=degrees" \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                    \
    earth.gibs.snpp.8192.tif  earth.back.tif        


gdal_translate -of JPEG -co "QUALITY=94" earth.top.tif    earth.top.snpp.2048.jpg
gdal_translate -of JPEG -co "QUALITY=94" earth.bottom.tif earth.bottom.snpp.2048.jpg
gdal_translate -of JPEG -co "QUALITY=94" earth.right.tif  earth.right.snpp.2048.jpg
gdal_translate -of JPEG -co "QUALITY=94" earth.left.tif   earth.left.snpp.2048.jpg
gdal_translate -of JPEG -co "QUALITY=94" earth.front.tif  earth.front.snpp.2048.jpg
gdal_translate -of JPEG -co "QUALITY=94" earth.back.tif   earth.back.snpp.2048.jpg

cp earth.top.snpp.2048.jpg    ../images/snpp/earth.top.snpp.2048.jpg
cp earth.bottom.snpp.2048.jpg ../images/snpp/earth.bottom.snpp.2048.jpg
cp earth.right.snpp.2048.jpg  ../images/snpp/earth.right.snpp.2048.jpg
cp earth.left.snpp.2048.jpg   ../images/snpp/earth.left.snpp.2048.jpg
cp earth.front.snpp.2048.jpg  ../images/snpp/earth.front.snpp.2048.jpg
cp earth.back.snpp.2048.jpg   ../images/snpp/earth.back.snpp.2048.jpg

echo cleanup
rm earth*.xml

exit


gdalwarp -r cubic -overwrite                                                 \
    -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES                                 \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees"    \
    -te -6378137 -6378137 6378137 6378137  -tr 6230 6230                     \
    GIBS_Aqua_MODIS_true.xml    -overwrite earth.top.tif     





gdal_translate -of JPEG -co "QUALITY=100" earth.top.tif earth.top.gibs.2048.jpg

cp earth.top.gibs.2048.jpg ../images/earth.top.gibs.2048.jpg


https://trac.osgeo.org/gdal/ticket/4627
http://www.gdal.org/gdalwarp.html
https://github.com/k9/globe-viewer/blob/master/script/process-images.sh

exit

https://gibs.earthdata.nasa.gov/image-download?TIME=2017130&extent=-180,-90,180,90&epsg=4326&layers=MODIS_Terra_CorrectedReflectance_TrueColor&opacities=1&worldfile=false&format=image/tif&width=8192&height=4096
https://gibs.earthdata.nasa.gov/image-download?TIME=2016220&extent=-180,-90,180,90&epsg=4326&layers=VIIRS_SNPP_CorrectedReflectance_TrueColor&opacities=1&worldfile=false&format=image/tif&width=8192&height=4096

VIIRS_SNPP_CorrectedReflectance_TrueColor




-te xmin ymin xmax ymax:
    set georeferenced extents of output file to be created (in target SRS by default, or in the SRS specified with -te_srs) 


    # -t_srs "+proj=gnom +lon_0=0 +lat_0=90  +x_0=100 +y_0=100 +R=6371000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs" \


gdalwarp \
    -t_srs "+proj=gnom +lon_0=0 +lat_0=90  +x_0=0 +y_0=0 +R=6371000   +x_0=0 +y_0=0 +a=1737400 +b=1737400 +datum=WGS84 +ellps=WGS84 +units=m +no_defs" \
    -te -180.0, 90, 396.0, -198 \
    -tr 1000000 1000000         \
    GIBS_Aqua_MODIS_true.xml    \
    -overwrite earth.top.tif


    -t_srs "+proj=gnom +lon_0=0 +lat_0=90  +x_0=0 +y_0=0 +a=1737400 +b=1737400 +datum=WGS84 +ellps=WGS84 +units=degrees +no_defs +k=1 +x_0=0 +y_0=0" \



gdalwarp -t_srs '+proj=gnom +lat_0=-90 +lat_ts=-90 +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=1737400 +b=1737400 +units=m +no_defs' topo_stereo.tif topo_gnom.tif'   

+ellps=WGS84 +datum=WGS84 +units=m +no_defs

gdalwarp -t_srs "+proj=gnom +lon_0=0 +lat_0=90  +x_0=0 +y_0=0 +a=1737400 +b=1737400 +datum=WGS84" -te -180.0, 90, 396.0, -198 -tr 1000 1000  GIBS_Aqua_MODIS_true.xml -overwrite earth.top.tif


gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=0   +lat_0=0   +datum=WGS84" -tr 20000 20000 -overwrite plate.tif px.tif 



# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=0   +lat_0=0   +datum=WGS84" -tr 20000 20000 -overwrite plate.tif px.tif 
# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=180 +lat_0=0   +datum=WGS84" -tr 20000 20000 -overwrite plate.tif nx.tif
# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=90  +lat_0=0   +datum=WGS84" -tr 20000 20000 -overwrite plate.tif py.tif
# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=-90 +lat_0=0   +datum=WGS84" -tr 20000 20000 -overwrite plate.tif ny.tif
# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=0   +lat_0=90  +datum=WGS84" -tr 20000 20000 -overwrite plate.tif pz.tif top
# gdalwarp -te -6378137 -6378137 6378137 6378137 -t_srs "+proj=gnom  +lon_0=0   +lat_0=-90 +datum=WGS84" -tr 20000 20000 -overwrite plate.tif nz.tif bot



gdalwarp -t_srs '+proj=gnom +lat_0=-90 +lon_0=0 +x_0=0 +y_0=0 +a=1737400 +b=1737400 +units=m +no_defs ' topo_stereo.tif topo_gnom.tif



## works
## gdal_translate -of GTiff -outsize 1200 1000 -projwin -105 42 -93 32 GIBS_Aqua_MODIS_true.xml GreatPlainsSmoke1.tif
## gdal_translate -of PNG GreatPlainsSmokeAI.tif GreatPlainsSmokeAI.png


## ./aqua.sh: error reading input file: Stale file handle
## gdalwarp -t_srs '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-145 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs' -te -1600000 -2500000 1200000 -400000 -tr 1000 1000 GIBS_Aqua_MODIS_Arctic.xml -overwrite Beaufort_neg145down_1km.tif

## gdal_translate -of JPEG Beaufort_neg145down_1km.tif Beaufort_neg145down_1km.jpg

## gdalwarp -wo SOURCE_EXTRA=100 -wo SAMPLE_GRID=YES  -t_srs "+proj=gnom +lon_0=0 +lat_0=90 +datum=WGS84" -te -180.0, 90, 396.0, -198 -tr 1000 1000  GIBS_Aqua_MODIS_true.xml -overwrite earth.top.tif


## https://gibs.earthdata.nasa.gov/image-download?TIME=2017130&extent=-180,-90,180,90&epsg=4326&layers=MODIS_Terra_CorrectedReflectance_TrueColor&opacities=1&worldfile=false&format=image/jpeg&width=2048&height=1024

