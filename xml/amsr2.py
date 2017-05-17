#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys

args = sys.argv[1:]

date    = "2017-04-11"
size    = 1024
quality = 90
level   = 4
sat     = 'AMSR2_Sea_Ice_Concentration_12km'
target  = '../images/amsr2'
xmlFile = 'GIBS_Polar_AMSR2_tmp.xml'

# works
# https://gibs.earthdata.nasa.gov/wmts/epsg3413/best/AMSR2_Sea_Ice_Concentration_12km/default/2017-05-13/1km/0/0/0.png

xml = """<GDAL_WMS>
    <Service name="TMS">
    <ServerUrl>https://gibs.earthdata.nasa.gov/wmts/epsg3413/best/%s/default/%s/1km/${z}/${y}/${x}.png</ServerUrl>
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
    <Projection>EPSG:3413</Projection>
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
  # ['right',  90,   0, 1000],
  # ['left',  -90,   0, 1000],
  # ['front',   0,   0, 1000],
  # ['back', -180,   0, 1000]
]

task = """
  gdalwarp -overwrite -wo SAMPLE_GRID=YES  -wo SOURCE_EXTRA=%d -ts %d %d  
    -t_srs "+proj=gnom  +lon_0=%d  +lat_0=%s  +datum=WGS84 +units=degrees"   
    -te -6378137 -6378137 6378137 6378137                                    
    %s  polar.amsr2.%s.%d.tif     
""".replace("\n", "")

# task = task.replace("\n", "")

for (face, lon, lat, extra) in tasks :

  cmd = task % (extra, size, size, lon, lat, xmlFile, face, size)
  cmds.append("echo %s" % face)
  cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "gdal_translate -of PNG polar.amsr2.%s.%d.tif polar.amsr2.%s.%d.png" % (face, size, face, size)
  cmds.append(cmd)


for (face, lon, lat, extra) in tasks :

  cmd = "cp polar.amsr2.%s.%d.png  %s/polar.amsr2.%s.%d.png" % (face, size, target, face, size)
  cmds.append(cmd)


for cmd in cmds :
    # print cmd
    os.system(cmd)

print "Done"
