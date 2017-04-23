import slack from 'slack';
import wifi from 'node-wifi';
import emoji from 'node-emoji';

import {
  config,
  ssids,
} from './config';

wifi.init({
  iface : config.iface || null,
});

export const uniqueObjectsFromArray = (array, property) => (
  Array.from(array.reduce((m, o) => 
    m.set(o[property], o), new Map()).values()
  )
)

export const getEmoji = text => (
  emoji.get(text)
)

/**
 * Fetches the current WiFi connections information.
 * 
 * @returns {Array} - Connections information.
 */
export const getCurrentConnections = () => {
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
 * Fetches the current WiFi connections information.
 * 
 * @returns {Array} - Connections information.
 */
export const scanConnections = () => {
  return new Promise((resolve, reject) => {
    wifi.scan((error, connections) => {
      if (error) {
          reject();
      }
      resolve(uniqueObjectsFromArray(connections, 'ssid'));
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
export const getCurrentSsidNames = () => (
  new Promise((resolve, reject) => {
    this.getCurrentConnections()
      .then(connections => {
        resolve(connections.map(connection => connection.ssid.toLowerCase()) || []);
      })
  })
)

/**
 * @returns {Object} - If configuration for SSID is found, return it.
 */
export const getSsidConfig = () => {
  const connectedSsids = this.getCurrentSsidNames();
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
export const setNewStatus = (ssidConfig, profile) => {
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
      const newStatus = `new status: ${getEmoji(ssidConfig.icon)}  ${ssidConfig.status}`;
      if (data.ok) {
        response = `Succesfully set ${newStatus}\nOld was: ${getEmoji(profile.status_emoji)}  ${profile.status_text}`;
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
export const isStatusPredefined = (status, currentSsid) => (
  !ssids.find(s => s.status === status && s.ssid !== currentSsid)
)

/**
 * Checks the status and updates it if all the conditions are matched.
 */
export const checkCurrentStatus = () => {
  return new Promise((resolve, reject) => {
    slack.users.profile.get({token: config.token}, async(error, data) => {
      if (error) {
        reject(error);
        return;
      }
      const { status_emoji, status_text } = data.profile;

      const ssidConfig = await this.getSsidConfig();

      if (
        ssidConfig
        && (ssidConfig.icon !== status_emoji || ssidConfig.status !== status_text)
        && (process.env.FORCE_UPDATE || config.forceUpdate || !this.isStatusPredefined(status_text, ssidConfig.ssid))
      ) {
        this.setNewStatus(ssidConfig, data.profile)
          .then(response => resolve(response))
          .catch(reason => reject(reason))
        ;
      } else {
        resolve(`Already up-to-date, status: ${getEmoji(status_emoji)}  ${status_text}`);
      }
    });
  });
}

/**
 * Checks the status and updates it if all the conditions are matched.
 */
export const getCurrentStatus = () => {
  return new Promise((resolve, reject) => {
    slack.users.profile.get({token: config.token}, async(error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data.profile);
    });
  });
}

/**
 * 
 * @param {Array} data - Data to sort.
 * @param {String} property - Property to sort by.
 */
export const sortConnections = (data, property) => (
  data.sort((a,b) => a[property] > b[property])
)

const MILLISECOND     = 1;
const QUARTER_SECOND  = 250   * MILLISECOND;
const HALF_SECOND     = 2     * QUARTER_SECOND;
const SECOND          = 2     * HALF_SECOND;
const QUARTER_MINUTE  = 15    * SECOND;
const HALF_MINUTE     = 2     * QUARTER_MINUTE;
const MINUTE          = 2     * HALF_MINUTE;
const QUARTER_HOUR    = 15    * MINUTE;
const HALF_HOUR       = 2     * HALF_HOUR;
const HOUR            = 2     * HOUR;
const QUARTER_DAY     = 6     * HOUR;
const HALF_DAY        = 2     * QUARTER_DAY;
const DAY             = 2     * HALF_DAY;
const WEEK            = 7     * DAY;
const MONTH           = 4     * WEEK;
const YEAR            = 365   * DAY;

export const times = {
  MILLISECOND,
  QUARTER_SECOND,
  HALF_SECOND,
  SECOND,
  QUARTER_MINUTE,
  HALF_MINUTE,
  MINUTE,
  QUARTER_HOUR,
  HALF_HOUR,
  HOUR,
  QUARTER_DAY,
  HALF_DAY,
  DAY,
  WEEK,
  MONTH,
  YEAR
}