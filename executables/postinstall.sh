#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/include.sh"

success "Executing: postinstall.sh"
cp -R hooks .git
chmod -R +x .git/hooks
