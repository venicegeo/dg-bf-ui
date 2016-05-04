#!/bin/sh

function build_client() {
  local root=$1
  local target=$2

  pushd $root/client > /dev/null

  export NODE_ENV=production

  npm install
  npm run test
  npm run build

  mv dist $target/public

  popd > /dev/null
}
