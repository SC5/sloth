const fs = require('fs');
const path = require('path');
const wifi = require('node-wifi');

const Configs = require('./Configs');

class Wifi {
  constructor() {
    this.config = Configs.load();

    wifi.init({
      iface: this.config.iface || null,
    });
  }

  /**
   *
   * @param {Array} array - Array to sort.
   * @param {String} property - Property sort by.
   */
  uniqueObjectsFromArray(array, property) {
    return Array.from(array.reduce((m, o) =>
      m.set(o[property], o), new Map()).values()
    )
  }

  /**
   * @param {Array} connections - Connections to fix MAC address from.
   */
  fixConnectionsMac(connections) {
    return (
      connections.map(connection => (
        Object.assign({},
          connection,
          { mac: connection.mac.split(':').map(part => part.length < 2 ? `0${part}` : part).join(':') }
        )
      ))
    );
  }

  /**
   * Fetches the current WiFi connections information.
   *
   * @returns {Array} - Connections information.
   */
  getCurrentConnections() {
    const parent = this;

    return new Promise((resolve, reject) => {
      wifi.getCurrentConnections((error, connections) => {
        if (error) {
          reject();
        }
        resolve(parent.uniqueObjectsFromArray(parent.fixConnectionsMac(connections), 'ssid'));
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
  scanConnections() {
    const parent = this;

    return new Promise((resolve, reject) => {
      wifi.scan((error, connections) => {
        if (error) {
          reject();
        }
        resolve(parent.uniqueObjectsFromArray(parent.fixConnectionsMac(connections), 'ssid'));
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
  getCurrentSsidNames() {
    const parent = this;
    return new Promise((resolve, reject) => {
      parent.getCurrentConnections()
        .then(connections => {
          resolve(connections.map(connection => connection.ssid.toLowerCase()) || []);
        })
    })
  }

  /**
   * Tries to get the BSSID names for the current WiFi connections.
   *
   * @returns {Array} - Array of all the currently connected SSID names.
   */
  getCurrentBssidNames() {
    const parent = this;
    return new Promise((resolve, reject) => {
      parent.getCurrentConnections()
        .then(connections => {
          resolve(connections.map(connection => connection.mac.toLowerCase()) || []);
        })
    })
  }

  /**
   * @returns {Object} - If configuration for SSID is found, return it.
   */
  getSsidConfig() {
    const parent = this;
    return new Promise((resolve, reject) => {
      Promise.all([
        parent.getCurrentBssidNames(),
        parent.getCurrentSsidNames(),
      ])
        .then(values => {
          const currentBssids = values[0][0] || '';
          const currentSsids = values[1][0] || '';

          const viaMac = parent.config.ssids.find(s => s.mac.toLowerCase() === currentBssids);
          const viaSsid = parent.config.ssids.find(s => s.ssid.toLowerCase() === currentSsids && s.mac === '');

          if (viaMac) {
            resolve(viaMac);
          }
          else if (viaSsid) {
            resolve(viaSsid);
          }
          else {
            resolve(undefined);
          }
        })
    })
  }

  /**
   * Checks if the current status text is not predefined in config or not.
   *
   * @param {Object} profile - Current profile.
   * @param {String} currentSsid - Current SSID config.
   *
   * @returns {Boolean} - true = Predefined, false = Custom
   */
  isCurrentSsid(profile, currentSsid) {
    return !!this.config.ssids.find(s =>
      (
        s.status === profile.status_text
        && `:${s.icon}:` === profile.status_emoji
        && (
          s.mac.toLowerCase() === currentSsid.mac.toLowerCase()
          || s.ssid.toLowerCase() === currentSsid.ssid.toLowerCase()
        )
      )
    );
  }
}

module.exports = new Wifi();
