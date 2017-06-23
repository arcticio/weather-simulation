# convert globe.data.back.2048.png    -grayscale rec601luma -dither None -colors 8 -depth 8 globe.data.back.2048.comp.png


convert globe.rtopo2.back.4096.png    -scale 12.5%      globe.rtopo2.back.512.png
convert globe.rtopo2.bottom.4096.png    -scale 12.5%    globe.rtopo2.bottom.512.png
convert globe.rtopo2.front.4096.png     -scale 12.5%    globe.rtopo2.front.512.png
convert globe.rtopo2.left.4096.png    -scale 12.5%      globe.rtopo2.left.512.png
convert globe.rtopo2.right.4096.png     -scale 12.5%    globe.rtopo2.right.512.png
convert globe.rtopo2.top.4096.png     -scale 12.5%      globe.rtopo2.top.512.png
