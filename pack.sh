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

pyHeader="

## works in root

import sys, hashlib, time

def calcHash () :

  with open('header.js', 'r') as fileHeader :
      version = fileHeader.readlines()[0]
      token  = hashlib.md5(version).hexdigest()

  return version, token

version, token = calcHash()
print token
# print '  ' + version
# print '  ' + token


with open('dist/header.js', 'w') as fileHeader :

  fileHeader.truncate()

  fileHeader.write(version + '\n')
  fileHeader.write('var HASH  = \'%s\';\n' % token)
  fileHeader.write('var DEBUG = \'%s\';\n' % 'false')
  fileHeader.write('var DEVEL = \'%s\';\n' % 'false')
  fileHeader.write('var ADMIN = \'%s\';\n' % 'false')

"

pyPack="

## works in root

import sys, hashlib, time
from bs4 import BeautifulSoup, Tag, NavigableString, Comment

with open('dist/header.js', 'r') as fileHeader :
    version = fileHeader.readlines()[0]

hash = sys.argv[1]
task = sys.argv[2]

htmlIndex = 'index.html'
htmlDist  = 'dist/index.html'

with open(htmlIndex, 'r') as myfile :
    soup = BeautifulSoup(myfile.read(), 'lxml')

filePack = open('dist/js/%s.pack.js' % task, 'w')

tags = soup.findAll('script')

print '  task = %s, hash = %s' % (task, hash)
print

for tag in tags :
    if tag.has_attr('src') :
        if tag['src'].startswith('%s/' % task) :
            print '    ' + tag['src']
            fileSource = open(tag['src'],'r')
            filePack.write(fileSource.read())
            fileSource.close()

filePack.close()

## rewrite lib script tags
divScripts = soup.find(id='scripts')
scriptJS   = soup.new_tag('script', src=u'js/js.pack.min.js'   + '?' + hash)
scriptLibs = soup.new_tag('script', src=u'js/libs.pack.min.js' + '?' + hash)

divScripts.replaceWith(scriptLibs)
scriptLibs.insert_after(scriptJS)
scriptLibs.insert_after(NavigableString('\n'))

## mark version
comment = Comment('\n %s \n %s %s \n' % (
    time.strftime('%X %x %Z'),
    version.split(' ')[-1],
    hash
))
soup.head.insert(-1, comment)

## write new index.html
fileIndex = open(htmlDist, 'w')
fileIndex.write(str(soup.prettify()))
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

    rm  -f ./js/sim.worker.jetstream.js
    rm  -f ./js/jetstream.worker.lib.pack.js
    rm  -f ./js/jetstream.worker.lib.pack.min.js


echo "  hashing"
cd $pathRoot

    # HASH="123456"
    # python -c "$pyHeader"
    HASH=$(python -c "$pyHeader")


echo "  copy"
cd $pathRoot
    
    cp index.html           $pathDist/index.html
    cp images/favicon.ico   $pathDist/favicon.ico
    cp timeranges.js        $pathDist/timeranges.js
    cp js/aws.support.js    $pathDist/js/aws.support.js
    cp css/style.css        $pathDist/css/style.css

    ## clouds worker
    cp js/sim.models.clouds.worker.js $pathDist/js/sim.models.clouds.worker.js
    cp js/aws.helper.js     $pathDist/js/aws.helper.js
    cp js/aws.tools.js      $pathDist/js/aws.tools.js

    ## jetstream worker
    cp js/sim.worker.jetstream.js $pathDist/js/sim.worker.jetstream.js

echo "  packing"
cd $pathRoot

    python -c "$pyPack" $HASH libs
    python -c "$pyPack" $HASH js

        
echo "  packing worker lib"
cd $pathRoot/js

    cat \
        ../libs/async.js        \
        aws.helper.js           \
        aws.tools.js            \
        aws.math.js             \
        aws.res.js              \
        sim.datagram.js         \
    > ../dist/js/jetstream.worker.lib.pack.js


echo "  compressing libs"
cd $pathDist/js

    java -jar $compiler                            \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                libs.pack.js           \
        --js_output_file    libs.pack.min.js

echo "  compressing js"
    java -jar $compiler                            \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                  \
        --js                js.pack.js             \
        --js_output_file    js.pack.min.js

echo "  compressing jetstream worker"
    java -jar $compiler                            \
        --compilation_level SIMPLE                 \
        --warning_level     QUIET                               \
        --js                jetstream.worker.lib.pack.js        \
        --js_output_file    jetstream.worker.lib.pack.min.js



echo "  clean up"
cd $pathDist
rm  -f            \
    .fuse*        \
    js/*.pack.js          


echo "done"
echo  