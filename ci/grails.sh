#!/bin/bash -x

pushd `dirname $0`/.. > /dev/null
root=$(pwd -P)
popd > /dev/null


if ! test -d "$SDKMAN_DIR"; then
  curl -s get.sdkman.io | bash
  export SDKMAN_DIR=$HOME/.sdkman
fi

if ! type sdk; then 
  set +e
  source $SDKMAN_DIR/bin/sdkman-init.sh
fi

# groovy
sdk install groovy 2.4.5
sdk use groovy 2.4.5

# grails
sdk install grails 2.5.4
sdk use grails 2.5.4
