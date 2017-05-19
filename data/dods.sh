
Browser

  Nomads => PA => Browser
  Nomads => PA => GAE => Browser

Plugin

  Nomads => Plugin


# OPeNDAP/DODS Data URL:  http://nomads.ncep.noaa.gov:80/dods/gfs_0p25/gfs20170519/gfs_0p25_00z

# Description:
#   GFS 0.25 deg starting from 00Z19may2017, downloaded May 19 04:42 UTC

# Longitude:     0.00000000000°E to 359.75000000000°E   (1440 points, avg. res. 0.25°)
# Latitude:    -90.00000000000°N to  90.00000000000°N    (721 points, avg. res. 0.25°)
# Altitude:   1000.00000000000   to   1.00000000000       (31 points, avg. res. 33.3)

# Time:       00Z19MAY2017 to 00Z29MAY2017                (81 points, avg. res. 0.125 days) 3H


wget -O ugrd10.1.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?ugrd10m[0:0][0:1:360][0:1:719]"
wget -O vgrd10.1.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:0][0:1:360][0:1:719]"

# wget -O vgrd10.2.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:1][0:1:360][0:1:719]"


# wget -O  tmp2m.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?tmp2m[0:2:56][0:1:360][0:1:719]"
# wget -O ugrd10.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?ugrd10m[0:2:56][0:1:360][0:1:719]"
# wget -O vgrd10.dods "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:2:56][0:1:360][0:1:719]"


# wget --server-response --spider --header="accept-encoding: gzip" "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:2:56][0:1:360][0:1:719]"



# --header="accept-encoding: gzip"
# $ wget -qO - <url> | gzip -c > file_name.gz



# noiv@T800:/media/noiv/OS/Octets/Projects/weather-simulation/data$ wget --server-response --spider "http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:2:56][0:1:360][0:1:719]"
# Spider mode enabled. Check if remote file exists.
# --2017-05-19 10:27:36--  http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170519/gfs_0p50_00z.ascii?vgrd10m[0:2:56][0:1:360][0:1:719]
# Resolving nomads.ncep.noaa.gov (nomads.ncep.noaa.gov)... 140.90.101.62
# Connecting to nomads.ncep.noaa.gov (nomads.ncep.noaa.gov)|140.90.101.62|:9090... connected.
# HTTP request sent, awaiting response... 
#   HTTP/1.1 200 OK
#   Date: Fri, 19 May 2017 08:26:58 GMT
#   X-Frame-Options: SAMEORIGIN
#   X-Content-Type-Options: nosniff
#   X-XSS-Protection: 1; mode=block
#   Last-Modified: Fri, 19 May 2017 05:40:04 GMT
#   Content-Type: text/plain; charset=UTF-8
#   Content-Length: 59469672
#   Cache-Control: max-age=14400
#   Expires: Fri, 19 May 2017 12:26:58 GMT
#   Vary: Accept-Encoding
#   Keep-Alive: timeout=300, max=100
#   Connection: Keep-Alive
# Length: 59469672 (57M) [text/plain]
# Remote file exists.
