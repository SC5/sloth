const Slack = require('../utils/Slack');
const Configs = require('../utils/Configs').load();

let forceUpdate = Configs.forceUpdate;

if (process.argv[2]) {
  forceUpdate = process.argv[2] === 'force-update' ? true : false;
}

Slack.checkStatus(forceUpdate)
  .then(output => console.log(output))
  .catch(error => console.error(error))
;
