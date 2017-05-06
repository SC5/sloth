require('asar-require');
const Slack = require('../Resources/app.asar/src/utils/Slack.js');
const Configs = require('../Resources/app.asar/src/utils/Configs.js').load();

let forceUpdate = Configs.forceUpdate;

if (process.argv[2]) {
  forceUpdate = process.argv[2] === 'force-update' ? true : false;
}

Slack.checkStatus(forceUpdate)
  .then(output => console.log(output))
  .catch(error => console.error(error))
;
