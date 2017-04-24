const Utils = require('./index');
const utils = new Utils();

switch (process.argv[2]) {
  case 'update': {
    utils.checkCurrentStatus()
      .then(output => {
        console.log(output)
      })
      .catch(error => {
        console.error(error)
      });
    break;
  }
  case 'force-update': {
    utils.checkCurrentStatus()
      .then(output => {
        console.log(output)
      })
      .catch(error => {
        console.error(error)
      });
    break;
  }
  default: {
    console.log('Command not found');
    break;
  }
}