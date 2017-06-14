#!/usr/bin/env python
# -*- coding: utf-8 -*-

# http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20160324/gfs_0p50_00z.ascii?tmp2m[0:1:0][125:1:180][0:1:359]
## 14 Days rotating, 0.5°, 0,5 days icec, vgrd10m, vgrd10m, tmp2m

import sys; sys.dont_write_bytecode = True

from datetime import datetime, timedelta


class GFS025DegRecent(object) :

## http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170529/gfs_0p50_18z.ascii?vgrdprs[2:2][28:28][0:4:360][0:4:719]

    lats  = "[%s:%s:%s]" % (0,2,360)
    lons  = "[%s:%s:%s]" % (0,2,719)

    home  = "http://nomads.ncep.noaa.gov:9090/dods/"
    pattern = home + "gfs_0p25/gfs%Y%m%d/gfs_0p25_00z.ascii?"

    def makeUrl(self, vari, steps, day, lvls="") :

        if steps == 1 : tstep = "1"
        if steps == 4 : tstep = "2"
        if steps == 8 : tstep = "1"

        now   = datetime.utcnow()
        today = datetime(now.year, now.month, now.day)

        ## print "makeUrl", (day - today).days

        ## calc whether analysis or forecast
        if day > today :
            diff  = (day - today).days * 8
            tims  = "[%s:%s:%s]" % (diff, tstep, diff +7)
            return today.strftime(self.pattern) + vari + tims + lvls + self.lats + self.lons
        else  :
            tims  = "[0:%s:7]" % tstep
            return day.strftime(self.pattern) + vari + tims + lvls + self.lats + self.lons

    def calcUrlTime(self, day) :

        ## no forecast in 1°
        return day.strftime("%Y%m%d")


# Longitude: (720 points, avg. res. 0.5°)
# Latitude:  (361 points, avg. res. 0.5°)
# Altitude:   (47 points, avg. res. 21.717)
# Time:       (81 points, avg. res. 0.125 days) 

class GFS05DegRecent(object) :

    ## read time back : (datetime(1, 1, 1) + timedelta(days=736495.5 -2)).strftime("%Y-%m-%d %H")

    lats  = "[%s:%s:%s]" % (0,2,360)
    lons  = "[%s:%s:%s]" % (0,2,719)

    # lats = "[0:0]"
    # lons = "[0:0]"

    home  = "http://nomads.ncep.noaa.gov:9090/dods/"
    pattern = home + "gfs_0p50/gfs%Y%m%d/gfs_0p50_00z.ascii?"  ## ALWAYS 00z

    def makeUrl(self, vari, steps, day, lvls="") :

        now   = datetime.utcnow()
        today = datetime(now.year, now.month, now.day)

        if day > today :
            diff  = (day - today).days * 8
            tims  = "[%s:%s]" % (diff + day.hour/3, diff + day.hour/3)

            return today.strftime(self.pattern) + vari + tims + lvls + self.lats + self.lons
            # return today.strftime("%Y-%m-%d") + " - " + tims

        else  :

            if day.hour == 0    :
                day  = day - timedelta(hours=6)
                tims = "[8:8]"
            elif day.hour == 6  :
                tims = "[2:2]"
            elif day.hour == 12 :
                tims = "[4:4]"
            elif day.hour == 18 :
                tims = "[6:6]"

            return day.strftime(self.pattern) + vari + tims + lvls + self.lats + self.lons
            # return day.strftime("%Y-%m-%d") + " - " + tims

    def calcUrlTime(self, day) :

        ## no forecast in 1°
        return day.strftime("%Y%m%d")




# http://nomads.ncdc.noaa.gov/dods/NCEP_GFS/201508/20150818/gfs_3_20150818_0000_fff.ascii?tmp2m[0:1:7][125:1:180][0:1:359]
## 1 year rotating, 1°, icec, vgrd10m, vgrd10m, tmp2m
## has holes !!!

class GFS1DegYear(object) :

    lats  = "[%s:%s:%s]" % (125,1,180)
    lons  = "[%s:%s:%s]" % (0,1,359)
    home  = "http://nomads.ncdc.noaa.gov/dods/NCEP_GFS/"
    pattern = home + "%Y%m/%Y%m%d/gfs_3_%Y%m%d_0000_fff.ascii?"

    def makeUrl(self, vari, steps, day) :

        if steps == 1 : tims = "[0:1:0]"
        if steps == 4 : tims = "[0:2:7]"
        if steps == 8 : tims = "[0:1:7]"

        return day.strftime(self.pattern) + vari + tims + self.lats + self.lons

    def calcUrlTime(self, day) :
        return day.strftime("%Y%m%d")



# http://nomads.ncdc.noaa.gov/dods/NCEP_GFS_ANALYSIS/analysis_complete.info
## 00Z01MAR2004 to 18Z19OCT2015 (17000 points, avg. res. 0.25 days)

class GFS1DegLong(object) :

    lats  = "[%s:%s:%s]" % (125,1,180)
    lons  = "[%s:%s:%s]" % (0,1,359)
    # lats  = "[%s:%s:%s]" % (178,1,180)
    # lons  = "[%s:%s:%s]" % (357,1,359)
    home  = "http://nomads.ncdc.noaa.gov/dods/NCEP_GFS_ANALYSIS/analysis_complete"
    pattern = home + ".ascii?"

    def makeUrl(self, vari, steps, day) :

        start = datetime(2004, 3, 1)
        diff  = (day - start).days * 4

        if steps == 1 : tims = "[%s:%s:%s]" % (diff, 1, diff)
        if steps == 4 : tims = "[%s:%s:%s]" % (diff, 1, diff + 3)

        return day.strftime(self.pattern) + vari + tims + self.lats + self.lons

    def calcUrlTime(self, day) :
        return day.strftime("%Y%m%d")


