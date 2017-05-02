#!/bin/bash

source /etc/profile
source ~/.profile

cd "$(dirname "${BASH_SOURCE[0]}")"
$(which node) --harmony update.js