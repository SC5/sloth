# ssid-to-slack-status
Set your Slack status based on the SSID you're currently connected in.

# Installation

#### Installing Node.js
Check the instructions how to install Node.js and NPM on your OS:
https://nodejs.org/en/download/package-manager/

#### Installing the ssid-to-slack-status

    # Clone this repository
    git clone https://github.com/kirbo/ssid-to-slack-status.git
    
    # Change directory
    cd ssid-to-slack-status
 
    # Install dependencies
    npm install
 
    # Copy sample config file
    cp example-config.js config.js

**Get your access token from:** [https://ssid-to-slack-status.tunkkaus.com](https://ssid-to-slack-status.tunkkaus.com)
    
    # Edit the file you just copied with your favorite editor, e.g.
    nano config.js

    # Run the script
    npm run update

    # If you want it to run automatically every 5 minutes, run:
    npm run install-crontab

# Commands

* `npm run update` executes this script once normally.
* `npm run force-update` executes this script once and will overwrite any status that is set.
* `npm run install-crontab` installs this script into crontab, which is executed once in every 5 minutes.
* `npm run uninstall-crontab` removes this script from crontab.

**If you set a 'custom status' in Slack**, this script will not overwrite your status, so you need to manually set it to something from the `config.js` in order for it to continue updating the status automatically.

## Currently works only on Mac.