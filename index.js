const slack = require('slack');
const wifi = require('node-wifi');
const emoji = require('node-emoji');

const {
  config,
  ssids,
} = require('./config');

wifi.init({
  iface : config.iface || null,
});


/**
 * Fetches the current WiFi connections information.
 * 
 * @returns {Array} - Connections information.
 */
const getCurrentConnections = async() => {
  return new Promise((resolve, reject) => {
    wifi.getCurrentConnections((error, connections) => {
      if (error) {
          reject();
      }
      resolve(connections);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

/**
 * Tries to get the SSID names for the current WiFi connections.
 * 
 * @returns {Array} - Array of all the currently connected SSID names.
 */
const getCurrentSsidNames = async() => {
  const connections = await getCurrentConnections();
  return connections.map(connection => connection.ssid.toLowerCase()) || [];
}

/**
 * @returns {Object} - If configuration for SSID is found, return it.
 */
const getSsidConfig = async() => {
  const connectedSsids = await getCurrentSsidNames();
  return ssids.find(s => connectedSsids.includes(s.ssid.toLowerCase())) || undefined;
}

/**
 * Update the status with predefined one for the current SSID.
 * 
 * @param {Object} ssidConfig - Current SSID config.
 * @param {Object} profile - Current profile in Slack.
 * 
 * @returns {String} - Current SSID name.
 */
const setNewStatus = (ssidConfig, profile) => {
  const payload = {
    token: config.token,
    profile: Object.assign({},
      profile,
      {
        status_text: ssidConfig.status,
        status_emoji: ssidConfig.icon
      }
    )
  };

  return new Promise((resolve, reject) => {
    slack.users.profile.set(payload, async(error, data) => {
      if (error) {
        reject(error);
        return;
      }

      let response;
      const newStatus = `new status: ${emoji.get(ssidConfig.icon)}  ${ssidConfig.status}`;
      if (data.ok) {
        response = `Succesfully set ${newStatus}\nOld was: ${emoji.get(profile.status_emoji)}  ${profile.status_text}`;
      } else {
        response = `Failed to set new status: ${newStatus}`;
      }
      resolve(response);
    });
  });
}

/**
 * Checks if the current status text is not predefined in config or not.
 * 
 * @param {String} status - Current status text.
 * @param {String} currentSsid - Current SSID config.
 * 
 * @returns {Boolean} - true = Predefined, false = Custom
 */
const isStatusPredefined = (status, currentSsid) => (
  !ssids.find(s => s.status === status && s.ssid !== currentSsid)
)

/**
 * Checks the status and updates it if all the conditions are matched.
 */
const checkCurrentStatus = () => {
  return new Promise((resolve, reject) => {
    slack.users.profile.get({token: config.token}, async(error, data) => {
      if (error) {
        reject(error);
        return;
      }
      const { status_emoji, status_text } = data.profile;

      const ssidConfig = await getSsidConfig();

      if (
        ssidConfig
        && (ssidConfig.icon !== status_emoji || ssidConfig.status !== status_text)
        && (process.env.FORCE_UPDATE || config.forceUpdate || !isStatusPredefined(status_text, ssidConfig.ssid))
      ) {
        setNewStatus(ssidConfig, data.profile)
          .then(response => resolve(response))
          .catch(reason => reject(reason))
        ;
      } else {
        resolve(`Already up-to-date, status: ${emoji.get(status_emoji)}  ${status_text}`);
      }
    });
  });
}

// Execute the check.
checkCurrentStatus()
  .then(response => console.log(response))
  .catch(reason => console.error('Error:', reason))
;