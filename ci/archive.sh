#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

#
# Define Variables
#

source $root/ci/vars.sh
build_target=$root/$APP

#
# Perform Build
#

mkdir $build_target

source $root/ci/build_client.sh
source $root/ci/build_server.sh

build_server $root $build_target
build_client $root $build_target

#
# Bundle Artifacts
#

zip -mr ${APP}.${EXT} $APP
