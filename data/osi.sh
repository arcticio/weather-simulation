#!/bin/bash

# gdal_translate  NETCDF:"seaicenh/ice_conc_nh_polstere-100_amsr2_201707011200.nc":ice_conc seaice.nh.tif

# gdal_translate  NETCDF:"ftp://osisaf.met.no/prod/ice/conc_amsr/ice_conc_nh_polstere-100_amsr2_201707251200.nc":ice_conc seaice.nh.20170725.tif


# exit

    # NETCDF:"seaicenh/ice_conc_nh_polstere-100_amsr2_201707011200.nc":ice_conc               \

gdalwarp -q -overwrite -et 0.8 -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=500  \
    -ts 1024 1024                                                           \
    -t_srs "+proj=gnom  +lon_0=0  +lat_0=90  +datum=WGS84 +units=degrees" \
    -te -6378137 -6378137 6378137 6378137                                 \
    "/vsicurl/ftp://osisaf.met.no/prod/ice/conc_amsr/ice_conc_nh_polstere-100_amsr2_201707251200.nc":ice_conc \
    polar.amsr2.top.1024.tif

convert polar.amsr2.top.1024.tif polar.amsr2.top.1024.png


./color2alpha -ca "#000000" polar.amsr2.top.1024.png polar.amsr2.top.1024.trans.png
