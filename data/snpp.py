#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys

args = sys.argv[1:]

date    = args[0] or "2017-04-11"
size    = 2048
quality = 90
level   = 4
sat     = 'VIIRS_SNPP_CorrectedReflectance_TrueColor'
target  = './snpp'
xmlFile = 'GIBS_Globe_SNPP_tmp.xml'

xml = """<GDAL_WMS>
    <Service name="TMS">
    <ServerUrl>https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/%s/default/%s/250m/${z}/${y}/${x}.jpg</ServerUrl>
    </Service>
    <DataWindow>
        <UpperLeftX>-180.0</UpperLeftX>
        <UpperLeftY>90</UpperLeftY>
        <LowerRightX>396.0</LowerRightX>
        <LowerRightY>-198</LowerRightY>
        <TileLevel>%d</TileLevel>
        <TileCountX>2</TileCountX>
        <TileCountY>1</TileCountY>
        <YOrigin>top</YOrigin>
    </DataWindow>
    <Projection>EPSG:4326</Projection>
    <BlockSizeX>512</BlockSizeX>
    <BlockSizeY>512</BlockSizeY>
    <BandsCount>3</BandsCount>
    <ZeroBlockOnServerException>true</ZeroBlockOnServerException>
    <ZeroBlockHttpCodes>204,404,400</ZeroBlockHttpCodes>
</GDAL_WMS>""" % (sat, date, level)

file = open(xmlFile,'w')
file.write(xml)
file.close()


cmds = []

tasks = [
  ['top',     0,  90,  500],
  ['bottom',  0, -90,  500],
  ['right',  90,   0, 1000],
  ['left',  -90,   0, 1000],
  ['front',   0,   0, 1000],
  ['back', -180,   0, 1000]
]

task = """
  gdalwarp -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=%d -ts %d %d  
    -t_srs "+proj=gnom  +lon_0=%d  +lat_0=%s  +datum=WGS84 +units=degrees"   
    -te -6378137 -6378137 6378137 6378137                                    
    %s  globe.snpp.%s.%d.tif     
""" 

task = task.replace("\n", "")

for (face, lon, lat, extra) in tasks :

  cmd = task % (extra, size, size, lon, lat, xmlFile, face, size)
  cmds.append("echo %s" % face)
  cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "gdal_translate -of JPEG -co \"QUALITY=%d\" globe.snpp.%s.%d.tif globe.snpp.%s.%d.jpg" % (quality, face, size, face, size)
  cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "mv globe.snpp.%s.%d.jpg  %s/%s.globe.snpp.%s.%d.jpg" % (face, size, target, date, face, size)
  cmds.append(cmd)


## Cleanup
for (face, lon, lat, extra) in tasks :

  cmd = "rm globe.snpp.%s.%d.tif" % (face, size)
  cmds.append(cmd)
  cmd = "rm globe.snpp.%s.%d.jpg.aux.xml" % (face, size)
  cmds.append(cmd)

cmds.append("rm %s" % xmlFile)


for cmd in cmds :
    # print cmd
    os.system(cmd)

print "Done"
