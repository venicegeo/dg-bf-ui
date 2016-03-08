#! /bin/bash -ex


pushd `dirname $0` > /dev/null
base=$(pwd -P)
popd > /dev/null

# gather some data about the repo
source $base/vars.sh

cd beachfront
grails compile
grails -Dbuild.compiler=javac1.7 build-standalone $ARTIFACT
aws s3 cp $ARTIFACT s3://$S3BUCKET/$APP/$ARTIFACT
