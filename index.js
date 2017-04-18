const execSync = require('child_process').execSync;
const slack = require('slack');

const {
  token,
  ssids,
} = require('./config');

/**
 * @returns {String} - Current SSID name.
 */
const getCurrentSsid = () => (
  execSync("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}'").toString().replace(/(\r\n|\n|\r)/gm,'')
);

/**
 * @returns {Object} - If configuration for SSID is found, return it.
 */
const getSsidConfig = () => (
  ssids.find(s => s.ssid === getCurrentSsid().toLowerCase()) || undefined
);

/**
 * @param {Object} config - Current SSID config.
 * @param {Object} profile - Current profile in Slack.
 * 
 * @returns {String} - Current SSID name.
 */
const setNewStatus = (config, profile) => {
  const payload = {
    token,
    profile: Object.assign(
      {},
      profile,
      {
        status_text: config.status,
        status_emoji: config.icon
      }
    )
  };

  slack.users.profile.set(payload, (err, data) => {
    console.log(`Setting new status to '${config.status}', with emoji '${config.icon}' ${data.ok ? 'Succeeded' : 'Failed'}`);
  });
};

/**
 * @param {String} status - Current status text.
 * @param {String} currentSsid - Current SSID config.
 */
const isNotCustomStatus = (status, currentSsid) => (
  !!ssids.find(s => s.status === status && s.ssid !== currentSsid)
)

const checkCurrentStatus = () => {
  slack.users.profile.get({token}, (err, data) => {
    const { profile } = data;

    const currentSsid = getCurrentSsid();
    const ssidConfig = getSsidConfig(currentSsid);

    if (ssidConfig.status !== profile.status_text && isNotCustomStatus(profile.status_text, currentSsid)) {
      setNewStatus(ssidConfig, profile);
    }
  });
};

/**
 * Check the status.
 */
checkCurrentStatus();