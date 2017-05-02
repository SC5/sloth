const path = require('path');
const config = require('./UserAppData');
const PACKAGE = require('../../package.json');

const Utils = require('./Utils');

const { DEFAULT_CONFIG } = require('./Constants');

class Configs {
  constructor() {
    this.config = new config({ appname: PACKAGE.name, defaultSettings: DEFAULT_CONFIG });
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