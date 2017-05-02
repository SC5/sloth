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
    const parent = this;

    return new Promise((resolve, reject) => {
      parent.config.load();
      resolve(parent.config.settings);
    })
  }

  save(data) {
    const parent = this;

    return new Promise((resolve, reject) => {
      parent.config.settings = Object.assign({}, parent.config.settings, data);
      parent.config.save();
      parent.config.load();
      resolve(parent.config.settings);
    });
  }
}

module.exports = new Configs();