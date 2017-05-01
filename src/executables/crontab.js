const Crontab = require('../utils/Crontab');

const argument = process.argv[2] || 'install';

switch (argument) {
  case 'install': {
    output = Crontab.install();
    break;
  }
  case 'uninstall': {
    output = Crontab.uninstall();
    break;
  }
  case 'reinstall': {
    output = Crontab.reinstall();
    break;
  }
  default: {
    output = `No such option "${argument}"`;
    break;
  }
}

console.log(output);