#!/bin/sh

function build_server() {
  local root=$1
  local target=$2

  # Create a temporary GOPATH and copy source files into it
  export GOPATH=$root/gopath
  mkdir -p $GOPATH/src/github.com/venicegeo/bf-ui
  cp -r $root/server $GOPATH/src/github.com/venicegeo/bf-ui
  pushd $GOPATH/src/github.com/venicegeo/bf-ui/server > /dev/null

  ###

  go get -v -t ./...
  go test -v ./...
  go build -o $target/beachfront-server

  ###

  popd > /dev/null
}
