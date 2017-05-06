const path = require('path');

let UserAppData;
try      { UserAppData = require('./UserAppData'); }
catch(e) { UserAppData = require(path.resolve(__dirname, './UserAppData.js')); }
let Constants;
try      { Constants = require('./Constants'); }
catch(e) { Constants = require(path.resolve(__dirname, './Constants.js')); }

const { DEFAULT_CONFIG } = Constants;

class Configs {
  constructor() {
    this.config = new UserAppData({appname: 'ssid-to-slack-status', defaultSettings: DEFAULT_CONFIG });
    this.config.load();
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
