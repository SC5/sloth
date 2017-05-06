#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/../src/hooks/colors.sh

success "Executing: postinstall.sh"
cp -R src/hooks .git
chmod -R +x .git/hooks
