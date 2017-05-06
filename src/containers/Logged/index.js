import './Logged.less';

import React from 'react';
import { Icon as FaIcon } from 'react-fa';
import { v4 as uuid } from 'uuid';

import Loading from '../../components/Loading';
import Emoji from '../../components/Emoji';
import Authorise from '../Authorise';
import Configuration from '../../components/Configuration';

import Crontab from '../../utils/Crontab';
import Utils from '../../utils/Utils';
import Slack from '../../utils/Slack';

import * as constants from '../../utils/Constants';
const { SECOND, MINUTE } = constants.TIMES;

import {
  Layout,
  Menu,
  Table,
  Icon,
  Collapse,
  Button,
  Dropdown,
  Popover,
  Modal,
  Form,
  Input,
  Select,
  Badge,
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
      name: null,
      ssid: null,
      mac: null,
      icon: null,
      status: null,
    }
  }

  componentDidMount = () => {
    if (this.props.token) {
      Slack.checkStatus()
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
      const status = Crontab.install();

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
      const status = Crontab.reinstall();

      if (
        status.match(/^Reinstalled in crontab/)
        || status.match(/^Installed in crontab/)
      ) {
        this.props.setCrontab(true);
      }

      this.props.closeNotification('notification-crontab-fail');

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
      const status = Crontab.uninstall();

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
    })
    .then(() => {
      if (
        this.state.edit.mac.toLowerCase() === this.props.connections.current.mac.toLowerCase()
        || this.state.edit.ssid.toLowerCase() === this.props.connections.current.ssid.toLowerCase()
      ) {
        this.updateStatus();
      } else {
        this.props.openMessage({
          type: 'info',
          message: 'Succesfully created'
        });
      }
      this.closeModal();
    });
  }

  handleModalSaveOld = () => {
    this.props.saveToConfig({
      ssids: this.props.configurations.map(config => {
        if (
          config.mac.toLowerCase() === this.state.edit.mac.toLowerCase()
          || config.ssid.toLowerCase() === this.state.edit.ssid.toLowerCase()
        ) {
          return this.state.edit;
        }
        return config;
      })
    })
    .then(() => {
      if (
        this.state.edit.mac.toLowerCase() === this.props.connections.current.mac.toLowerCase()
        || this.state.edit.ssid.toLowerCase() === this.props.connections.current.ssid.toLowerCase()
      ) {
        this.updateStatus();
      } else {
        this.props.openMessage({
          type: 'info',
          message: 'Succesfully edited'
        });
      }
      this.closeModal();
    });
  }

  handleModalCancel = () => {
    this.closeModal();
  }

  /**
   * @param {String} action - Which action should we trigger.
   * @param {Object} record - Configuration row data.
   */
  handleConfigurationButton = (action, record = undefined, config = undefined) => {
    const parent = this;

    switch (action) {
      case 'add': {
        this.setState({
          edit: {
            uuid: uuid(),
            name: '',
            ssid: '',
            mac: '',
            icon: '',
            status: null,
          },
          modal: {
            title: 'Create new configuration',
            data: {
              uuid: uuid(),
              name: '',
              ssid: '',
              mac: '',
              icon: '',
              status: null,
            },
            visible: true,
            handleOk: () => this.handleModalSaveNew(),
            handleCancel: () => this.handleModalCancel(),
          }
        });
        break;
      }
      case 'create': {
        this.setState({
          edit: {
            uuid: uuid(),
            name: '',
            ssid: record.ssid,
            mac: record.mac,
            icon: '',
            status: null,
          },
          modal: {
            title: `Create configuration for "${record.ssid}"`,
            data: {
              uuid: uuid(),
              name: '',
              ssid: record.ssid,
              mac: record.mac,
              icon: '',
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
        this.setState({
          edit: {
            uuid: config.uuid,
            name: config.name,
            ssid: config.ssid,
            mac: config.mac,
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
              ssids: parent.props.configurations.filter(conf => conf.uuid !== config.uuid)
            })
            .then(() => {
              parent.props.openMessage({
                type: 'info',
                message: 'Succesfully deleted'
              });
            })
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
  tableButton = (record = undefined, config) => {
    if (record) {
      let menu = undefined;
      let edit = undefined;

      if (this.props.configurations && this.props.configurations.length > 0 && config && config.mac !== record.mac) {
        menu = (
          <Menu onClick={e => this.handleConfigurationButton(e.key, record, config)}>
            <Menu.Item key="edit">
              Edit
            </Menu.Item>
            <Menu.Item key="delete">
              Delete
            </Menu.Item>
          </Menu>
        );

        edit = (
          <Dropdown.Button trigger="hover" onClick={() => this.handleConfigurationButton('create', record, config)} overlay={menu}>
            Create
          </Dropdown.Button>
        );
      }
      else if (this.props.configurations && this.props.configurations.length > 0) {
        menu = (
        <Menu onClick={e => this.handleConfigurationButton(e.key, record, config)}>
            <Menu.Item key="delete">
              Delete
            </Menu.Item>
          </Menu>
        );

        edit = (
          <Dropdown.Button trigger="hover" onClick={() => this.handleConfigurationButton('edit', record, config)} overlay={menu}>
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
          {config ? edit : create}
        </span>
      );
    }

    return null;
  }

  /**
   * @param {Object} record - Current row.
   */
  isConnected = record => {
    if (
      record
      && this.props.connections.current
      && (
        (
          this.props.connections.current.mac
          && record.mac.toLowerCase() === this.props.connections.current.mac.toLowerCase()
        )
        || (
          this.props.connections.current.ssid
          && record.ssid.toLowerCase() === this.props.connections.current.ssid.toLowerCase()
        )
      )
    ) {
      return (
        <Popover placement="topLeft" content="Currently connected">
          <FaIcon name="wifi" />
        </Popover>
      );
    }

    return null;
  }

  getConfigurationColumns = () => {
    const ssidTooltip = ssidConfig => (
      <table className="tooltip-table">
        <tr>
          <th>SSID:</th>
          <td>{ssidConfig.ssid.toUpperCase()}</td>
        </tr>
        <tr>
          <th>BSSID:</th>
          <td>{ssidConfig.mac.toUpperCase()}</td>
        </tr>
      </table>
    );

    return ([
      {
        title: '',
        className: 'connected',
        render: (text, record) => this.isConnected(record),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => (
          <Popover placement="topLeft" content={ssidTooltip(record)}>
            {text}
          </Popover>
        ),
      },
      {
        title: 'Icon',
        className: 'icon',
        dataIndex: 'icon',
        render: (text, record) => <Emoji emojis={this.props.emojis.data} emoji={record.icon} />,
      },
      {
        title: 'Status',
        className: 'status',
        dataIndex: 'status',
      },
      {
        title: 'Action',
        key: 'action',
        className: 'action',
        rowKey: record => `connected-action-${record.uuid}`,
        render: (text, record) => this.tableButton(record, record)
      }
    ])
  }

  getConnectionColumns = () => {
    const ssidTooltip = ssidConfig => (
      <table className="tooltip-table">
        <tr>
          <th>SSID:</th>
          <td>{ssidConfig.ssid}</td>
        </tr>
        <tr>
          <th>BSSID:</th>
          <td>{ssidConfig.mac.toUpperCase()}</td>
        </tr>
      </table>
    );

    const getConfig = record => {
      const viaMacAndSsid = this.props.configurations.find(c => c.mac.toLowerCase() === record.mac.toLowerCase() && c.ssid.toLowerCase() === record.ssid.toLowerCase());
      if (viaMacAndSsid) {
        return viaMacAndSsid;
      }

      const viaMac = this.props.configurations.find(c => c.mac.toLowerCase() === record.mac.toLowerCase());
      if (viaMac) {
        return viaMac;
      }

      const viaSsid = this.props.configurations.find(c => c.ssid.toLowerCase() === record.ssid.toLowerCase());
      if (viaSsid) {
        return viaSsid;
      }

      return undefined;
    }

    return ([
      {
        title: '',
        className: 'connected',
        render: (text, record) => this.isConnected(record),
      },
      {
        title: 'SSID',
        dataIndex: 'ssid',
        render: (text, record) => (
          <Popover placement="topLeft" content={ssidTooltip(record)}>
            {text}
          </Popover>
        ),
      },
      {
        title: 'Icon',
        className: 'icon',
        dataIndex: 'icon',
        render: (text, record) => {
          const config = getConfig(record);
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
          const config = getConfig(record);
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
        rowKey: record => `connected-action-${record.ssid}-${record.mac}`,
        render: (text, record) => this.tableButton(record, getConfig(record))
      }
    ]);
  }

  getProfile = () => {
    if (!this.props.profile.data) {
      return (
        <Loading />
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
    const crontabScriptPath = Crontab.checkScriptPath();
    if (!this.props.crontab) {
      return (
        <div className="status not-installed">
          <Icon type="close-circle" /> Not installed
        </div>
      );
    }
    else if (this.props.crontab && crontabScriptPath === false) {
      this.props.openNotification({
        type: 'error',
        title: 'Error',
        message: 'Crontab has wrong path for the executable, please click "Reinstall" button below to fix this issue!',
        duration: 0,
        button: this.renderCrontabButtonsReinstall(),
        key: 'notification-crontab-fail',
      });

      return (
        <div className="status not-installed">
          <Icon type="exclamation-circle" /> Wrong path, please reinstall!
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
    const crontabScriptPath = Crontab.checkScriptPath();
    let className = 'installed';

    if (crontabScriptPath === false) {
      className = 'not-installed';
    }

    if (this.props.crontab) {
      return (
        <div className={`status ${className}`}>
          <span className="ant-badge ant-badge-not-a-wrapper">
            <sup dataShow="true" className="ant-scroll-number ant-badge-count">
              <span className="ant-scroll-number-only">
                <p className={this.props.crontab && crontabScriptPath === false ? 'current' : ''}>
                  <Icon type="exclamation" />
                </p>
                <p className={this.props.crontab && crontabScriptPath === true ? 'current' : ''}>
                  <Icon type="check" />
                </p>
              </span>
            </sup>
          </span>
        </div>
      );
    }
  }

  configurationStatusIcon = () => {
    if (this.props.configurations && this.props.configurations.length > 0) {
      return (
        <div className="status info">
          <Badge count={this.props.configurations.length} />
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

  updateStatus = () => {
    this.props.updateStatus()
      .then(() => {
        this.props.openMessage({
          type: 'info',
          message: 'Status succesfully updated.'
        });
      })
      .catch(reason => {
        this.props.openMessage({
          type: 'error',
          message: reason,
        });
      })
  };

  reloadAll = () => {
    this.props.reloadAll()
      .then(() => {
        this.props.openMessage({
          type: 'info',
          message: 'Everything reloaded.'
        });
      })
      .catch(reason => {
        this.props.openMessage({
          type: 'error',
          message: reason,
        });
      })
    ;
  };

  renderConfigurationsTable = () => {
    if (!this.props.configurations || this.props.configurations.length < 1) {
      return <span>Nothing here.</span>;
    }

    return (
      <Table
        columns={this.getConfigurationColumns()}
        dataSource={Utils.alphabeticSortByProperty(this.props.configurations, 'ssid')}
        pagination={this.props.configurations.length < 10 ? false : true}
        rowKey={record => `configuration-ssid-${record.uuid}`}
      />
    );
  }

  renderConnectionsTable = () => {
    if (this.props.connections.fetched && (!this.props.connections.data || this.props.connections.data.length < 1)) {
      return <span>No Data</span>;
    }

    return (
      <Table
        loading={!this.props.connections.fetched && this.props.connections.fetching}
        columns={this.getConnectionColumns()}
        dataSource={this.props.connections.data}
        pagination={this.props.connections.data.length < 10 ? false : true}
        rowKey={record => `connections-ssid-${record.ssid}-${record.mac}`}
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
        <div className="buttons">
          <Button
            icon="play-circle"
            type="primary"
            onClick={() => this.updateStatus()}
            loading={this.props.profile.fetching}
            disabled={this.props.profile.fetching || this.props.configurations.length < 1}
          >
            Update
          </Button>
          <Button
            icon="reload"
            type="dashed"
            onClick={() => this.reloadAll()}
            loading={this.props.profile.fetching && this.props.emojis.fetching &&  this.props.connections.fetching}
            disabled={this.props.profile.fetching && this.props.emojis.fetching &&  this.props.connections.fetching}
          >
            Refresh all
          </Button>
        </div>
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

  renderCrontabButtonsUninstall = disableable => (
    <Button icon="close" disabled={this.isButtonsDisabled('uninstall')} loading={this.state.uninstall} onClick={() => this.handleUninstall()} type="danger">Uninstall</Button>
  )

  renderCrontabButtonsReinstall = disableable => (
    <Button type={Crontab.checkScriptPath() === false ? 'primary' : ''} icon="reload" disabled={disableable && this.isButtonsDisabled('reinstall')} loading={this.state.reinstall} onClick={() => this.handleReinstall()}>Reinstall</Button>
  )

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
        {this.renderCrontabButtonsUninstall()}
        {this.renderCrontabButtonsReinstall()}
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
        <div className="configuration-content">
          {this.renderConfigurationsTable()}
          <Button
            type="primary"
            onClick={() => this.handleConfigurationButton('add', {})}
          >
            Add new
          </Button>
        </div>
      </Panel>
    )
  }

  renderLastUpdate = time => {
    if (time === null) {
      return null;
    }

    const connectionCount = [ ...new Set(this.props.connections.data.map(c => c.ssid)) ].length;

    return (
      <div className="update info">
        <Badge count={connectionCount} />
      </div>
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

  renderModal = () => (
    <Modal
      title={this.state.modal.title}
      visible={this.state.modal.visible}
      onOk={this.state.modal.handleOk}
      onCancel={this.state.modal.handleCancel}
    >
      <Configuration
        visible={this.state.modal.visible}
        data={this.state.modal.data}
        edit={this.state.edit}
        emojis={this.props.emojis.data}
        updateData={this.updateData}
      />
    </Modal>
  )

  render = () => {
    if (!this.props.initialised) {
      return (
        <Loading />
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
          <a href="http://github.com/kirbo" onClick={Utils.electronOpenLinkInBrowser.bind(this)}>Kimmo Saari ©2017</a>
        </Footer>
      </Layout>
    );
  }
}

export default Logged;
