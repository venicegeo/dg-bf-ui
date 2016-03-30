#!/bin/bash -ex

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

# gather some data about the repo
source $root/ci/vars.sh

! type grails >/dev/null 2>&1 && source $root/ci/grails.sh

pushd $root/$APP > /dev/null
curl -v --form body='{"apiKey":"my-api-key-38n987","jobType":{"type":"list-service"}}' https://pz-gateway.stage.geointservices.io/job
  grails compile
  grails -Dbuild.compiler=javac1.7 build-standalone $root/$APP.$EXT
popd > /dev/null
