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

