const path = require('path');

const UserAppData = require('./UserAppData');
const Constants = require('./Constants');

const { DEFAULT_CONFIG } = Constants;

class Configs {
  constructor() {
    this.config = new UserAppData({appname: 'sloth', defaultSettings: DEFAULT_CONFIG });
    this.config.load();
    if (JSON.stringify(this.config.settings) === JSON.stringify(DEFAULT_CONFIG)) {
      this.oldConfig = new UserAppData({ appname: 'ssid-to-slack-status', defaultSettings: DEFAULT_CONFIG });
      this.oldConfig.load();
      if (JSON.stringify(this.config.settings) !== JSON.stringify(this.oldConfig.settings)) {
        this.save(this.oldConfig.settings);
        this.oldConfig.uninstall();
      }
    }
  }

  load() {
    this.config.load();
    return this.config.settings;
  }

  save(data) {
    this.config.settings = Object.assign({}, this.config.settings, data);
    this.config.save();
    return this.load();
  }
}

module.exports = new Configs();
