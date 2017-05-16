import React from 'react';
import { FormattedRelative } from 'react-intl';

import {
  Button,
  notification,
  message,
 } from 'antd';

import '../../../antd.less';
import './App.less';

import Loading from '../../components/Loading';
import Logged from '../Logged';
import Authorise from '../Authorise';

import Configs from '../../utils/Configs';
import Crontab from '../../utils/Crontab';
import Slack from '../../utils/Slack';
import Utils from '../../utils/Utils';
import Wifi from '../../utils/Wifi';

import * as constants from '../../utils/Constants';

const {
  QUARTER_SECOND,
  HALF_MINUTE,
  MINUTE,
} = constants.TIMES;


const socket = require('socket.io-client/lib/index')('http://localhost:5000');
const { ipcRenderer } = require('electron');

const PRODUCT_URL = constants.PRODUCT_URL;

const intervals = [];

class App extends React.Component {
  state = {
    profile: {
      data: null,
      time: null,
      fetching: false,
    },
    emojis: {
      data: null,
      time: null,
      fetching: false,
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
  };

  componentWillMount = () => {
    this.getConfig()
      .then(config => this.setConfig(config))
      .then(() => {
        this.hasToken();

        this.getConnections();
        this.getCrontab();

        intervals.push(setInterval(() => this.getConnections(), MINUTE));
        intervals.push(setInterval(() => this.getCrontab(), HALF_MINUTE));
      })
      .catch((error) => { throw new Error(error); })
    ;

    ipcRenderer.on('updates', (event, data) => {
      if (data.notification) {
        const buttons = {
          install: this.renderRestartButton(),
          update: this.renderUpdatesAvailableButton(),
        };

        notification[data.type]({
          message: data.title,
          description: <div dangerouslySetInnerHTML={{ __html: data.message }} />,
          duration: 0,
          btn: buttons[data.status],
          key: 'updates',
        });
      } else {
        message[data.type](data.message, data.duration);
      }
    });

    socket.emit('check updates', {});

    socket
      .on('status updated', () => {
        this.getCurrentStatus();
      })
      .on('authorised', () => {
        if (!this.state.token && !this.state.initialised) {
          this.getConfig()
            .then(config => this.setConfig(config))
            .then(() => this.hasToken())
            .catch((error) => { throw new Error(error); })
          ;
        }
      })
    ;
  }

  componentWillUnmount = () => {
    intervals.map(interval => (
      clearInterval(interval)
    ));
  }

  getConfig = () => (
    new Promise((resolve) => {
      resolve(Configs.load());
    })
  );

  getCrontab = () => {
    this.setState({ crontab: !!Crontab.check() });
  }

  /**
   * @param {Object} config - Configs.
   */
  setConfig = config => (
    new Promise((resolve) => {
      this.setState({
        token: !!config.token,
        configurations: config.ssids,
        defaultCollapsed: config.defaultCollapsed,
        interval: config.interval || this.state.interval,
        confLoaded: true,
      });
      setTimeout(() => {
        resolve();
      }, QUARTER_SECOND);
    })
  );

  /**
   * @param {Boolean} crontab - Is crontab installed or not.
   */
  setCrontab = (crontab) => {
    this.setState({ crontab });
  }

  getConnections = () => (
    new Promise((resolve) => {
      this.setState({
        connections: {
          ...this.state.connections,
          fetching: true,
        },
      });

      const current = Wifi.getCurrentConnections();
      const available = Wifi.scanConnections();

      Promise.all([
        current,
        available,
      ])
      .then((values) => {
        this.setState({
          connections: {
            data: [
              ...Utils.alphabeticSortByProperty(values[0], 'ssid'),
              ...Utils.alphabeticSortByProperty(values[1], 'ssid'),
            ],
            current: values[0][0],
            fetching: false,
            fetched: true,
            time: new Date(),
          },
        });
        resolve();
      });
    })
  );

  getCurrentStatus = () => {
    this.setState({
      profile: {
        ...this.state.profile,
        fetching: true,
      },
    });

    return Slack.loadStatus().then((profile) => {
      this.setState({
        profile: {
          data: profile,
          time: new Date(),
          fetching: false,
        },
      });
    });
  }

  getEmojis = () => {
    this.setState({
      emojis: {
        ...this.state.emojis,
        fetching: true,
      },
    });

    return Slack.getEmojis().then((emojis) => {
      this.setState({
        emojis: {
          data: emojis,
          time: new Date(),
          fetching: false,
        },
      });
    });
  }

  /**
   * @param {Date} time - Datetime.
   */
  lastUpdate = (time) => {
    if (time === null) {
      return null;
    }

    return <FormattedRelative value={time} />;
  }

  openNotification = (data) => {
    notification[data.type]({
      message: data.title,
      description: data.message,
      duration: data.duration !== undefined ? data.duration : 4.5,
      btn: data.button,
      key: data.key,
      onClose: data.onClose,
    });
  }

  closeNotification = (key) => {
    notification.close(key);
  }

  openMessage = (data) => {
    message[data.type || 'info'](data.message);
  }

  reloadAll = () => (
    new Promise(() => {
      this.setState({
        connections: {
          ...this.state.connections,
          fetched: false,
        },
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
            .then(() => (
              new Promise((resolve) => {
                resolve();
              })
            ));
        })
        .catch((error) => { throw new Error(error); })
      ;
    })
  )

  updateStatus = () => {
    this.setState({
      profile: {
        ...this.state.profile,
        fetching: true,
      },
    });

    const viaMac = this.state.configurations
      .find(s => s.mac.toLowerCase() === this.state.connections.current.mac.toLowerCase())
    ;
    const viaSsid = this.state.configurations
      .find(s => s.ssid.toLowerCase() === this.state.connections.current.ssid.toLowerCase())
    ;

    let ssidConfig;
    if (viaMac) {
      ssidConfig = viaMac;
    } else if (viaSsid) {
      ssidConfig = viaSsid;
    } else {
      ssidConfig = undefined;
    }

    return new Promise((resolve, reject) => {
      Slack.setStatus(ssidConfig, this.state.profile.data)
        .then(() => {
          this.getCurrentStatus().then(() => {
            resolve();
          });
        })
        .catch((reason) => {
          this.setState({
            profile: {
              ...this.state.profile,
              fetching: false,
            },
          });
          reject(reason);
        })
        ;
    });
  }

  hasToken = () => {
    if (this.state.token) {
      intervals.push(setInterval(() => this.getCurrentStatus(), MINUTE * this.state.interval));

      const emojis = this.getEmojis();
      this.getCurrentStatus();

      return Promise
        .all([
          emojis,
        ])
        .then(() => (
          new Promise((resolve) => {
            resolve(this.setState({ initialised: true }));
          })
        ))
      ;
    }

    return new Promise((resolve, reject) => {
      reject();
    });
  }

  /**
   * @param {Object} config - Configuration
   */
  saveToConfig = config => (
    new Promise((resolve) => {
      resolve(this.setConfig(Configs.save(config)));
    })
  );

  handleDownloadUpdate = () => {
    socket.emit('update', {});
    this.closeNotification('updates');
  }

  handleInstallUpdate = () => {
    socket.emit('install update', {});
    this.closeNotification('updates');
  }

  handleViewReleases = (event) => {
    Utils.electronOpenLinkInBrowser(PRODUCT_URL, event);
    this.closeNotification('updates');
  }

  /**
   * @param {Array} keys - Expanded panels.
   */
  saveDefaultCollapse = (keys) => {
    this.setState({
      defaultCollapsed: keys,
    });
  }

  renderUpdatesAvailableButton = () => (
    <div className="update-buttons">
      <Button type="default" icon="link" onClick={event => this.handleViewReleases(event)}>
        View releases
      </Button>
      <Button type="primary" icon="link" onClick={() => this.handleDownloadUpdate()}>
        Update
      </Button>
    </div>
  );

  renderRestartButton = () => (
    <div className="update-buttons">
      <Button type="primary" icon="link" onClick={() => this.handleInstallUpdate()}>
        Restart and update
      </Button>
    </div>
  );

  render = () => {
    if (!this.state.confLoaded) {
      return (
        <Loading />
      );
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
    );
  }
}

export default App;
