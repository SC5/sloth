#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/include.sh"

cd "${DIR}"

success "Removing old dependencies"
rm -rf node_modules package.json

success "Initializing package.json"
echo '{
  "name": "executables",
  "version": "1.0.0",
  "description": "Crontab executable dependencies",
  "main": "update.js",
  "scripts": {
    "update": "$(which node) --harmony update.js"
  },
  "repository": {
    "url": "https://github.com/kirbo/ssid-to-slack-status.git",
    "type": "git"
  },
  "author": "kimmo.saari@sc5.io",
  "license": "MIT",
  "dependencies": {
  }
}' > package.json

npm config set save-prefix=''

success "Installing dependencies"
$(which node) --harmony install_dependencies.js

success "All done."
