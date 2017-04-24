import '../../../antd.less';
import './App.css';

import React from 'react';
import { FormattedRelative } from 'react-intl';
const socket = require('socket.io-client/lib/index')('http://localhost:5000');

import { Layout, notification, message } from 'antd';

import Emoji from '../../components/Emoji';
import Logged from '../Logged';
import Authorise from '../Authorise';

import Utils from '../../utils';
const utils = new Utils();

import * as constants from '../../utils/constants';
const {
  QUARTER_SECOND,
  SECOND,
  HALF_MINUTE,
  MINUTE
} = constants.TIMES;

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
    current: {
      fetched: false,
      connections: [],
      time: null,
    },
    available: {
      fetched: false,
      connections: [],
      time: null,
    },
    configurations: [],
    initialised: false,
    token: false,
    crontab: false,
    interval: 5,
  }

  componentWillMount = () => {
    this.getConfig()
      .then(config => this.setConfig(config))
      .then(() => {
        this.hasToken();

        const currentConnections    = this.getCurrentConnections();
        const availableConnections  = this.getAvailableConnections();
        const crontab               = this.getCrontab();        

        intervals.push(setInterval(() => this.getCurrentConnections(),    MINUTE * 3));
        intervals.push(setInterval(() => this.getAvailableConnections(),  MINUTE * 1));
        intervals.push(setInterval(() => this.getCrontab(),               HALF_MINUTE));
        
      })
      .catch(error => { throw new Error(error) })
    ;

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

  getConfig = () => (
    new Promise((resolve, reject) => {
      resolve(utils.getConfig());
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
      });
      setTimeout(() => {
        resolve();
      }, QUARTER_SECOND);
    })
  )

  hasToken = () => {
    if (this.state.token) {
      intervals.push(setInterval(() => this.getCurrentStatus(), MINUTE * this.state.interval));

      const emojis  = this.getEmojis();
      const profile = this.getCurrentStatus();

      Promise.all([
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

  getCurrentConnections = () => {
    return utils.getCurrentConnections().then(connections => {
      this.setState({
        current: {
          connections: connections,
          fetched: true,
          time: new Date(),
        }
      });
    });
  }

  getAvailableConnections = () => {
    return utils.scanConnections().then(connections => {
      this.setState({
        available: {
          connections: connections,
          fetched: true,
          time: new Date(),
        }
      });
    });
  }

  getCurrentStatus = () => {
    this.setState({
      profile: {
        ...this.state.profile,
        fetching: true,
      }
    })
    return utils.getCurrentStatus().then(profile => {
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
        fetching: true,
      }
    })
    return utils.getEmojis().then(emojis => {
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
    this.setState({ crontab: !!utils.checkCrontab() });
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

  /**
   * @param {Object} config - Configuration
   */
  saveToConfig = config => {
    utils.saveToConfig(config);
  }


  openNotification = data => {
    notification[data.type]({
      message: data.title,
      description: data.message,
      duration: 4.5
    });
  };

  openMessage = data => {
    message[data.type || 'info'](data.message);
  };

  render = () => {
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
        getCurrentStatus={this.getCurrentStatus}
        openNotification={this.openNotification}
        openMessage={this.openMessage}
        lastUpdate={this.lastUpdate}
        saveToConfig={this.saveToConfig}
        setCrontab={this.setCrontab}
      />
    )
  }
}

export default App;
