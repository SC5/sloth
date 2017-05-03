#!/bin/bash

source /etc/profile

if [ -e /etc/bash.bashrc ]; then
  source /etc/bash.bashrc
fi

if [ -e ~/.bashrc ]; then
  source ~/.bashrc
fi

if [ -e ~/.bash_profile ]; then
  source ~/.bash_profile
fi

if [ -e ~/.bash_login ]; then
  source ~/.bash_login
fi

if [ -e ~/.profile ]; then
  source ~/.profile
fi

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
