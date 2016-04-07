#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

# gather some data about the repo
source $root/ci/vars.sh

! type grails >/dev/null 2>&1 && source $root/ci/grails.sh
grails -version
pushd $root/$APP > /dev/null
  grails --verbose --stacktrace compile
  grails -Dbuild.compiler=javac1.7 build-standalone $root/$APP.$EXT
popd > /dev/null
