#!/bin/bash

# http://misc.flogisoft.com/bash/tip_colors_and_formatting

DEFAULT="\033[39m"
RED="\033[31m"
GREEN="\033[32m"

function success {
  echo -e "${GREEN}${1}${DEFAULT}"
}
function fail {
  echo -e "${RED}${1}${DEFAULT}"
}