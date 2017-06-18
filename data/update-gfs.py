#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# ftp://ftp-projects.zmaw.de/seaice/AMSR2/3.125km/Arc_%Y%m%d_res3.125_pyres.nc"
# 2013-01-01 -> 2013-03 ~ 06:00 - 10:00
#

## http://stackoverflow.com/questions/19602931/basic-http-file-downloading-and-saving-to-disk-in-python
## http://matplotlib.org/basemap/api/basemap_api.html
## https://en.wikipedia.org/wiki/Bilinear_interpolation#Unit_Square
## http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20160308/gfs_0p50_00z.ascii?ugrd10m[0:2:56][250:1:360][0:1:719]
## http://scipy-cookbook.readthedocs.org/_images/colormaps3.png
## http://www.2ality.com/2015/10/concatenating-typed-arrays.html
## http://stackoverflow.com/questions/25826500/python-eval-function-with-numpy-arrays-via-string-input-with-dictionaries
## https://github.com/pydata/numexpr/wiki/Numexpr-Users-Guide

VERSION = 0.5

import sys; sys.dont_write_bytecode = True

from datetime import datetime, timedelta
t0  = datetime.utcnow()
now = datetime.utcnow()

print
print "========== simulation.py: V:%s - %s" % (VERSION, t0)

import os, sys, re, urllib2

from gfsmodels import GFS025DegRecent, GFS05DegRecent

pathhome    = os.getcwd() + "/" ## os.path.dirname(os.path.abspath(__file__)) + "/"
pathdata    = "/home/noiv/Octets/Projects/weather-simulation/data/gfs/"
overwrite   = True
noindicator = True
checklast   = 1

def log(car="", cdr="") :
    first = ("            " + str(car) + ": ")[-12:]
    if car == "retr" :
        sys.stdout.write("\r" + first + " " + cdr) ## no comma tricks here
        sys.stdout.flush()
    else :
        print first, str(cdr)

log()
log("home", pathhome)
log("data", pathdata)
log("host", os.uname()[:3])
log("python", sys.version_info[:])
log()


if len(sys.argv) == 1 :
    date1 = datetime.utcnow() - timedelta(days=1)
    date2 = datetime.utcnow() + timedelta(days=7)
elif len(sys.argv) == 2 :
    date1 = datetime.strptime(sys.argv[1], "%Y-%m-%d")
    date2 = date1 + timedelta(days=1)
elif len(sys.argv) == 3 :
    date1 = datetime.strptime(sys.argv[1], "%Y-%m-%d")
    date2 = datetime.strptime(sys.argv[2], "%Y-%m-%d") + timedelta(days=1)

date1 = date1.replace(minute=0, hour=0, second=0, microsecond=0)
date2 = date2.replace(minute=0, hour=0, second=0, microsecond=0)

log("date1", date1)
log("date2", date2)

jobs = [
    {"vari": "ugrdprs",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": "[28:28]"},
    {"vari": "vgrdprs",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": "[28:28]"},
    {"vari": "ugrd10m",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
    {"vari": "vgrd10m",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
    {"vari": "tmp2m",    "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
    {"vari": "tcdcclm",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
    {"vari": "snodsfc",  "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
    {"vari": "pratesfc", "svr": GFS05DegRecent, "file": "DATE.VARI.RES.dods", "lvls": ""},
]

## http://nomads.ncep.noaa.gov:9090/dods/gfs_0p50/gfs20170529/gfs_0p50_18z.ascii?vgrdprs[2:2][28:28][0:4:360][0:4:719]

def runJobs(jobs) :

    now    = datetime.utcnow()
    dates  = [date1 + timedelta(hours=x * 6) for x in range(0, (date2 - date1).days * 4)]
    datum1 = dates[0].strftime("%Y-%m-%d %H:%M")
    datum2 = dates[-1].strftime("%Y-%m-%d %H:%M")

    log("start", now.strftime("%H:%M:%S %H") + ", " + datum1 + " -> " + datum2)

    for jobdict in jobs : 

        job  = type("job", (object,), jobdict)
        dods = job.svr()

        log()

        for day in dates :

            datum    = day.strftime("%Y-%m-%d %H")
            filename = job.file.replace("DATE", day.strftime("%Y-%m-%d-%H"))
            filename = filename.replace("VARI", job.vari)
            filename = filename.replace("RES", "10")
            pathfile = pathdata + job.vari + "/" + filename
            timline  = -8 if job.lvls else -6
            url      = dods.makeUrl(job.vari, 4, day, job.lvls)

            log()
            log("datum", datum + " - " + job.vari)
            log("url", url)

            data      = urllib2.urlopen(url).read()
            lines     = data.split("\n")
            testdatum = float(lines[timline])
            log("tim", (datetime(1, 1, 1) + timedelta(days=testdatum -2)).strftime("%Y-%m-%d %H"))

            file = open(pathfile, 'w')
            file.write(data)
            file.close()

            log("file", pathfile)
            log("size", os.stat(pathfile).st_size)

runJobs(jobs)

print "========== update-gfs.py: %s" % str(datetime.utcnow() -t0)
print