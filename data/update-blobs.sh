#!/bin/bash

#### https://linux.die.net/man/1/date

DATE=`date -u +%Y-%m-%d`
DOE=`date -u +%Y-%j`

BEFORE=`date -d "yesterday 12:00" '+%Y-%m-%d'`
BEFOREDOE=`date -d "yesterday 12:00" '+%Y-%j'`

TASKS="seaice dods globe sst"
TASKS="dods"

echo Dates: "${DATE} - ${BEFORE}"
echo Does: " ${DOE}   - ${BEFOREDOE}"


####### GLOBE, SNPP

if [[ "$TASKS" =~ "globe" ]]; then

  DATE=`date -d "yesterday 12:00" '+%Y-%m-%d'`
  echo 
  echo "snpp cube for ${DATE}"  
  python globe.py $DATE
  touch ../images/snpp/$DATE.txt

fi


####### SEAICE, AMSR2

if [[ "$TASKS" =~ "seaice" ]]; then

  DATE=`date -d "yesterday 12:00" '+%Y-%m-%d'`
  echo 
  echo "amsr2 cube for ${DATE}"
  python seaice.py $DATE
  touch ../images/seaice/$DATE.txt

fi

####### SST

if [[ "$TASKS" =~ "sst" ]]; then

  # DATE=`date -d "yesterday 12:00" '+%Y-%m-%d'`
  DATE=`date -d "2 days ago" '+%Y-%m-%d'`
  echo 
  echo "sst cube for ${DATE}"
  python sst.py $DATE
  touch ../images/sst/$DATE.txt

fi


####### GFS, uv wind, tmp2m

if [[ "$TASKS" =~ "dods" ]]; then

  DATE=`date -d "yesterday 12:00" '+%Y%m%d'`
  echo 
  echo "ugrd10m, vgrd10m, tmp2m for ${DATE}"
  wget -O "ugrd10m.1x180x360.dods" "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATE}/gfs_1p00_00z.ascii?ugrd10m[0:0][0:180][0:359]"
  wget -O "vgrd10m.1x180x360.dods" "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATE}/gfs_1p00_00z.ascii?vgrd10m[0:0][0:180][0:359]"
  wget -O "tmp2m.1x180x360.dods"   "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATE}/gfs_1p00_00z.ascii?tmp2m[0:0][0:180][0:359]"

fi

## SST

