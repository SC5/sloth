const fs = require('fs');
const path = require('path');
const { app: electron, remote } = require('electron');

const {
  CONFIG,
  CONFIG_FILENAME
} = require('./Constants');


class Configs {
  constructor() {
    this.config = CONFIG;
    this.loadedConfig = this.load();

    if (this.loadedConfig !== undefined) {
      this.config = Object.assign({}, CONFIG, this.loadedConfig);
    } else {
      this.config = this.save(this.config);
    }
  }

  load() {
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

  save(data) {
    let config;
    let configFile = path.join(__dirname, `../../${CONFIG_FILENAME}`);

    if (process.env.APP_ENV === 'browser') {
      configFile = path.join(path.normalize(remote.app.getAppPath()), `./${CONFIG_FILENAME}`);
    }

    config = Object.assign({},
      CONFIG,
      this.load(),
      data
    );

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    return config;
  }
}

module.exports = new Configs();