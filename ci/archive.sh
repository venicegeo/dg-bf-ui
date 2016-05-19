#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh

npm install
npm run test:ci
npm run build
# NODE_ENV=production npm run build
