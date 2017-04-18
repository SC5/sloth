const execSync = require('child_process').execSync;
const slack = require('slack');

const {
  config,
  ssids,
} = require('./config');

/**
 * @returns {String} - Current SSID name.
 */
const getCurrentSsid = () => (
  execSync("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}'")
    .toString()
    .replace(/(\r\n|\n|\r)/gm,'')
);

/**
 * @returns {Object} - If configuration for SSID is found, return it.
 */
const getSsidConfig = () => (
  ssids.find(s => s.ssid.toLowerCase() === getCurrentSsid().toLowerCase()) || undefined
);

/**
 * @param {Object} ssidConfig - Current SSID config.
 * @param {Object} profile - Current profile in Slack.
 * 
 * @returns {String} - Current SSID name.
 */
const setNewStatus = (ssidConfig, profile) => {
  const payload = {
    token: config.token,
    profile: Object.assign(
      {},
      profile,
      {
        status_text: ssidConfig.status,
        status_emoji: ssidConfig.icon
      }
    )
  };

  slack.users.profile.set(payload, (err, data) => {
    console.log(`Setting new status to '${ssidConfig.status}', with emoji '${ssidConfig.icon}' ${data.ok ? 'Succeeded' : 'Failed'}`);
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
  slack.users.profile.get({token: config.token}, (err, data) => {
    const { profile } = data;

    const currentSsid = getCurrentSsid();
    const ssidConfig = getSsidConfig(currentSsid);

    if (ssidConfig && ssidConfig.status !== profile.status_text && (process.env.FORCE_UPDATE || config.forceUpdate || isNotCustomStatus(profile.status_text, currentSsid))) {
      setNewStatus(ssidConfig, profile);
    }
  });
};

/**
 * Check the status.
 */
checkCurrentStatus();