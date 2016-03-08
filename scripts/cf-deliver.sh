#!/bin/bash -ex


# get the current directory
pushd `dirname $0` > /dev/null
base=$(pwd -P)
popd > /dev/null

# gather some data about the repo
source $base/vars.sh

# do we have this artifact in s3? If not, fail.
[ -f $base/../$ARTIFACT ] || { aws s3 ls $S3URL && aws s3 cp $S3URL $base/../$ARTIFACT || exit 1; }
