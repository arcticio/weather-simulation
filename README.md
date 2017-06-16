# weather-simulation
Renders current weather parameters onto a 3D sphere

## Demo

  * https://arcticio.github.io/weather-simulation/

## Credits
  
  * https://github.com/spite/codevember-2016
  * https://github.com/qkevinto/planetarium/blob/master/app/js/app.js


## Inspiration

  * [IBreakDownShaders](http://ibreakdownshaders.blogspot.de/2015/03/noise-loudening.html)
  * [How We Animated Trillions of Tons of Flowing Ice](http://dwtkns.com/posts/2017-06-13-flowing-ice.html)
  * [How We Made “Rewind the Red Planet”](https://source.opennews.org/articles/how-we-made-rewind-red-planet/)
  * []()


## Data Sources (+ planned)
  
  * [Greenland and Antarctic ice sheet topography](https://doi.pangaea.de/10.1594/PANGAEA.856844)
  * [Global Forecast System (GFS), wind10m, tmp2m, jetstream](https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/global-forcast-system-gfs)
  * [Global Imagery Browse Services, GIBS (sea ice conc., sea surface temperature)](https://earthdata.nasa.gov/about/science-system-description/eosdis-components/global-imagery-browse-services-gibs)
  * [Cryosat Antartic DEM](http://www.cpom.ucl.ac.uk/csopr/icesheets2/)
  * [UNI Bremen, AMSR2, SIC](https://seaice.uni-bremen.de/sea-ice-concentration/)
  * [Polar Science Center, PIOMAS, SIT](http://psc.apl.uw.edu/research/projects/arctic-sea-ice-volume-anomaly/)
  * [Antarctica Ice Velocity Map](https://nsidc.org/data/docs/measures/nsidc0484_rignot/)
  * [Greenland Ice Sheet Velocity Map](http://nsidc.org/data/docs/measures/nsidc0478_joughin/)

## Current Shots
![Screenshot](https://github.com/arcticio/weather-simulation/raw/master/images/screenshots/2017-06-14-21-11-30.png)

Jetstreams at 300hpa.

![Screenshot](https://github.com/arcticio/weather-simulation/raw/master/images/screenshots/2017-06-16-14-23-06.png)

Antarctica's complex topology + sea ice.

## Unplanned Views

## Purpose

  There is a myriad of weather and climate data with the physical parameters needed to describe this planet now, in the past and in the near or far future. Only a subset is actually useful for the general public. Temperature at 2 meters, wind at 10 meters, sea surface level are useful examples helping to plan ahead. An astonishing amount of these data sets are in the public domain or otherwise available without a commercial handshake. 

  But this project is not not meant to replicate existing visualizations, instead it targets delivering a deeper understanding of processes forming weather and ultimately climate. It's the challenge of combining datasets to new mash-ups without overwhelming the user. A 3D interface does not only add a dimension - it creates deepness in a world where information is mostly as flat as the screenes.

  The vastness of Antartica's ice sheet is not common knowledge. Mostly due to the mathematical awkwardness of cutting a sphere around the poles cartographers appreciate maps without the latter. That's how the regions dispapeared from the global hive. 

  So, what are the essential datasets giving you an advantage? Actually it depends on your intents. Do you want to harvest some extra kilo  watt of your solar energy installation or is it just the umbrellla or not question? 

## 