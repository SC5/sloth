import './App.css';

import React from 'react';
import slack from 'slack';
import wifi from 'node-wifi';
import emoji from 'node-emoji';

import Loading from '../../components/Loading';

import {
  config,
  ssids,
} from '../../utils/config';

wifi.init({
  iface : config.iface || null,
});

class App extends React.Component {
  state = {
    currentConnections: [],
    currentConnectionsInitialised: false,
    availableConnections: [],
    availableConnectionsInitialised: false,
    initialised: false,
  }

  componentWillMount = () => {
    const currentConnections = this.getCurrentConnections().then(connections => {
      this.setState({
        currentConnections: connections,
        currentConnectionsInitialised: true,
      });
    });
    const availableConnections = this.scanConnections().then(connections => {
      this.setState({
        availableConnections: connections,
        availableConnectionsInitialised: true,
      });
    });

    Promise.all([
      currentConnections,
      availableConnections
    ])
    .then(values => {
      this.setState({
        initialised: true,
      })
    })
  }

  /**
   * Fetches the current WiFi connections information.
   * 
   * @returns {Array} - Connections information.
   */
  getCurrentConnections = () => {
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
  scanConnections = () => {
    return new Promise((resolve, reject) => {
      wifi.scan((error, connections) => {
        if (error) {
            reject();
        }
        resolve(Array.from(connections.reduce((m, c) => m.set(c.ssid, c), new Map()).values()));
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
  getCurrentSsidNames = () => (
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
  getSsidConfig = () => {
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
  setNewStatus = (ssidConfig, profile) => {
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
  isStatusPredefined = (status, currentSsid) => (
    !ssids.find(s => s.status === status && s.ssid !== currentSsid)
  )

  /**
   * Checks the status and updates it if all the conditions are matched.
   */
  checkCurrentStatus = () => {
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
          resolve(`Already up-to-date, status: ${emoji.get(status_emoji)}  ${status_text}`);
        }
      });
    });
  }

  /**
   * @param {Object} connection - Connection information.
   */
  renderConnection = connection => {
    return (
      <li
        key={connection.mac}
      >
        {connection.ssid}
      </li>
    );
  }

  renderCurrentConnections = () => {
    if (!this.state.currentConnectionsInitialised) {
      return <Loading />;
    }

    return (
      <ul>{
        this.state.currentConnections.map(connection => (
          this.renderConnection(connection)
        ))
      }</ul>
    );
  }

  renderAvailableConnections = () => {
    if (!this.state.availableConnectionsInitialised) {
      return <Loading />;
    }

    return (
      <ul>{
        this.state.availableConnections.map(connection => (
          this.renderConnection(connection)
        ))
      }</ul>
    );
  }

  renderConnections = () => {
    return (
      <div>
        <h3>Current connections:</h3>
        <div>{this.renderCurrentConnections()}</div>

        <h3>Available connections:</h3>
        <div>{this.renderAvailableConnections()}</div>
      </div>
    )
  }

  render = () => {
    return (
      <div className="myDiv">
        Hello world!
        {this.renderConnections()}
      </div>
    );
  }
}

export default App;
