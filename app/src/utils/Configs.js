const UserAppData = require('./UserAppData');
const Constants = require('./Constants');

const { DEFAULT_CONFIG } = Constants;

class Configs {
  constructor() {
    this.config = new UserAppData({ appname: 'sloth', defaultSettings: DEFAULT_CONFIG });
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
