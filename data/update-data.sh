#!/bin/bash

#### https://linux.die.net/man/1/date
#### https://unix.stackexchange.com/questions/49053/linux-add-x-days-to-date-and-get-new-virtual-date
#### https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
#### http://www.fmwconcepts.com/imagemagick/index.php

### convert 2017-05-23.polar.amsr2.top.1024.png -grayscale rec601luma top.grey.png

DATEPAR="$@"
DATENOW=`date -u +%Y-%m-%d`
DOENOW=` date -u +%Y-%j`

## Keep this
YESTER=`date "+%y-%m-%d" -d "$DATE-1days"`

if [[ -z "${DATEPAR// }" ]]; then
  DATE=`date -d "yesterday 12:00" '+%Y-%m-%d'`
  DATESST=`date "+%y-%m-%d" -d "$DATE-1days"`

else 
  DATE=$DATEPAR
  DATESST=$DATE

fi

TASKS="dods seaice sst snpp"
# TASKS="dods seaice snpp"
TASKS="seaice snpp"

echo
echo "Now: ${DATENOW} Param: ${DATEPAR} Using: ${DATE} SST: ${DATESST} Tasks: ${TASKS}"
echo
gdalwarp --version

## nice options --debug 

# exit

####### GLOBE, SNPP

if [[ "$TASKS" =~ "snpp" ]]; then
  echo 
  echo "snpp cube for ${DATE}"  
  python snpp.py $DATE
  touch "snpp/$DATE.txt"

fi


####### SEAICE, AMSR2

if [[ "$TASKS" =~ "seaice" ]]; then
  echo 
  echo "amsr2 cube for ${DATE}"
  python seaice.py $DATE
  touch "seaice/$DATE.txt"

fi

####### GLOBE SST

if [[ "$TASKS" =~ "sst" ]]; then
  echo 
  echo "sst cube for ${DATESST}"
  python sst.py $DATESST
  touch "sst/$DATESST.txt"

fi


####### GFS, uv wind, tmp2m

if [[ "$TASKS" =~ "dods" ]]; then

  DATEGFS="${DATE//-}" 

  echo 
  echo "ugrd10m, vgrd10m, tmp2m, tcdcclm for ${DATEGFS}"
  wget -O "gfs/${DATE}.ugrd10m.dods" "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATEGFS}/gfs_1p00_00z.ascii?ugrd10m[0:0][0:180][0:359]"
  wget -O "gfs/${DATE}.vgrd10m.dods" "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATEGFS}/gfs_1p00_00z.ascii?vgrd10m[0:0][0:180][0:359]"
  wget -O "gfs/${DATE}.tmp2m.dods"   "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATEGFS}/gfs_1p00_00z.ascii?tmp2m[0:0][0:180][0:359]"
  wget -O "gfs/${DATE}.tcdcclm.dods" "http://nomads.ncep.noaa.gov:9090/dods/gfs_1p00/gfs${DATEGFS}/gfs_1p00_00z.ascii?tcdcclm[0:0][0:180][0:359]"

fi

echo "DONE"
echo "--------------"
echo


exit

http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170527/gfs_0p50_00z.ascii?tmp2m[0:4][0:0][0:0]

  tmp2m, [5][1][1]
  [0][0], 225.58

  [1][0], 225.84999

  [2][0], 225.90001

  [3][0], 225.7

  [4][0], 226.3


  time, [5]
  736477.0, 736477.125, 736477.25, 736477.375, 736477.5
  lat, [1]
  -90.0
  lon, [1]
  0.0


http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170527/gfs_0p50_06z.ascii?tmp2m[0:0][0:2:360][0:2:719]