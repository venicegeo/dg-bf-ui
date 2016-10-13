#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh


## Install Dependencies ########################################################

npm install
typings install


## Build #######################################################################

NODE_ENV=production npm run build
echo "pushstate: enabled" > dist/Staticfile
cp -r docs dist

#
# Package artifacts
#

zip -jr ${APP}.${EXT} dist
