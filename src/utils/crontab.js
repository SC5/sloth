const Configs = require('./Configs');
const Utils = require('./Utils');

class Crontab {
  constructor() {
    this.appPath = Utils.appPath();
    this.config = Configs.load();
  }

  check() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && echo 'Already installed in crontab' || exit 0";
    const output = Utils.parseOutput(command);

    return output || null;
  }
  install() {
    let output = this.check();

    if (!output || !output.match(/Already installed in crontab/i)) {
      const command = `((crontab -l 2>/dev/null; echo "*/${Math.ceil(this.config.interval)} * * * * \\"${this.appPath}/executables/crontab.sh\\" >/dev/null 2>&1 # ssid-to-slack-status") | crontab - && echo 'Installed in crontab')`;
      output = Utils.parseOutput(command);
    }

    return output;
  }
  uninstall() {
    const command = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && crontab -l 2>/dev/null | grep -v '# ssid-to-slack-status' | crontab - && echo 'Uninstalled from crontab' || echo 'Was not installed in crontab'";
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