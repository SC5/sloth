# ssid-to-slack-status
Set your Slack status based on the SSID you're currently connected in.

# Desktop GUI application
The Desktop version of this program can be [found here](https://github.com/kirbo/ssid-to-slack-status/releases).
Currently only Mac version is available, but in the future I intend to do a Windows version as well.

# Requirements

* Node.js v7.0.0
* Crontab for automatic updates (unless you automate the execution yourself)

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
    npm run crontab

# Icons

All the emojis your Slack instance has are available.

List of the standard emojis can be [found here](https://www.webpagefx.com/tools/emoji-cheat-sheet/) and custom emojis can be found in [https://your_slack_instance.slack.com/customize/emoji](https://slack.com/customize/emoji).

# Commands

* `npm run upgrade` this command should be run after updating the repository.
* `npm run update` executes this script once normally (doesn't overwrite custom statuses).
* `npm run force-update` executes this script once and will overwrite any status that is set, if predefined configuration for current SSID is found.
* `npm run crontab` installs this script into crontab, which is executed once every 5 minutes.
* `npm run crontab-uninstall` removes this script from crontab.
* `npm run crontab-reinstall` reinstalls ("upgrades") the crontab command.

**If you set a 'custom status' in Slack**, this script will not overwrite your status, unless you execute `npm run force-update` or set the `forceUpdate: true` in [config.js](https://github.com/kirbo/ssid-to-slack-status/blob/master/example-config.js#L3) file.

# Updating the repository

    # Pull latest changes
    git pull

    # Upgrade the dependencies
    npm run upgrade


# Works with

* Node.js v7.0.0
  * Tested to be working with Mac OS Sierra
  * Should work in Linux also
  * In theory might work in Windows 10 Bash also
