#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys

args = sys.argv[1:]

date    = "2017-05-13"
size    = 1024
quality = 90
level   = 4
sat     = 'GHRSST_L4_MUR_Sea_Surface_Temperature'
target  = '../images/sst'
xmlFile = 'GIBS_Globe_SST_tmp.xml'

# works
# https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/2017-05-13/1km/0/0/0.png

xml = """<GDAL_WMS>
    <Service name="TMS">
    <ServerUrl>https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/%s/default/%s/1km/${z}/${y}/${x}.png</ServerUrl>
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
    <BandsCount>4</BandsCount>
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
    %s  globe.sst.%s.%d.tif     
""".replace("\n", "")

for (face, lon, lat, extra) in tasks :

  cmd = task % (extra, size, size, lon, lat, xmlFile, face, size)
  # cmds.append("echo %s" % face)
  # cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "gdal_translate -of PNG globe.sst.%s.%d.tif globe.sst.%s.%d.png" % (face, size, face, size)
  cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "cp globe.sst.%s.%d.png  %s/globe.sst.%s.%d.png" % (face, size, target, face, size)
  cmds.append(cmd)


for cmd in cmds :
    # print cmd
    os.system(cmd)

print "Done"
