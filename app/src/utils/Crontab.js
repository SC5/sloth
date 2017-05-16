const path = require('path');

const Configs = require('./Configs.js');
const Utils = require('./Utils.js');

class Crontab {
  constructor() {
    this.appPath = Utils.appPath();
    this.config = Configs.load();
    this.args = '--args UPDATE';
    this.scriptPath = path.join(this.appPath, '../../MacOS/Sloth');
    this.scriptExecute = `\\"${this.scriptPath}\\" ${this.args}`;
  }

  check() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status\\|# sc5 sloth' && echo 'Already installed in crontab' || exit 0";
    const output = Utils.parseOutput(command);

    return output || null;
  }
  checkScriptPath() {
    const command = "crontab -l 2> /dev/null | grep '# ssid-to-slack-status\\|# sc5 sloth' || exit 0";
    let output = Utils.parseOutput(command);

    if (output) {
      const regex = new RegExp(/"(.*)"/);
      const matches = regex.exec(output);

      if (!matches || `\\"${matches[1]}\\" ${this.args}` !== this.scriptExecute) {
        return false;
      }
      return true;
    }

    return output || null;
  }
  install() {
    let output = this.check();

    if (!output || !output.match(/Already installed in crontab/i)) {
      const command = `((crontab -l 2>/dev/null; echo "*/${Math.ceil(this.config.interval)} * * * * ${this.scriptExecute} >/dev/null 2>&1 # sc5 sloth") | crontab - && echo 'Installed in crontab')`;
      output = Utils.parseOutput(command);
    }

    return output;
  }
  uninstall() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status\\|# sc5 sloth' && crontab -l 2>/dev/null | grep -v '# ssid-to-slack-status\\|# sc5 sloth' | crontab - && echo 'Uninstalled from crontab' || echo 'Was not installed in crontab'";
    const output = Utils.parseOutput(command);

    return output;
  }
  reinstall() {
    const unistall = this.uninstall();
    const install = this.install();

    let output = "Reinstalled in crontab";
    if (unistall === 'Was not installed in crontab') {
      output = 'Installed in crontab';
    }

    return output;
  }
}

module.exports = new Crontab();
