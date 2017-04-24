const Utils = require('./index');
const utils = new Utils();

const argument = process.argv[2] || 'install';

switch (argument) {
  case 'install': {
    output = utils.installCrontab();
    break;
  }
  case 'uninstall': {
    output = utils.uninstallCrontab();
    break;
  }
  case 'reinstall': {
    output = utils.reinstallCrontab();
    break;
  }
  default: {
    output = `No such option "${argument}"`;
    break;
  }
}

console.log(output);