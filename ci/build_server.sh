#!/bin/sh

function build_server() {
  local root=$1
  local target=$2

  pushd $root/server > /dev/null

  go get -v
  go test
  go build -o $target/beachfront-server

  popd > /dev/null
}
