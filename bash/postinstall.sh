#!/bin/bash

DIR="$(dirname $(git rev-parse --git-dir))"
source "${DIR}/bash/include.sh"
cd "${DIR}"

success "Executing: postinstall.sh"
cp -R hooks .git
chmod -R +x .git/hooks
