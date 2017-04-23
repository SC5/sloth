import './App.css';

import React from 'react';

import * as utils from '../../utils';
const { SECOND, MINUTE } = utils.times

import { Layout, Menu, Table, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

const profileColumns = [{
  title: 'SSID',
  dataIndex: 'ssid',
  key: 'mac',
}];

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
    profile: {},
    profileInitialised: false,
    currentConnections: [],
    currentConnectionsInitialised: false,
    availableConnections: [],
    availableConnectionsInitialised: false,
    initialised: false,
  }

  componentWillMount = () => {
    const currentConnections    = this.getCurrentConnections();
    const availableConnections  = this.getAvailableConnections();
    const getCurrentProfile     = this.getCurrentStatus();

    Promise.all([
      currentConnections,
      availableConnections,
      getCurrentProfile,
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
    utils.getCurrentConnections().then(connections => {
      console.log('connections', connections);
      this.setState({
        currentConnections: connections,
        currentConnectionsInitialised: true,
      });
    });
  }

  getAvailableConnections = () => {
    utils.scanConnections().then(connections => {
      console.log('connections', connections);
      this.setState({
        availableConnections: connections,
        availableConnectionsInitialised: true,
      });
    });
  }

  getCurrentStatus = () => {
    utils.getCurrentStatus().then(profile => {
      console.log('profile', profile);
      this.setState({
        profile,
        profileInitialised: true,
      });
    });
  }

  renderCurrentProfile = () => {
    if (!this.state.profileInitialised) {
      return null;
    }

    return (
      <div className="header">
        <div className="user">
          <div className="avatar"><img src={this.state.profile.image_72} /></div>
          <div className="firstname">{this.state.profile.first_name}</div>
          <div className="lastname">{this.state.profile.last_name}</div>
        </div>
        <div className="status">
          <div className="emoji">{utils.getEmoji(this.state.profile.status_emoji)}</div>
          <div className="status">{this.state.profile.status_text}</div>
        </div>
      </div>
    )
  }

  renderCurrentConnections = () => (
    <Table
      loading={!this.state.currentConnectionsInitialised}
      columns={connectionColumns}
      dataSource={utils.sortConnections(this.state.currentConnections, 'ssid')}
      pagination={this.state.currentConnections.length < 10 ? false : true}
    />
  )

  renderAvailableConnections = () => (
    <Table
      loading={!this.state.availableConnectionsInitialised}
      columns={connectionColumns}
      dataSource={utils.sortConnections(this.state.availableConnections, 'ssid')}
      pagination={this.state.availableConnections.length < 10 ? false : true}
    />
  )

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
      <Layout>
        {/*
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            <Menu.Item key="1">
              <Icon type="user" />
              <span className="nav-text">nav 1</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera" />
              <span className="nav-text">nav 2</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="upload" />
              <span className="nav-text">nav 3</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="user" />
              <span className="nav-text">nav 4</span>
            </Menu.Item>
          </Menu>
        </Sider>
        */}
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
      </Layout>
    );
  }
}

export default App;
