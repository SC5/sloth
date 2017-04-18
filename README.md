# ssid-to-slack-status
Set your Slack status based on the SSID

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
    
    # Edit the file you just copied with your favorite editor, e.g.
    nano config.js

    # Run the script
    npm start

    # If you want it to run automatically every 5 minutes, run:
    npm run install

# Commands

`npm run install` installs this script into crontab, which is executed once in every 5 minutes.
`npm run uninstall` removes this script from crontab.

**If you set a 'custom status' in Slack**, this script will not overwrite your status, so you need to manually set it to something from the `config.js` in order for it to continue updating the status automatically.

## Currently works only on Mac.