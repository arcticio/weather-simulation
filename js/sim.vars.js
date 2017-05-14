/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals  SIM, */

SIM.Vars = {

    tmp2m : {
        color: "#C24642",
        legend: "Temperature (2m, °C)",
        axis: "primary",
        letter: "T",
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: "Temperature, 2m",
        description: "2 m above ground temperature [k]",
        wiki: null
    },
    prmslmsl : {
        color: "#369EAD",
        legend: "Pressure (msl)",
        axis: "secondary",
        letter: "P",
        unit: "hpa",
        range: [950, 1050],
        adjust: function(d){return d/100;},
        name: "Sea Level Pressure",
        description: "mean sea level pressure reduced to msl [hpa]",
        wiki: null
    },
    apcpsfc : {
        color: "#76cee2",
        legend: "Precipitation (kg/m^2)",
        axis: "primary",
        letter: "PC",
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "surface total precipitation [kg/m^2]",
        wiki: null
    },
    gustsfc : {
        range: [0, 30],
        color: "#6cef6c",
        legend: "SFC wind speed (gust, m/s)",
        axis: "secondary",
        letter: "G",
        unit: "m/s",
        adjust: null,
        name: null,
        description: "surface wind speed (gust) [m/s] ",
        wiki: null
    },
    dlwrfsfc : {
        range: [0, 0.5, 1.0, 1.5],
        color: "#ffbb55",
        legend: "Long wave (down, kw/m^2)",
        axis: "primary",
        letter: "LW",
        unit: "kw/m^2",
        adjust: function(d){return d/1000;},
        name: null,
        description: "surface downward long-wave rad. flux [w/m^2]",
        wiki: null
    },
    dswrfsfc : {
        range: [0, 0.5, 1.0, 1.5],
        color: "#ce9be5",
        legend: "Short wave (down, kw/m^2)",
        axis: "secondary",
        letter: "SW",
        unit: "kw/m^2",
        adjust: function(d){return d/1000;},
        name: null,
        description: "surface downward short-wave rad. flux [w/m^2]",
        wiki: null
    },






    absvprs : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 7 5 3 2 1) absolute vorticity [1/s]",
        wiki: null
    },
    no4lftxsfc : {
        unit: "k",
        adjust: null,
        name: null,
        description: "surface best (4 layer) lifted index [k]",
        wiki: "http://en.wikipedia.org/wiki/Lifted_index"
    },
    no5wava500mb : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "500 mb 5-wave geopotential height anomaly [gpm]",
        wiki: null
    },
    no5wavh500mb : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "500 mb 5-wave geopotential height [gpm]",
        wiki: null
    },
    acpcpsfc : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "surface convective precipitation [kg/m^2]",
        wiki: null
    },
    albdosfc : {
        unit: "%",
        adjust: null,
        name: "Albedo",
        description: "surface albedo [%]",
        wiki: null
    },
    capesfc : {
        unit: "j/kg",
        adjust: null,
        name: null,
        description: "surface convective available potential energy [j/kg]",
        wiki: null
    },
    cape180_0mb : {
        unit: "j/kg",
        adjust: null,
        name: null,
        description: "180-0 mb above ground convective available potential energy [j/kg]",
        wiki: null
    },
    cduvbsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface clear sky uv-b downward solar flux [w/m^2]",
        wiki: null
    },
    cfrzrsfc : {
        unit: "non-dim",
        adjust: null,
        name: null,
        description: "surface categorical freezing rain (yes=1; no=0) [non-dim]",
        wiki: null
    },
    cicepsfc : {
        unit: "non-dim",
        adjust: null,
        name: null,
        description: "surface categorical ice pellets (yes=1; no=0) [non-dim]",
        wiki: null
    },
    cinsfc : {
        unit: "j/kg",
        adjust: null,
        name: null,
        description: "surface convective inhibition [j/kg]",
        wiki: "http://en.wikipedia.org/wiki/Convective_inhibition"
    },
    cin180_0mb : {
        unit: "j/kg",
        adjust: null,
        name: null,
        description: "180-0 mb above ground convective inhibition [j/kg]",
        wiki: "http://en.wikipedia.org/wiki/Convective_inhibition"
    },
    clwmrprs : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 200 175 150 125 100) cloud mixing ratio [kg/kg]",
        wiki: null
    },
    cnwatsfc : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "surface plant canopy surface water [kg/m^2]",
        wiki: null
    },
    cpratsfc : {
        unit: "kg/m^2/s",
        adjust: null,
        name: null,
        description: "surface convective precipitation rate [kg/m^2/s]",
        wiki: null
    },
    crainsfc : {
        unit: "non-dim",
        adjust: null,
        name: null,
        description: "surface categorical rain (yes=1; no=0) [non-dim]",
        wiki: null
    },
    csnowsfc : {
        unit: "non-dim",
        adjust: null,
        name: "Snow Cover",
        description: "surface categorical snow (yes=1; no=0) [non-dim]",
        wiki: null
    },
    cwatclm : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "entire atmosphere (considered as a single layer) cloud water [kg/m^2]",
        wiki: null
    },
    cworkclm : {
        unit: "j/kg",
        adjust: null,
        name: null,
        description: "entire atmosphere (considered as a single layer) cloud work function [j/kg]",
        wiki: null
    },
    duvbsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface uv-b downward solar flux [w/m^2]",
        wiki: null
    },
    fldcpsfc : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "surface field capacity [fraction]",
        wiki: null
    },
    gfluxsfc : {
        unit: "w/m^2",
        adjust: null,
        name: "Ground Flux",
        description: "surface ground heat flux [w/m^2]",
        wiki: null
    },
    gpa1000mb : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "1000 mb geopotential height anomaly [gpm]",
        wiki: null
    },
    gpa500mb : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "500 mb geopotential height anomaly [gpm]",
        wiki: null
    },
    hgtsfc : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "surface geopotential height [gpm]",
        wiki: null
    },
    hgtprs : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 7 5 3 2 1) geopotential height [gpm]",
        wiki: null
    },
    hgt2pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgtneg2pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgt0p5pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgtneg0p5pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgt1pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgtneg1pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgt1p5pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgtneg1p5pv : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface geopotential height [gpm]",
        wiki: null
    },
    hgttop0c : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "highest tropospheric freezing level geopotential height [gpm]",
        wiki: null
    },
    hgt0c : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "0c isotherm geopotential height [gpm]",
        wiki: null
    },
    hgtmwl : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "max wind geopotential height [gpm]",
        wiki: null
    },
    hgttrop : {
        unit: "gpm",
        adjust: null,
        name: null,
        description: "tropopause geopotential height [gpm]",
        wiki: "http://en.wikipedia.org/wiki/Tropopause"
    },
    hpblsfc : {
        unit: "m",
        adjust: null,
        name: null,
        description: "surface planetary boundary layer height [m]",
        wiki: "http://en.wikipedia.org/wiki/Planetary_boundary_layer"
    },
    icecsfc : {
        unit: "prop.",
        adjust: null,
        name: "Sea Ice",
        description: "surface ice cover [proportion]",
        wiki: null
    },
    icetksfc : {
        unit: "m",
        adjust: null,
        name: "Sea Ice Thickness",
        description: "surface ice thickness [m]",
        wiki: null
    },
    landsfc : {
        unit: "prop.",
        adjust: null,
        name: "Land/Sea",
        description: "surface land cover (1=land, 0=sea) [proportion]",
        wiki: null
    },
    lftxsfc : {
        unit: "k",
        adjust: null,
        name: null,
        description: "surface surface lifted index [k]",
        wiki: "http://en.wikipedia.org/wiki/Lifted_index"
    },
    lhtflsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface latent heat net flux [w/m^2]",
        wiki: null
    },
    o3mrprs : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "(100 70 50 30 20 10 7 5 3 2 1) ozone mixing ratio [kg/kg]",
        wiki: null
    },
    pevprsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface potential evaporation rate [w/m^2]",
        wiki: null
    },
    potsig995 : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "0.995 sigma level potential temperature [k]",
        wiki: null
    },
    pratesfc : {
        unit: "g/m^2/s",
        adjust: function(d){return d*1000;},
        name: null,
        description: "surface precipitation rate [g/m^2/s]",
        wiki: null
    },
    preslclb : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "low cloud bottom level pressure [hpa]",
        wiki: null
    },
    preslclt : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "low cloud top level pressure [hpa]",
        wiki: null
    },
    presmclb : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "middle cloud bottom level pressure [hpa]",
        wiki: null
    },
    presmclt : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "middle cloud top level pressure [hpa]",
        wiki: null
    },
    preshclb : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "high cloud bottom level pressure [hpa]",
        wiki: null
    },
    preshclt : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "high cloud top level pressure [hpa]",
        wiki: null
    },
    pressfc : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: "Surface Pressure",
        description: "surface pressure [hpa]",
        wiki: null
    },
    pres2pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    presneg2pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    pres0p5pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    presneg0p5pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    pres1pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    presneg1pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    pres1p5pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    presneg1p5pv : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface pressure [hpa]",
        wiki: null
    },
    prescclb : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "convective cloud bottom level pressure [hpa]",
        wiki: null
    },
    prescclt : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "convective cloud top level pressure [hpa]",
        wiki: null
    },
    presmwl : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "max wind pressure [hpa]",
        wiki: null
    },
    prestrop : {
        unit: "hpa",
        adjust: function(d){return d/100;},
        name: null,
        description: "tropopause pressure [hpa]",
        wiki: null
    },
    pwatclm : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "entire atmosphere (considered as a single layer) precipitable water [kg/m^2]",
        wiki: null
    },
    rhprs : {
        unit: "%",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 200 175 150 125 100) relative humidity [%]",
        wiki: null
    },
    rh2m : {
        unit: "%",
        adjust: null,
        name: "Humidity, 2m",
        description: "2 m above ground relative humidity [%]",
        wiki: null
    },
    rhsg330_1000 : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0.33-1 sigma layer relative humidity [%]",
        wiki: null
    },
    rhsg440_1000 : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0.44-1 sigma layer relative humidity [%]",
        wiki: null
    },
    rhsg720_940 : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0.72-0.94 sigma layer relative humidity [%]",
        wiki: null
    },
    rhsg440_720 : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0.44-0.72 sigma layer relative humidity [%]",
        wiki: null
    },
    rhsig995 : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0.995 sigma level relative humidity [%]",
        wiki: null
    },
    rh30_0mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "30-0 mb above ground relative humidity [%]",
        wiki: null
    },
    rh60_30mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "60-30 mb above ground relative humidity [%]",
        wiki: null
    },
    rh90_60mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "90-60 mb above ground relative humidity [%]",
        wiki: null
    },
    rh120_90mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "120-90 mb above ground relative humidity [%]",
        wiki: null
    },
    rh150_120mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "150-120 mb above ground relative humidity [%]",
        wiki: null
    },
    rh180_150mb : {
        unit: "%",
        adjust: null,
        name: null,
        description: "180-150 mb above ground relative humidity [%]",
        wiki: null
    },
    rhclm : {
        unit: "%",
        adjust: null,
        name: "Humidity, Atmosphere",
        description: "entire atmosphere (considered as a single layer) relative humidity [%]",
        wiki: null
    },
    rhtop0c : {
        unit: "%",
        adjust: null,
        name: null,
        description: "highest tropospheric freezing level relative humidity [%]",
        wiki: null
    },
    rh0c : {
        unit: "%",
        adjust: null,
        name: null,
        description: "0c isotherm relative humidity [%]",
        wiki: null
    },
    shtflsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface sensible heat net flux [w/m^2]",
        wiki: null
    },
    snodsfc : {
        unit: "m",
        adjust: null,
        name: "Snow Depth",
        description: "surface snow depth [m]",
        wiki: null
    },
    soill0_10cm : {
        unit: "prop.",
        adjust: null,
        name: null,
        description: "0-0.1 m below ground liquid volumetric soil moisture (non frozen) [proportion]",
        wiki: null
    },
    soill10_40cm : {
        unit: "prop.",
        adjust: null,
        name: null,
        description: "0.1-0.4 m below ground liquid volumetric soil moisture (non frozen) [proportion]",
        wiki: null
    },
    soill40_100cm : {
        unit: "prop.",
        adjust: null,
        name: null,
        description: "0.4-1 m below ground liquid volumetric soil moisture (non frozen) [proportion]",
        wiki: null
    },
    soill100_200cm : {
        unit: "prop.",
        adjust: null,
        name: null,
        description: "1-2 m below ground liquid volumetric soil moisture (non frozen) [proportion]",
        wiki: null
    },
    soilw0_10cm : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "0-0.1 m below ground volumetric soil moisture content [fraction]",
        wiki: null
    },
    soilw10_40cm : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "0.1-0.4 m below ground volumetric soil moisture content [fraction]",
        wiki: null
    },
    soilw40_100cm : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "0.4-1 m below ground volumetric soil moisture content [fraction]",
        wiki: null
    },
    soilw100_200cm : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "1-2 m below ground volumetric soil moisture content [fraction]",
        wiki: null
    },
    spfhprs : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 200 175 150 125 100) specific humidity [kg/kg]",
        wiki: null
    },
    spfh2m : {
        unit: "g/kg",
        adjust: function(d){return d*1000;},
        name: null,
        description: "2 m above ground specific humidity [g/kg]",
        wiki: null
    },
    spfh30_0mb : {
        unit: "g/kg",
        adjust: function(d){return d*1000;},
        name: null,
        description: "30-0 mb above ground specific humidity [g/kg]",
        wiki: null
    },
    spfh60_30mb : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "60-30 mb above ground specific humidity [kg/kg]",
        wiki: null
    },
    spfh90_60mb : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "90-60 mb above ground specific humidity [kg/kg]",
        wiki: null
    },
    spfh120_90mb : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "120-90 mb above ground specific humidity [kg/kg]",
        wiki: null
    },
    spfh150_120mb : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "150-120 mb above ground specific humidity [kg/kg]",
        wiki: null
    },
    spfh180_150mb : {
        unit: "kg/kg",
        adjust: null,
        name: null,
        description: "180-150 mb above ground specific humidity [kg/kg]",
        wiki: null
    },
    tcdcclm : {
        unit: "%",
        adjust: null,
        name: "Cloud Cover",
        description: "entire atmosphere (considered as a single layer) total cloud cover [%]",
        wiki: null
    },
    tcdcblcll : {
        unit: "%",
        adjust: null,
        name: null,
        description: "boundary layer cloud layer total cloud cover [%]",
        wiki: null
    },
    tcdclcll : {
        unit: "%",
        adjust: null,
        name: null,
        description: "low cloud layer total cloud cover [%]",
        wiki: null
    },
    tcdcmcll : {
        unit: "%",
        adjust: null,
        name: null,
        description: "middle cloud layer total cloud cover [%]",
        wiki: null
    },
    tcdchcll : {
        unit: "%",
        adjust: null,
        name: null,
        description: "high cloud layer total cloud cover [%]",
        wiki: null
    },
    tcdcccll : {
        unit: "%",
        adjust: null,
        name: null,
        description: "convective cloud layer total cloud cover [%]",
        wiki: null
    },
    tmax2m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: "Temperature, max, 2m",
        description: "2 m above ground maximum temperature [k]",
        wiki: null
    },
    tmin2m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: "Temperature, min, 2m",
        description: "2 m above ground minimum temperature [k]",
        wiki: null
    },
    tmplclt : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "low cloud top level temperature [k]",
        wiki: null
    },
    tmpmclt : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "middle cloud top level temperature [k]",
        wiki: null
    },
    tmphclt : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "high cloud top level temperature [k]",
        wiki: null
    },
    tmpsfc : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: "Surface Temperature",
        description: "surface temperature [k]",
        wiki: null
    },
    tmpprs : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "(1000 975 950 925 900.. 7 5 3 2 1) temperature [k]",
        wiki: null
    },
    tmp_1829m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "1829 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_2743m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "2743 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_3658m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "3658 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_305m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "305 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_457m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "457 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_610m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "610 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_914m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "914 m above mean sea level temperature [k]",
        wiki: null
    },
    tmp_4572m : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "4572 m above mean sea level temperature [k]",
        wiki: null
    },
    tmpsig995 : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "0.995 sigma level temperature [k]",
        wiki: null
    },
    tmp0_10cm : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "0-0.1 m below ground temperature [k]",
        wiki: null
    },
    tmp10_40cm : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "0.1-0.4 m below ground temperature [k]",
        wiki: null
    },
    tmp40_100cm : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "0.4-1 m below ground temperature [k]",
        wiki: null
    },
    tmp100_200cm : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "1-2 m below ground temperature [k]",
        wiki: null
    },
    tmp30_0mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "30-0 mb above ground temperature [k]",
        wiki: null
    },
    tmp60_30mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "60-30 mb above ground temperature [k]",
        wiki: null
    },
    tmp90_60mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "90-60 mb above ground temperature [k]",
        wiki: null
    },
    tmp120_90mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "120-90 mb above ground temperature [k]",
        wiki: null
    },
    tmp150_120mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "150-120 mb above ground temperature [k]",
        wiki: null
    },
    tmp180_150mb : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "180-150 mb above ground temperature [k]",
        wiki: null
    },
    tmp2pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmpneg2pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmp0p5pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmpneg0p5pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmp1pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmpneg1pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmp1p5pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmpneg1p5pv : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface temperature [k]",
        wiki: null
    },
    tmpmwl : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "max wind temperature [k]",
        wiki: null
    },
    tmptrop : {
        unit: "C",
        adjust: function(d){return d-273.15;},
        name: null,
        description: "tropopause temperature [k]",
        wiki: null
    },
    tozneclm : {
        unit: "dobson",
        adjust: null,
        name: "Ozone, Atmosphere",
        description: "entire atmosphere (considered as a single layer) total ozone [dobson]",
        wiki: null
    },
    ugwdsfc : {
        unit: "n/m^2",
        adjust: null,
        name: null,
        description: "surface zonal flux of gravity wave stress [n/m^2]",
        wiki: "http://en.wikipedia.org/wiki/Gravity_wave"
    },
    vgwdsfc : {
        unit: "n/m^2",
        adjust: null,
        name: null,
        description: "surface meridional flux of gravity wave stress [n/m^2]",
        wiki: "http://en.wikipedia.org/wiki/Gravity_wave"
    },
    uflxsfc : {
        unit: "n/m^2",
        adjust: null,
        name: null,
        description: "surface momentum flux, u-component [n/m^2]",
        wiki: "http://glossary.ametsoc.org/wiki/Momentum_flux"
    },
    vflxsfc : {
        unit: "n/m^2",
        adjust: null,
        name: null,
        description: "surface momentum flux, v-component [n/m^2]",
        wiki: "http://glossary.ametsoc.org/wiki/Momentum_flux"
    },        
    ugrdprs : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 7 5 3 2 1) u-component of wind [m/s]",
        wiki: null
    },
    ugrd_1829m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "1829 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_2743m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "2743 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_3658m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "3658 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_305m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "305 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_457m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "457 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_610m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "610 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_914m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "914 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd_4572m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "4572 m above mean sea level u-component of wind [m/s]",
        wiki: null
    },
    ugrd10m : {
        unit: "m/s",
        adjust: null,
        name: "Wind, 10m, U",
        description: "10 m above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrdsig995 : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "0.995 sigma level u-component of wind [m/s]",
        wiki: null
    },
    ugrd30_0mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "30-0 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd60_30mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "60-30 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd90_60mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "90-60 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd120_90mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "120-90 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd150_120mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "150-120 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd180_150mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "180-150 mb above ground u-component of wind [m/s]",
        wiki: null
    },
    ugrd2pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrdneg2pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrd0p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrdneg0p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrd1pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrdneg1pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrd1p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrdneg1p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface u-component of wind [m/s]",
        wiki: null
    },
    ugrdmwl : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "max wind u-component of wind [m/s]",
        wiki: null
    },
    ugrdtrop : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "tropopause u-component of wind [m/s]",
        wiki: null
    },
    ulwrfsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface upward long-wave rad. flux [w/m^2]",
        wiki: null
    },
    ulwrftoa : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "top of atmosphere upward long-wave rad. flux [w/m^2]",
        wiki: null
    },
    uswrfsfc : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "surface upward short-wave rad. flux [w/m^2]",
        wiki: null
    },
    uswrftoa : {
        unit: "w/m^2",
        adjust: null,
        name: null,
        description: "top of atmosphere upward short-wave rad. flux [w/m^2]",
        wiki: null
    },
    vgrdprs : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 7 5 3 2 1) v-component of wind [m/s]",
        wiki: null
    },
    vgrd_1829m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "1829 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_2743m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "2743 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_3658m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "3658 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_305m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "305 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_457m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "457 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_610m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "610 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_914m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "914 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd_4572m : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "4572 m above mean sea level v-component of wind [m/s]",
        wiki: null
    },
    vgrd10m : {
        unit: "m/s",
        adjust: null,
        name: "Wind, 10m, V",
        description: "10 m above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrdsig995 : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "0.995 sigma level v-component of wind [m/s]",
        wiki: null
    },
    vgrd30_0mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "30-0 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd60_30mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "60-30 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd90_60mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "90-60 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd120_90mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "120-90 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd150_120mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "150-120 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd180_150mb : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "180-150 mb above ground v-component of wind [m/s]",
        wiki: null
    },
    vgrd2pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrdneg2pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrd0p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrdneg0p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrd1pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrdneg1pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrd1p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrdneg1p5pv : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface v-component of wind [m/s]",
        wiki: null
    },
    vgrdmwl : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "max wind v-component of wind [m/s]",
        wiki: null
    },
    vgrdtrop : {
        unit: "m/s",
        adjust: null,
        name: null,
        description: "tropopause v-component of wind [m/s]",
        wiki: null
    },
    vvelprs : {
        unit: "pa/s",
        adjust: null,
        name: null,
        description: "(1000 975 950 925 900.. 200 175 150 125 100) vertical velocity (pressure) [pa/s]",
        wiki: null
    },
    vvelsig995 : {
        unit: "pa/s",
        adjust: null,
        name: null,
        description: "0.995 sigma level vertical velocity (pressure) [pa/s]",
        wiki: null
    },
    vwsh2pv : {
        unit: "10" + String.fromCharCode(8315) + String.fromCharCode(179) + "/s",
        adjust: function(d){return d*1000;},
        name: null,
        description: "pv=2e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwshneg2pv : {
        unit: "10" + String.fromCharCode(8315) + String.fromCharCode(179) + "/s",
        adjust: function(d){return d*1000;},
        name: null,
        description: "pv=-2e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwsh0p5pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=5e-07 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwshneg0p5pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=-5e-07 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwsh1pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=1e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwshneg1pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=-1e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwsh1p5pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=1.5e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwshneg1p5pv : {
        unit: "1/s",
        adjust: null,
        name: null,
        description: "pv=-1.5e-06 (km^2/kg/s) surface vertical speed sheer [1/s]",
        wiki: null
    },
    vwshtrop : {
        unit: "10" + String.fromCharCode(8315) + String.fromCharCode(179) + "/s",
        adjust: function(d){return d*1000;},
        name: null,
        description: "tropopause vertical speed sheer [1/s]",
        wiki: null
    },
    watrsfc : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "surface water runoff [kg/m^2]",
        wiki: null
    },
    weasdsfc : {
        unit: "kg/m^2",
        adjust: null,
        name: null,
        description: "surface water equivalent of accumulated snow depth [kg/m^2]",
        wiki: null
    },
    wiltsfc : {
        unit: "fraction",
        adjust: null,
        name: null,
        description: "surface wilting point [fraction]",
        wiki: null
    }
};

