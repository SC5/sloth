const fs = require('fs');
const path = require('path');
const slack = require('slack');
const wifi = require('node-wifi');
const emoji = require('node-emoji');
const { app: electron, shell, remote } = require('electron');
const execSync = require('child_process').execSync;

const {
  CONFIG,
  CONFIG_FILENAME
} = require('./constants');

const isElectronRenderer = function() {
  // running in a web browser
  if (typeof process === 'undefined') return true

  // node-integration is disabled
  if (!process) return true

  // We're in node.js somehow
  if (!process.type) return false

  return process.type === 'renderer'
}

class Utils {
  constructor() {
    this.config = CONFIG;
    this.loadedConfig = this.loadFromConfig();

    if (this.loadedConfig !== undefined) {
      this.config = Object.assign({}, CONFIG, this.loadedConfig);
    } else {
      this.config = this.saveToConfig(this.config);
    }

    wifi.init({
      iface : this.config.iface || null,
    });
  }

  /**
   * Get configurations.
   * 
   * @returns {Array} - Connections information.
   */
  getConfig() {
    return this.loadFromConfig();
  }

  loadFromConfig() {
    let loadedConfig = undefined;

    if (process.env.APP_ENV === 'browser') {
      const configPath = path.join(path.normalize(remote.app.getAppPath()), `./${CONFIG_FILENAME}`);
      if (fs.existsSync(configPath)) {
        loadedConfig = JSON.parse(fs.readFileSync(configPath).toString());
      }
    } else {
      if (fs.existsSync(path.join(__dirname, `../../${CONFIG_FILENAME}`))) {
        loadedConfig = require(path.join(__dirname, `../../${CONFIG_FILENAME}`));
      }
    }

    return loadedConfig;
  }

  saveToConfig(data) {
    let config;
    let configFile = path.join(__dirname, `../../${CONFIG_FILENAME}`);

    if (process.env.APP_ENV === 'browser') {
      configFile = path.join(path.normalize(remote.app.getAppPath()), `./${CONFIG_FILENAME}`);
    }

    config = Object.assign({},
      CONFIG,
      this.loadFromConfig(),
      data
    );

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    return config;
  }

  checkToken(bool) {
    bool = bool || null;
    this.config = this.getConfig();
    if (!this.config || !this.config.token || this.config.token.length < 1) {
      if (process.env.APP_ENV === 'browser' || bool) {
        return false;
      }
      else {
        throw new Error('Token not set');
      }
    }

    return true;
  }

  /**
   * 
   * @param {Array} array - Array to sort.
   * @param {String} property - Property sort by.
   */
  uniqueObjectsFromArray(array, property) {
    return Array.from(array.reduce((m, o) => 
      m.set(o[property], o), new Map()).values()
    )
  }

  /**
   * 
   * @param {String} text - Emoji.
   */
  getEmoji(text) {
    return emoji.get(text)
  }

  /**
   * @param {Array} connections - Connections to fix MAC address from.
   */
  fixConnectionsMac(connections) {
    return (
      connections.map(connection => (
        Object.assign({},
          connection,
          { mac: connection.mac.split(':').map(part => part.length < 2 ? `0${part}` : part).join(':') }
        )
      ))
    );
  }

  /**
   * Fetches the current WiFi connections information.
   * 
   * @returns {Array} - Connections information.
   */
  getCurrentConnections() {
    const parent = this;

    return new Promise((resolve, reject) => {
      wifi.getCurrentConnections((error, connections) => {
        if (error) {
            reject();
        }
        //resolve(parent.uniqueObjectsFromArray(connections, 'ssid'));
        resolve(parent.uniqueObjectsFromArray(parent.fixConnectionsMac(connections), 'ssid'));
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  /**
   * Fetches the current WiFi connections information.
   * 
   * @returns {Array} - Connections information.
   */
  scanConnections() {
    const parent = this;

    return new Promise((resolve, reject) => {
      wifi.scan((error, connections) => {
        if (error) {
            reject();
        }
        //resolve(parent.uniqueObjectsFromArray(connections, 'ssid'));
        resolve(parent.uniqueObjectsFromArray(parent.fixConnectionsMac(connections), 'ssid'));
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  /**
   * Tries to get the SSID names for the current WiFi connections.
   * 
   * @returns {Array} - Array of all the currently connected SSID names.
   */
  getCurrentSsidNames() {
    const parent = this;
    return new Promise((resolve, reject) => {
      parent.getCurrentConnections()
        .then(connections => {
          resolve(connections.map(connection => connection.ssid.toLowerCase()) || []);
        })
    })
  }

  /**
   * @returns {Object} - If configuration for SSID is found, return it.
   */
  getSsidConfig() {
    const parent = this;
    return new Promise((resolve, reject) => {
      parent.getCurrentSsidNames().then(connectedSsids => {
        resolve(parent.config.ssids.find(s => connectedSsids.includes(s.ssid.toLowerCase())) || undefined);
      })
    })
  }

  /**
   * Update the status with predefined one for the current SSID.
   * 
   * @param {Object} ssidConfig - Current SSID config.
   * @param {Object} profile - Current profile in Slack.
   * 
   * @returns {String} - Current SSID name.
   */
  setNewStatus(ssidConfig, profile) {
    this.checkToken();

    const parent = this;

    const payload = {
      token: this.config.token,
      profile: Object.assign({},
        profile,
        {
          status_text: ssidConfig.status,
          status_emoji: ssidConfig.icon
        }
      )
    };

    return new Promise((resolve, reject) => {
      slack.users.profile.set(payload, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        let response;
        const newStatus = `new status: ${parent.getEmoji(ssidConfig.icon)}  ${ssidConfig.status}`;
        if (data.ok) {
          response = `Succesfully set ${newStatus}\nOld was: ${parent.getEmoji(profile.status_emoji)}  ${profile.status_text}`;
        } else {
          response = `Failed to set new status: ${newStatus}`;
        }
        resolve(response);
      });
    });
  }

  /**
   * Checks if the current status text is not predefined in config or not.
   * 
   * @param {String} status - Current status text.
   * @param {String} currentSsid - Current SSID config.
   * 
   * @returns {Boolean} - true = Predefined, false = Custom
   */
  isStatusPredefined(status, currentSsid) {
    return !this.config.ssids.find(s => s.status === status && s.ssid !== currentSsid);
  }

  /**
   * Checks the status and updates it if all the conditions are matched.
   */
  checkCurrentStatus() {
    this.checkToken();

    const parent = this;

    return new Promise((resolve, reject) => {
      slack.users.profile.get({token: parent.config.token}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        const { status_emoji, status_text } = data.profile;

        parent.getSsidConfig()
          .then(ssidConfig => {
            if (
              ssidConfig
              && (ssidConfig.icon !== status_emoji || ssidConfig.status !== status_text)
              && (process.env.FORCE_UPDATE || parent.config.forceUpdate || !parent.isStatusPredefined(status_text, ssidConfig.ssid))
            ) {
              parent.setNewStatus(ssidConfig, data.profile)
                .then(response => resolve(response))
                .catch(reason => reject(reason))
              ;
            } else {
              resolve(`Already up-to-date, status: ${parent.getEmoji(status_emoji)}  ${status_text}`);
            }
          })
      });
    });
  }

  /**
   * Checks the status and updates it if all the conditions are matched.
   */
  getCurrentStatus() {
    this.checkToken();

    const parent = this;

    return new Promise((resolve, reject) => {
      slack.users.profile.get({token: parent.config.token}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data.profile);
      });
    });
  }

  /**
   * Checks the status and updates it if all the conditions are matched.
   */
  getEmojis() {
    this.checkToken();

    const parent = this;

    return new Promise((resolve, reject) => {
      slack.emoji.list({token: parent.config.token}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data.emoji);
      });
    });
  }

  /**
   * 
   * @param {Array} data - Data to sort.
   * @param {String} property - Property to sort by.
   */
  alphabeticSortByProperty(data, property) {
    return data.sort((a,b) => a[property].toLowerCase() > b[property].toLowerCase())
  }

  electronOpenLinkInBrowser(url, event) {
    if(isElectronRenderer()) {
      if (url && url.preventDefault) {
        event = url;
        event.preventDefault();
        shell.openExternal(event.target.href);
      } else {
        event.preventDefault();
        shell.openExternal(url);
      }
    } else {
      if (url && !url.preventDefault) {
        event.preventDefault();
        window.location.href = url;
      }
    }
  }


  parseOutput(command) {
    const output = execSync(command);
    if (output) {
      return output.toString().replace(/^\s+|\s+$/g, '')
    }

    return null;
  }

  checkCrontab() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && echo 'Already installed in crontab' || exit 0";
    const output = this.parseOutput(command);

    return output || null;
  }
  installCrontab() {
    const command = `crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && echo 'Already installed in crontab' || ((crontab -l 2>/dev/null; echo "*/${Math.ceil(this.config.interval)} * * * * $(pwd)/execute-in-crontab.sh >/dev/null 2>&1 # ssid-to-slack-status") | crontab - && echo 'Installed in crontab')`;
    const output = this.parseOutput(command);

    return output;
  }
  uninstallCrontab() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && crontab -l 2>/dev/null | grep -v '# ssid-to-slack-status' | crontab - && echo 'Uninstalled from crontab' || echo 'Was not installed in crontab'";
    const output = this.parseOutput(command);

    return output;
  }
  reinstallCrontab() {
    const unistall = this.uninstallCrontab();
    const install = this.installCrontab();

    let output = "Reinstalled in crontab";
    if (unistall === 'Was not installed in crontab') {
      output = 'Installed in crontab';
    }

    return output;
  }
}

module.exports = Utils;