import './App.css';

import React from 'react';
import { FormattedRelative } from 'react-intl';

import * as utils from '../../utils';
const { SECOND, MINUTE } = utils.times

import { Layout, Menu, Table, Icon, Spin } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

const connectionColumns = [{
  title: 'SSID',
  dataIndex: 'ssid',
  key: 'mac',
}, {
  title: 'Action',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="#">Action 一 {record.ssid}</a>
      <span className="ant-divider" />
      <a href="#">Delete</a>
      <span className="ant-divider" />
      <a href="#" className="ant-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  ),
}];

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
    initialised: false,
  }

  componentWillMount = () => {
    const currentConnections    = this.getCurrentConnections();
    const availableConnections  = this.getAvailableConnections();
    const profile               = this.getCurrentStatus();
    const emojis                = this.getEmojis();

    Promise.all([
      currentConnections,
      availableConnections,
      profile,
      emojis,
    ])
    .then(values => {
      this.setState({
        initialised: true,
      })
    })
  }

  componentDidMount = () => {
    setInterval(() => this.getCurrentConnections(),     1 * MINUTE);
    setInterval(() => this.getAvailableConnections(),   1 * MINUTE);
    setInterval(() => this.getCurrentStatus(),          5 * MINUTE);
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

  getProfile = () => {
    if (!this.state.profile.data) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    }

    return (
      <div className="profile">
        <div className="column-left">
          <div className="user">
            <div className="avatar"><img src={this.state.profile.data.image_72} /></div>
            <div className="firstname">{this.state.profile.data.first_name}</div>
            <div className="lastname">{this.state.profile.data.last_name}</div>
          </div>
        </div>
        <div className="column-right">
          <div className="status">
            <div className="emoji">{this.getEmoji(this.state.profile.data.status_emoji)}</div>
            <div className="status">{this.state.profile.data.status_text}</div>
          </div>
        </div>
      </div>
    );
  }

  getEmoji = emoji => {
    const strippedEmoji = emoji.replace(/:/g, '');
    const source = this.state.emojis.data[strippedEmoji];

    if (source) {
      return (
        <img className="emoji" src={source} />
      );
    }

    return utils.getEmoji(emoji);
  }

  renderCurrentConnections = () => (
    <Table
      loading={!this.state.current.fetched}
      columns={connectionColumns}
      dataSource={utils.sortConnections(this.state.current.connections, 'ssid')}
      pagination={this.state.current.connections.length < 10 ? false : true}
    />
  )

  renderAvailableConnections = () => (
    <Table
      loading={!this.state.available.fetched}
      columns={connectionColumns}
      dataSource={utils.sortConnections(this.state.available.connections, 'ssid')}
      pagination={this.state.available.connections.length < 10 ? false : true}
    />
  )

  renderLastUpdate = time => {
    if (time === null) {
      return null;
    }

    return <FormattedRelative value={time} />;
  }

  renderCurrentProfile = () => {
    return (
      <div className="header">
        <div className="title">
          <div className="text">Profile</div>
          <div className="update"><span>Fetched: {this.renderLastUpdate(this.state.profile.time)}</span></div>
        </div>
        {this.getProfile()}
      </div>
    )
  }

  renderConnections = () => {
    return (
      <div>
        <div className="title">
          <div className="text">Current connections</div>
          <div className="update"><span>Last update: {this.renderLastUpdate(this.state.current.time)}</span></div>
        </div>
        <div>{this.renderCurrentConnections()}</div>

        <div className="title">
          <div className="text">Available connections</div>
          <div className="update"><span>Last update: {this.renderLastUpdate(this.state.available.time)}</span></div>
        </div>
        <div>{this.renderAvailableConnections()}</div>
      </div>
    )
  }

  render = () => {
    if (!this.state.initialised) {
      return null;
    }

    return (
      <Layout>
        <Header>
          {this.renderCurrentProfile()}
        </Header>
        <Content>
          <div>
            {this.renderConnections()}
          </div>
        </Content>
        <Footer>
          Kimmo Saari ©2017 Created by Ant UED
        </Footer>
      </Layout>
    );
  }
}

export default App;
