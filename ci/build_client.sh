#!/bin/sh

function build_client() {
  local root=$1
  local target=$2

  pushd $root/client > /dev/null

  npm install
  npm run test
  NODE_ENV=production npm run build

  mv dist $target/public

  popd > /dev/null
}
