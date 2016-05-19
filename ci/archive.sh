#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh

npm install
npm run test:ci
NODE_ENV=production GATEWAY="https://pz-gateway.${PCF_DOMAIN}" npm run build

echo "pushstate: enabled" > dist/Staticfile
