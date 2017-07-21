#!/bin/bash

: << '--COMMENT--'

  Documentation
    https://lethain.com/deployment-scripts-with-beautifulsoup/

  Dependencies
    java 
    sudo apt-get install tree
    sudo pip install --upgrade beautifulsoup4
    sudo pip install --upgrade html5lib

--COMMENT--

pyPack="

## works in root

import sys
from bs4 import BeautifulSoup, Tag

task = sys.argv[1]

htmlIndex = 'index.html'
htmlDist  = 'dist/index.html'

fileIndex = open(htmlIndex, 'r')
soup = BeautifulSoup(fileIndex.read(), 'lxml')
fileIndex.close()

filePack = open('dist/js/%s.pack.js' % task, 'w')

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

divScripts = soup.find(id='scripts')
scriptJS   = soup.new_tag('script', src=u'js/js.pack.min.js')
scriptLibs = soup.new_tag('script', src=u'js/libs.pack.min.js')

divScripts.replaceWith(scriptLibs)
scriptLibs.insert_after(scriptJS)

fileIndex = open(htmlDist, 'w')
fileIndex.write(str(soup))
fileIndex.close()

"

################################

set -e

pathRoot="/media/noiv/Octets/Projects/weather-simulation"
pathDist="${pathRoot}/dist"
compiler="${pathRoot}/support/compiler/closure-compiler-v20170626.jar"

cd $pathRoot
echo 
echo "-- Start - Hypatia --"
echo 


echo "running"

echo "  deleting old"
cd $pathDist
    
    rm  -f ./index.html
    rm  -f ./timeranges.js
    rm  -f ./js/libs.pack.js
    rm  -f ./js/libs.pack.min.js
    rm  -f ./js/js.pack.js
    rm  -f ./js/js.pack.min.js


echo "  copy"
cd $pathRoot
    
    cp index.html        $pathDist/index.html
    cp images/favicon.ico       $pathDist/favicon.ico
    cp timeranges.js     $pathDist/timeranges.js
    cp js/aws.version.js $pathDist/js/aws.version.js
    cp js/aws.support.js $pathDist/js/aws.support.js
    cp css/style.css     $pathDist/css.style.css

    cp js/sim.models.clouds.worker.js $pathDist/js/sim.models.clouds.worker.js
    cp js/aws.helper.js $pathDist/js/aws.helper.js
    cp js/aws.tools.js  $pathDist/js/aws.tools.js


echo "  updating version.js"

# cd $pathRoot
    




echo "  packing"
cd $pathRoot

    python -c "$pyPack" libs
    python -c "$pyPack" js


echo "  compressing libs"
cd $pathDist/js

    java -jar                                      \
        $compiler                                  \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                libs.pack.js           \
        --js_output_file    libs.pack.min.js

echo "  compressing js"
    java -jar                                      \
        $compiler                                  \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                js.pack.js             \
        --js_output_file    js.pack.min.js



echo "  clean up"
cd $pathDist
rm  -f            \
    .fuse*        \
    js/*.pack.js          


echo "done"
echo  