#!/bin/bash

FILES=amsr2/*1024.png

echo 

for f in $FILES;do

  fgrey=${f/1024.png/1024.grey.png}

  convert $f -colorspace Gray $fgrey

  falpha=${fgrey/1024.grey.png/1024.grey.trans.png}

  ./color2alpha -ca "#000000" $fgrey $falpha

done

# convert my-image.jpg -colorspace Gray my-image-gray.jpg

# ./color2alpha -ca "#000000"  2017-05-30.polar.amsr2.top.1024.grey.png     2017-05-30.polar.amsr2.top.1024.grey.trans.png
# ./color2alpha -ca "#000000"  2017-05-30.polar.amsr2.bottom.1024.grey.png  2017-05-30.polar.amsr2.bottom.1024.grey.trans.png

# ## color2alpha [-ca alphacolor] [-cr replacecolor] [-a] [-g gain] 
# ## infile outfile
