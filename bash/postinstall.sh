#!/bin/bash

DIR="$(cd $(dirname $(git rev-parse --git-dir)) && pwd)"
source "${DIR}/bash/include.sh"
cd "${DIR}"

success "Executing: postinstall.sh"
cp -R hooks .git
chmod -R +x .git/hooks
