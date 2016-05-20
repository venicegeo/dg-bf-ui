#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh

#
# Build
#


## FIXME
## FIXME
## FIXME
echo "Attempting to launch Firefox"
(firefox & echo "pid $!"; sleep 10; echo "killing $!"; kill -9 $!)
exit 1
## FIXME
## FIXME
## FIXME


npm install
npm run test:ci
NODE_ENV=production GATEWAY="https://pz-gateway.${PCF_DOMAIN}" npm run build
echo "pushstate: enabled" > dist/Staticfile

#
# Package artifacts
#

zip -jr ${APP}.${EXT} dist
