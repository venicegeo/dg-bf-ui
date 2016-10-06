#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh


## Install Dependencies ########################################################

npm install


## Run Tests ###################################################################

if [ $(uname) == Darwin ]
  then npm run test:ci           # Local development
  else xvfb-run npm run test:ci  # Jenkins
fi


## Build #######################################################################

NODE_ENV=production npm run build
echo "pushstate: enabled" > dist/Staticfile

#
# Package artifacts
#

zip -jr ${APP}.${EXT} dist
