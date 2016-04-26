#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

# curl -L https://bf-algo.stage.geointservices.io

# gather some data about the repo
source $root/ci/vars.sh

build_target=$root/$APP

mkdir $build_target

# pushd $root/client > /dev/null
#   npm install
#   # npm run test
#   NODE_ENV=production npm run build
#   mv dist $build_target/public
# popd > /dev/null

pushd $root/server > /dev/null
  echo $GOPATH
  go get
  go build -o $build_target/server
popd > /dev/null

zip -r ${APP}.zip $APP
