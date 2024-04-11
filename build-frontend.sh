#!/usr/bin/env bash

set -e

pushd frontend
yarn install --registry=https://registry.npmmirror.com
yarn run build
popd
