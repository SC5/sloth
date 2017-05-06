import '../../../antd.less';
import './App.less';

import React from 'react';
import { FormattedRelative } from 'react-intl';
const socket = require('socket.io-client/lib/index')('http://localhost:5000');
const { ipcRenderer } = require('electron');

import {
  Layout,
  Button,
  notification,
  message
 } from 'antd';

import Loading from '../../components/Loading';
import Emoji from '../../components/Emoji';
import Logged from '../Logged';
import Authorise from '../Authorise';

import Configs from '../../utils/Configs';
import Crontab from '../../utils/Crontab';
import Slack from '../../utils/Slack';
import Emojis from '../../utils/Emojis';
import Utils from '../../utils/Utils';
import Wifi from '../../utils/Wifi';

import * as constants from '../../utils/Constants';
const {
  QUARTER_SECOND,
  SECOND,
  HALF_MINUTE,
  MINUTE
} = constants.TIMES;

const PRODUCT_URL = constants.PRODUCT_URL;

const intervals = [];

class App extends React.Component {
  state = {
    profile: {
      data: null,
      time: null,
      fetching: false
    },
    emojis: {
      data: null,
      time: null,
      fetching: false
    },
    connections: {
      fetching: true,
      fetched: false,
      data: [],
      time: null,
      current: null,
    },
    configurations: [],
    initialised: false,
    token: false,
    crontab: false,
    interval: 5,
    confLoaded: false,
  }

  componentWillMount = () => {
    this.getConfig()
      .then(config => this.setConfig(config))
      .then(() => {
        this.hasToken();

        const connections   = this.getConnections();
        const crontab       = this.getCrontab();

        intervals.push(setInterval(() => this.getConnections(), MINUTE));
        intervals.push(setInterval(() => this.getCrontab(),     HALF_MINUTE));

      })
      .catch(error => { throw new Error(error) })
    ;

    ipcRenderer.on('updates', (event, data) => {
      if (data.notification) {
        notification[data.type]({
          message: data.title,
          description: <div dangerouslySetInnerHTML={{__html: data.message}} />,
          duration: 0,
          btn: this.renderUpdatesAvailableButton(),
          key: 'updates',
        });
      }
      else {
        message[data.type](data.message, data.duration);
      }
    })

    socket
      .on('authorised', data => {
        if (!this.state.token && !this.state.initialised) {
          this.getConfig()
            .then(config => this.setConfig(config))
            .then(() => this.hasToken())
            .catch(error => { throw new Error(error) })
          ;
        }
      })
    ;
  }

  componentWillUnmount = () => {
    intervals.map(interval => {
      clearInterval(interval);
    });
  }

  handleViewReleases = event => {
    Utils.electronOpenLinkInBrowser(PRODUCT_URL, event);
    this.closeNotification('updates');
  }

  getConfig = () => (
    new Promise((resolve, reject) => {
      resolve(Configs.load());
    })
  )

  /**
   * @param {Object} config - Configs.
   */
  setConfig = config => (
    new Promise((resolve, reject) => {
      this.setState({
        token: !!config.token,
        configurations: config.ssids,
        defaultCollapsed: config.defaultCollapsed,
        interval: config.interval || this.state.interval,
        confLoaded: true,
      });
      setTimeout(() => {
        resolve();
      }, QUARTER_SECOND);
    })
  )

  /**
   * @param {Object} config - Configuration
   */
  saveToConfig = config => (
    new Promise((resolve, reject) => {
      resolve(this.setConfig(Configs.save(config)));
    })
  )

  hasToken = () => {
    if (this.state.token) {
      intervals.push(setInterval(() => this.getCurrentStatus(), MINUTE * this.state.interval));

      const emojis  = this.getEmojis();
      const profile = this.getCurrentStatus();

      return Promise.all([
        emojis
      ])
      .then(values => (
        new Promise((resolve, reject) => {
          resolve(this.setState({ initialised: true }))
        })
      ))
    }
  }

  /**
   * @param {Boolean} crontab - Is crontab installed or not.
   */
  setCrontab = crontab => {
    this.setState({ crontab });
  }

  getConnections = () => (
    new Promise((resolve, reject) => {
      this.setState({
        connections: {
          ...this.state.connections,
          fetching: true,
        }
      });

      const current = Wifi.getCurrentConnections();
      const available = Wifi.scanConnections();

      Promise.all([
        current,
        available
      ])
      .then(values => {
        this.setState({
          connections: {
            data: [
              ...Utils.alphabeticSortByProperty(values[0], 'ssid'),
              ...Utils.alphabeticSortByProperty(values[1], 'ssid')
            ],
            current: values[0][0],
            fetching: false,
            fetched: true,
            time: new Date,
          }
        });
        resolve();
      });
    })
  )

  updateStatus = () => {
    this.setState({
      profile: {
        ...this.state.profile,
        fetching: true,
      }
    });

    const viaMac = this.state.configurations.find(s =>s.mac.toLowerCase() === this.state.connections.current.mac.toLowerCase());
    const viaSsid = this.state.configurations.find(s => s.ssid.toLowerCase() === this.state.connections.current.ssid.toLowerCase());

    let ssidConfig;
    if (viaMac) {
      ssidConfig = viaMac;
    }
    else if (viaSsid) {
      ssidConfig = viaSsid;
    }
    else {
      ssidConfig = undefined;
    }

    return new Promise((resolve, reject) => {
      Slack.setStatus(ssidConfig, this.state.profile.data)
        .then(response => {
          this.getCurrentStatus().then(() => {
            resolve();
          });
        })
        .catch(reason => {
          this.setState({
            profile: {
              ...this.state.profile,
              fetching: false,
            }
          });
          reject(reason);
        })
      ;
    });
  }

  reloadAll = () => (
    new Promise((resolve, reject) => {
      this.setState({
        connections: {
          ...this.state.connections,
          fetched: false,
        }
      });
      this.getConfig()
        .then(config => this.setConfig(config))
        .then(() => {
          const emojis = this.getEmojis();
          const profile = this.getCurrentStatus();
          const crontab = this.getCrontab();
          const connections = this.getConnections();

          return Promise
            .all([
              emojis,
              profile,
              crontab,
              connections,
            ])
            .then(values => (
              new Promise((resolve, reject) => {
                resolve()
              })
            ))
        })
        .catch(error => { throw new Error(error) })
      ;
    })
  )

  getCurrentStatus = () => {
    this.setState({
      profile: {
        ...this.state.profile,
        fetching: true,
      }
    })
    return Slack.loadStatus().then(profile => {
      this.setState({
        profile: {
          data: profile,
          time: new Date(),
          fetching: false,
        }
      });
    });
  }

  getEmojis = () => {
    this.setState({
      emojis: {
        ...this.state.emojis,
        fetching: true,
      }
    })
    return Slack.getEmojis().then(emojis => {
      this.setState({
        emojis: {
          data: emojis,
          time: new Date(),
          fetching: false,
        }
      });
    });
  }

  getCrontab = () => {
    this.setState({ crontab: !!Crontab.check() });
  }

  /**
   * @param {Date} time - Datetime.
   */
  lastUpdate = time => {
    if (time === null) {
      return null;
    }

    return <FormattedRelative value={time} />;
  }

  /**
   * @param {Array} keys - Expanded panels.
   */
  saveDefaultCollapse = keys => {
    this.setState({
      defaultCollapsed: keys,
    })
  }


  openNotification = data => {
    notification[data.type]({
      message: data.title,
      description: data.message,
      duration: data.duration !== undefined ? data.duration : 4.5,
      btn: data.button,
      key: data.key,
      onClose: data.onClose,
    });
  };

  closeNotification = key => {
    notification.close(key);
  };

  openMessage = data => {
    message[data.type || 'info'](data.message);
  };

  renderUpdatesAvailableButton = () => (
    <Button type="primary" icon="link" onClick={event => this.handleViewReleases(event)}>View releases</Button>
  )

  render = () => {
    if (!this.state.confLoaded) {
      return (
        <Loading />
      )
    }
    if (!this.state.token) {
      return (
        <Authorise
          openNotification={this.openNotification}
          openMessage={this.openMessage}
        />
      );
    }

    return (
      <Logged
        {...this.state}
        reloadAll={this.reloadAll}
        getCurrentStatus={this.getCurrentStatus}
        openNotification={this.openNotification}
        closeNotification={this.closeNotification}
        openMessage={this.openMessage}
        lastUpdate={this.lastUpdate}
        saveToConfig={this.saveToConfig}
        setCrontab={this.setCrontab}
        updateStatus={this.updateStatus}
      />
    )
  }
}

export default App;
