#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

curl -L https://bf-algo.stage.geointservices.io

# gather some data about the repo
source $root/ci/vars.sh

#! type grails >/dev/null 2>&1 && 
source $root/ci/grails.sh

pushd $root/$APP > /dev/null
  grails compile
  grails prod -Dbuild.compiler=javac1.7 build-standalone $root/$APP.$EXT
popd > /dev/null
