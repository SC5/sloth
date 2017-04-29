import './Logged.css';

import React from 'react';

import Emoji from '../../components/Emoji';
import Authorise from '../Authorise';
import Configuration from '../../components/Configuration';

import Utils from '../../utils';
const utils = new Utils();

import * as constants from '../../utils/constants';
const { SECOND, MINUTE } = constants.TIMES;

import {
  Layout,
  Menu,
  Table,
  Icon,
  Spin,
  Collapse,
  Button,
  Dropdown,
  Popover,
  Modal,
  Form,
  Input,
  Select,
} from 'antd';
const { Header, Content, Footer, Sider } = Layout;
const Panel = Collapse.Panel;
const confirm = Modal.confirm;

const NOOP = () => { };

class Logged extends React.Component {
  state = {
    install: false,
    reinstall: false,
    uninstall: false,
    modal: {
      title: 'Create new configuration',
      data: [],
      visible: false,
      handleOk: NOOP,
      handleCancel: NOOP,
    },
    edit: {
      ssid: null,
      icon: null,
      status: null,
    }
  }

  componentDidMount = () => {
    if (this.props.token) {
      utils.checkCurrentStatus()
      .then(output => {
        if (!output.match(/^Already up-to-date/)) {
          this.props.getCurrentStatus();
        }
      })
    }
  }

  handleInstall = () => {
    if (!this.state.install) {
      this.setState({ install: true });
      const status = utils.installCrontab();

      if (
        status.match(/^Installed in crontab/)
        || status.match(/^Already installed in crontab/)
      ) {
        this.props.setCrontab(true);
      }

      this.setState({ install: false });
      this.props.openMessage({
        type: 'success',
        title: 'Crontab',
        message: 'Crontab succesfully installed.'
      });
    }
  }

  handleReinstall = () => {
    if (!this.state.reinstall) {
      this.setState({ reinstall: true });
      const status = utils.reinstallCrontab();

      if (
        status.match(/^Reinstalled in crontab/)
        || status.match(/^Installed in crontab/)
      ) {
        this.props.setCrontab(true);
      }

      this.setState({ reinstall: false });
      this.props.openMessage({
        type: 'success',
        title: 'Crontab',
        message: 'Crontab succesfully reinstalled.'
      });
    }
  }

  handleUninstall = () => {
    if (!this.state.uninstall) {
      this.setState({ uninstall: true });
      const status = utils.uninstallCrontab();

      if (
        status.match(/^Uninstalled from crontab/)
        || status.match(/^Was not installed in crontab/)
      ) {
        this.props.setCrontab(false);
      }

      this.setState({ uninstall: false });
      this.props.openMessage({
        type: 'success',
        title: 'Crontab',
        message: 'Crontab succesfully uninstalled.'
      });
    }
  }

  handleModalSaveNew = () => {
    this.props.saveToConfig({
      ssids: [
        ...this.props.configurations,
        this.state.edit
      ]
    });
    this.closeModal();
  }

  handleModalSaveOld = () => {
    this.props.saveToConfig({
      ssids: this.props.configurations.map(config => {
        if (config.ssid.toLowerCase() === this.state.edit.ssid.toLowerCase()) {
          return this.state.edit;
        }
        return config;
      })
    });
    this.closeModal();
  }

  handleModalCancel = () => {
    this.closeModal();
  }

  /**
   * @param {String} action - Which action should we trigger.
   * @param {Object} record - Configuration row data.
   */
  handleConfigurationButton = (action, record = undefined) => {
    const parent = this;

    switch (action) {
      case 'create': {
        this.setState({
          edit: {
            ssid: record.ssid,
            icon: null,
            status: null,
          },
          modal: {
            title: `Create configuration for "${record.ssid}"`,
            data: {
              ssid: record.ssid,
              icon: null,
              status: null,
            },
            visible: true,
            handleOk: () => this.handleModalSaveNew(),
            handleCancel: () => this.handleModalCancel(),
          }
        });
        break;
      }
      case 'edit': {
        const config = this.props.configurations.find(conf => conf.ssid.toLowerCase() === record.ssid.toLowerCase());

        this.setState({
          edit: {
            ssid: config.ssid,
            icon: config.icon,
            status: config.status,
          },
          modal: {
            title: `Edit configuration for "${record.ssid}"`,
            data: config,
            visible: true,
            handleOk: () => this.handleModalSaveOld(),
            handleCancel: () => this.handleModalCancel(),
          }
        });
        break;
      }
      case 'delete': {
        confirm({
          title: `Are you sure delete configurations for "${record.ssid}"?`,
          onOk() {
            parent.props.saveToConfig({
              ssids: parent.props.configurations.filter(config => config.ssid.toLowerCase() !== record.ssid.toLowerCase())
            });
          },
          onCancel() {
            
          },
        });

        break;
      }
      default: {
        break;
      }
    }
  }

  closeModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        visible: false,
        handleOk: NOOP,
        handleCancel: NOOP,
      }
    });
  }

  updateData = (property, value) => {
    this.setState({
      edit: {
        ...this.state.edit,
        [property]: value,
      }
    });
  }

  /**
   * @param {Object} record - Configuration row data.
   */
  tableButton = (record = undefined) => {
    if (record) {
      let hasConfig = undefined;
      let menu = undefined;
      let edit = undefined;

      if (this.props.configurations && this.props.configurations.length > 0) {
        hasConfig = this.props.configurations.find(conf => conf.ssid.toLowerCase() === record.ssid.toLowerCase());

        menu = (
          <Menu onClick={e => this.handleConfigurationButton(e.key, record)}>
            <Menu.Item key="delete">
              Delete
            </Menu.Item>
          </Menu>
        );

        edit = (
          <Dropdown.Button trigger="hover" onClick={() => this.handleConfigurationButton('edit', record)} overlay={menu}>
            Edit
          </Dropdown.Button>
        );
      }

      const create = (
        <Button onClick={() => this.handleConfigurationButton('create', record)}>
          Create
        </Button>
      );

      return (
        <span>
          {hasConfig ? edit : create}
        </span>
      );
    }

    return null;
  }

  getConfigurationColumns = () => (
    [{
      title: 'SSID',
      dataIndex: 'ssid',
    }, {
      title: 'Icon',
      className: 'icon',
      dataIndex: 'icon',
      render: (text, record) => <Emoji emojis={this.props.emojis.data} emoji={record.icon} />,
    }, {
      title: 'Status',
      className: 'status',
      dataIndex: 'status',
    }, {
      title: 'Action',
      key: 'action',
      className: 'action',
      rowKey: record => `connected-action-${record.ssid}`,
      render: (text, record) => this.tableButton(record)
    }]
  )

  getConnectionColumns = () => {
    const ssidTooltip = ssidConfig => (
      <table className="tooltip-table">
        <tr>
          <th>SSID:</th>
          <td>{ssidConfig.ssid}</td>
        </tr>
        <tr>
          <th>MAC:</th>
          <td>{ssidConfig.mac.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Security:</th>
          <td>{ssidConfig.security.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Signal level:</th>
          <td>{Math.abs(ssidConfig.signal_level)} dB</td>
        </tr>
      </table>
    );

    const getConfig = ssid => (
      this.props.configurations.find(c => c.ssid.toLowerCase() === ssid.toLowerCase())
    )

    return ([
      {
        title: 'SSID',
        dataIndex: 'ssid',
          render: (text, record) => (
            <Popover content={ssidTooltip(record)}>
              {text}
            </Popover>
          ),
      },
      {
        title: 'Icon',
        className: 'icon',
        dataIndex: 'icon',
        render: (text, record) => {
          const config = getConfig(record.ssid);
          if (config) {
            return (
              <Emoji emojis={this.props.emojis.data} emoji={config.icon} />
            );
          }
        },
      },
      {
        title: 'Status',
        className: 'status',
        dataIndex: 'status',
        render: (text, record) => {
          const config = getConfig(record.ssid);
          if (config && config.status) {
            return config.status;
          }
          return '';
        }
      },
      {
        title: 'Action',
        key: 'action',
        className: 'action',
        rowKey: record => `connected-action-${record.ssid}`,
        render: (text, record) => this.tableButton(record)
      }
    ]);
  }

  getProfile = () => {
    if (!this.props.profile.data) {
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
            <div className="avatar"><img src={this.props.profile.data.image_72} /></div>
          </div>
        </div>
        <div className="column-right">
          <div className="user">
            <div className="firstname">{this.props.profile.data.first_name}</div>
            <div className="lastname">{this.props.profile.data.last_name}</div>
          </div>
          <div className="status">
            <div className="emoji">
              <Emoji
                emojis={this.props.emojis.data}
                emoji={this.props.profile.data.status_emoji}
              />
              </div>
            <div className="status">{this.props.profile.data.status_text}</div>
          </div>
        </div>
      </div>
    );
  }

  checkCrontabStatus = () => {
    if (!this.props.crontab) {
      return (
        <div className="status not-installed">
          <Icon type="close-circle" /> Not installed
        </div>
      );
    }

    return (
      <div className="status installed">
        <Icon type="check-circle-o" /> Installed
      </div>
    );
  }

  crontabStatusIcon = () => {
    if (this.props.crontab) {
      return (
        <div className="status installed">
          <Icon type="check-circle" />
        </div>
      );
    }
  }

  configurationStatusIcon = () => {
    if (this.props.configurations && this.props.configurations.length > 0) {
      return (
        <div className="status installed">
          <Icon type="check-circle" />
        </div>
      );
    }
  }

  isButtonsDisabled = state => {
    switch (state) {
      case 'install': {
        return this.state.reinstall || this.state.uninstall;
      }
      case 'reinstall': {
        return this.state.install || this.state.uninstall;
      }
      case 'uninstall': {
        return this.state.install || this.state.reinstall;
      }
      default: {
        break;
      }
    }
  }

  renderConfigurationsTable = () => {
    if (!this.props.configurations || this.props.configurations.length < 1) {
      return <span>Nothing here.</span>;
    }

    return (
      <Table
        columns={this.getConfigurationColumns()}
        dataSource={utils.alphabeticSortByProperty(this.props.configurations, 'ssid')}
        pagination={this.props.configurations.length < 10 ? false : true}
        rowKey={record => `configuration-ssid-${record.ssid}`}
      />
    );
  }

  renderConnectionsTable = () => {
    if (this.props.connections.fetched && (!this.props.connections.data || this.props.connections.data.length < 1)) {
      return <span>No Data</span>;
    }

    return (
      <Table
        loading={this.props.connections.fetching}
        columns={this.getConnectionColumns()}
        dataSource={this.props.connections.data}
        pagination={this.props.connections.data.length < 10 ? false : true}
        rowKey={record => `connections-ssid-${record.ssid}`}
      />
    );
  }

  renderProfileFetched = () => {
    if (!this.props.profile.time) {
      return null;
    }

    return (
      <div className="update">
        <span>Fetched: {this.props.lastUpdate(this.props.profile.time)}</span>
      </div>
    );
  }

  renderCurrentProfile = () => {
    return (
      <div className="header">
        <div className="title">
          <div className="text">
            {this.getProfile()}
          </div>
          {this.renderProfileFetched()}
        </div>
      </div>
    )
  }

  renderCrontabButtons = () => {
    if (!this.props.crontab) {
      return (
        <div className="buttons">
          <Button icon="plus" disabled={this.isButtonsDisabled('install')} loading={this.state.install} onClick={() => this.handleInstall()} type="primary">Install</Button>
        </div>
      );
    }

    return (
      <div className="buttons">
        <Button icon="close" disabled={this.isButtonsDisabled('uninstall')} loading={this.state.uninstall} onClick={() => this.handleUninstall()} type="danger">Uninstall</Button>
        <Button icon="reload" disabled={this.isButtonsDisabled('reinstall')} loading={this.state.reinstall} onClick={() => this.handleReinstall()}>Reinstall</Button>
      </div>
    );
  }

  renderAutomationContent = () => {
    return (
      <div className="crontab">
        {this.checkCrontabStatus()}
        {this.renderCrontabButtons()}
      </div>
    );
  }

  renderAutomation = () => {
    return (
      <Panel
        header={
          <div className="header-text">
            Automation
            {this.crontabStatusIcon()}
          </div>
        }
        key="1"
      >
        {this.renderAutomationContent()}
      </Panel>
    )
  }

  renderConfigurations = () => {
    return (
      <Panel
        header={
          <div className="header-text">
            Configurations
            {this.configurationStatusIcon()}
          </div>
        }
        key="2"
      >
        {this.renderConfigurationsTable()}
      </Panel>
    )
  }

  renderLastUpdate = time => {
    if (time === null) {
      return null;
    }

    return (
      <div className="update"><span>Last update: {this.props.lastUpdate(time)}</span></div>
    );
  }

  renderConnections = () => {
    return (
      <Panel
        header={
          <div className="header-text">
            Connections
            {this.renderLastUpdate(this.props.connections.time)}
          </div>
        }
        key="3"
      >
        {this.renderConnectionsTable()}
      </Panel>
    )
  }

  renderModal = () => {
    if (!this.state.modal.visible) {
      return null;
    }

    return (
      <Modal
        title={this.state.modal.title}
        visible={this.state.modal.visible}
        onOk={this.state.modal.handleOk}
        onCancel={this.state.modal.handleCancel}
      >
        <Configuration
          data={this.state.modal.data}
          emojis={this.props.emojis.data}
          updateData={this.updateData}
        />
      </Modal>
    );
  }

  render = () => {
    if (!this.props.initialised) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    }

    return (
      <Layout id="logged">
        <Header>
          {this.renderCurrentProfile()}
        </Header>
        <Content>
          <Collapse defaultActiveKey={this.props.defaultCollapsed} onChange={keys => this.props.saveToConfig({defaultCollapsed: keys})}>
            {this.renderAutomation()}
            {this.renderConfigurations()}
            {this.renderConnections()}
          </Collapse>
          {this.renderModal()}
        </Content>
        <Footer>
          <a href="http://github.com/kirbo" onClick={utils.electronOpenLinkInBrowser.bind(this)}>Kimmo Saari ©2017</a>
        </Footer>
      </Layout>
    );
  }
}

export default Logged;
