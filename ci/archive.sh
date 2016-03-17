#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

# gather some data about the repo
source $root/ci/vars.sh

pushd $root/coord-convert > /dev/null
  grails compile
  grails -Dbuild.compiler=javac1.7 build-standalone $root/$APP.$EXT
popd > /dev/null
