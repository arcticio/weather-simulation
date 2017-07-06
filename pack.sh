#!/bin/bash

: << '--COMMENT--'

  Documentaion
    https://lethain.com/deployment-scripts-with-beautifulsoup/

  Dependencies
    sudo apt-get install tree
    sudo pip install --upgrade beautifulsoup4
    sudo pip install --upgrade html5lib

--COMMENT--

set -e

pyPack="

import sys
from bs4 import BeautifulSoup

task = sys.argv[1]

html = open('index.html', 'r')
soup = BeautifulSoup(html.read(), 'lxml')
html.close()

filePack = open('dist/%s.pack.js' % task, 'w')

tags = soup.findAll('script')

print 'task = %s' % task

for tag in tags :
    if tag.has_attr('src') :
        if tag['src'].startswith('%s/' % task) :
            print '  ' + tag['src']
            fileSource = open(tag['src'],'r')
            filePack.write(fileSource.read())
            fileSource.close()

filePack.close()

"

pathRoot="/media/noiv/OS/Octets/Projects/weather-simulation"
pathDist="${pathRoot}/dist"
compiler="${pathRoot}/compiler/compiler.jar"

cd $pathRoot
echo 
echo "-- Start - Hypatia --"
echo 


echo "packing"
echo "  deleting old"

cd $pathDist

    rm  -f ./libs.pack.js
    rm  -f ./libs.pack.min.js
    rm  -f ./js.pack.js
    rm  -f ./js.pack.min.js

echo
cd $pathRoot
    python -c "$pyPack" libs
    python -c "$pyPack" js

echo 
echo compressing libs ...
cd $pathDist

    java -jar                                      \
        ../compiler/closure-compiler-v20170626.jar \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                libs.pack.js           \
        --js_output_file    libs.pack.min.js

echo compressing js ...
    java -jar                                      \
        ../compiler/closure-compiler-v20170626.jar \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                js.pack.js             \
        --js_output_file    js.pack.min.js

echo clean up
cd $pathDist
rm  -f \
    /dist/.fuse*        \
    /dist/*.pack.js          

echo done
echo