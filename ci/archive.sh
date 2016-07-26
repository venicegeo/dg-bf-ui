#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh

#
# Resolve target service domain
#

# Ensure int points to stage
resolvedDomain=$(echo $PCF_DOMAIN | sed 's/^int\./stage\./')

#
# Build
#

npm install
xvfb-run npm run test:ci
NODE_ENV=production GATEWAY="https://pz-gateway.${resolvedDomain}" npm run build
echo "pushstate: enabled" > dist/Staticfile

#
# Package artifacts
#

zip -jr ${APP}.${EXT} dist
