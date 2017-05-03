#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/include.sh"

cd "$(dirname "${BASH_SOURCE[0]}")"
$(which node) --harmony update.js
