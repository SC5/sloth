const Slack = require('../utils/Slack');

switch (process.argv[2]) {
  case 'update': {
    Slack.checkStatus()
      .then(output => {
        console.log(output)
      })
      .catch(error => {
        console.error(error)
      });
    break;
  }
  case 'force-update': {
    Slack.checkStatus(true)
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