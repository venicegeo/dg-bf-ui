#!/bin/sh

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null

source $root/ci/vars.sh

## Install Dependencies ########################################################

npm install


## Run Tests ###################################################################

if [ $(uname) == Darwin ]
  then npm run test:ci           # Local development
  else xvfb-run npm run test:ci  # Jenkins
fi


# HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
# HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

# Note: This is a workaround for the fact that SonarQube currently doesn't support
#       Typescript.  It can be removed once(if?) they release an official plugin
#       for it.

# Generate artifacts Sonar can actually parse
./node_modules/.bin/tsc

# Update the coverage report to point to the transpiled sources
cp report/coverage/lcov.info report/coverage/lcov.info
sed -E 's/\.tsx?$/.js/' report/coverage/lcov.info~ > report/coverage/lcov.info

# HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
# HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
