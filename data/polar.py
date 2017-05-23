#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, time

args = sys.argv[1:]

date    = args[0] or "2017-04-11"
size    = 1024
quality = 90
level   = 4
sat     = 'AMSR2_Sea_Ice_Concentration_12km'
target  = '../images/seaice'
xmlFileTemplate = 'GIBS_Polar_AMSR2_%s_tmp.xml'

# works
# https://gibs.earthdata.nasa.gov/wmts/epsg3413/best/AMSR2_Sea_Ice_Concentration_12km/default/2017-05-13/1km/0/0/0.png
# http://www.gdal.org/gdalwarp.html

xmlTemplate = """<GDAL_WMS>
    <Service name="TMS">
    <ServerUrl>https://gibs.earthdata.nasa.gov/wmts/epsg%d/best/%s/default/%s/1km/${z}/${y}/${x}.png</ServerUrl>
    </Service>
    <DataWindow>
        <UpperLeftX>-4194304</UpperLeftX>
        <UpperLeftY>4194304</UpperLeftY>
        <LowerRightX>4194304</LowerRightX>
        <LowerRightY>-4194304</LowerRightY>
        <TileLevel>%d</TileLevel>
        <TileCountX>2</TileCountX>
        <TileCountY>2</TileCountY>
        <YOrigin>top</YOrigin>
    </DataWindow>
    <Projection>EPSG:%d</Projection>
    <BlockSizeX>512</BlockSizeX>
    <BlockSizeY>512</BlockSizeY>
    <BandsCount>4</BandsCount>
    <ZeroBlockOnServerException>true</ZeroBlockOnServerException>
    <ZeroBlockHttpCodes>204,404,400</ZeroBlockHttpCodes>
</GDAL_WMS>""" 

## % (epsg, sat, date, level, epsg)

# file = open(xmlFile,'w')
# file.write(xml)
# file.close()

def writeXML (face, lon, lat, extra, epsg) :

  filename = xmlFileTemplate % face

  xml = xmlTemplate % (epsg, sat, date, level, epsg)
  file = open(filename, 'w')
  file.write(xml)
  file.close()
  time.sleep(1)

  return filename


######## START #############

cmds = []

tasks = [
  ['top',     0,  90,  500, 3413],
  ['bottom',  0, -90,  500, 3031],
]

task = """
  gdalwarp -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=%d -ts %d %d  
    -t_srs "+proj=gnom  +lon_0=%d  +lat_0=%s  +datum=WGS84 +units=degrees"   
    -te -6378137 -6378137 6378137 6378137                                    
    %s  polar.amsr2.%s.%d.tif     
""".replace("\n", "")

for (face, lon, lat, extra, epsg) in tasks :

  xmlFile = writeXML (face, lon, lat, extra, epsg)
  cmd = task % (extra, size, size, lon, lat, xmlFile, face, size)
  cmds.append("echo %s" % face)
  cmds.append(cmd)


for (face, lon, lat, extra, epsg) in tasks :

  cmd = "gdal_translate -of PNG polar.amsr2.%s.%d.tif polar.amsr2.%s.%d.png" % (face, size, face, size)
  cmds.append(cmd)


for (face, lon, lat, extra, epsg) in tasks :

  cmd = "cp polar.amsr2.%s.%d.png  %s/polar.amsr2.%s.%d.png" % (face, size, target, face, size)
  cmds.append(cmd)


## Cleanup
for (face, lon, lat, extra) in tasks :

  cmd = "rm polar.amsr2.%s.%d.tif" % (face, size)
  cmds.append(cmd)
  cmd = "rm polar.amsr2.%s.%d.png.aux.xml" % (face, size)
  cmds.append(cmd)

cmds.append("rm %s" % xmlFile)


for cmd in cmds :
    # print cmd
    os.system(cmd)

print "Done"
