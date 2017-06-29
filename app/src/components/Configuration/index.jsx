import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  Select,
  Popover,
} from 'antd';

import './Configuration.less';

import Emoji from '../Emoji';
import Emojis from '../../utils/Emojis';
import Utils from '../../utils/Utils';

const { Option } = Select;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 14 },
    sm: { span: 14 },
  },
};

const bssidPopover = (
  <div>
    Click here if you wan&apos;t this configuration enabled only on
    the current WiFi access point.<br />
    This enables you to specify different automations on different locations
    with the same SSID, for example: <strong>Helsinki Office</strong> and
    <strong>Jyväskylä Office</strong>.
  </div>
);

class ConfigurationForm extends React.Component {
  static propTypes = {
    data: PropTypes.instanceOf(Object).isRequired,
    emojis: PropTypes.instanceOf(Object).isRequired,
    visible: PropTypes.bool.isRequired,
    form: PropTypes.instanceOf(Object).isRequired,
    updateData: PropTypes.instanceOf(Function).isRequired,
  };

  state = {
    emojis: [],
    mac: this.props.data.uuid ? this.props.data.mac : '',
  };

  componentWillMount = () => {
    const emojis = Emojis.loadStandard();

    Object.keys(this.props.emojis).map(key => (
      emojis.push({
        key,
        emoji: null,
      })
    ));

    this.setState({
      emojis: Utils.alphabeticSortByProperty(emojis, 'key'),
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.visible === false) {
      this.resetForm();
    }

    if (
      nextProps.visible === true
      && this.state.mac !== nextProps.data.mac
    ) {
      this.setState({
        mac: nextProps.data.uuid ? nextProps.data.mac : '',
      });
      this.props.form.resetFields(['bssid']);
    }
  }

  resetForm = () => {
    this.props.form.resetFields();
  }

  renderFillBssid = () => {
    if (this.props.data.uuid) {
      return null;
    }

    return (
      <Popover
        className="popover"
        placement="topLeft"
        title="Fill BSSID"
        content={bssidPopover}
        getPopupContainer={() => document.querySelector('.configuration-form')}
      >
        <div
          role="button"
          tabIndex={0}
          className="addon-button"
          onClick={() => {
            this.setState({
              mac: this.props.data.mac,
            });
            this.props.form.resetFields(['bssid']);
          }}
        >
          Fill BSSID
        </div>
      </Popover>
    );
  }

  render = () => {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit} className="configuration-form">
        <FormItem
          {...formItemLayout}
          label="Name"
          hasFeedback
        >
          {getFieldDecorator('name', {
            initialValue: this.props.data.name,
            rules: [{
              required: true,
              message: 'Please input Name!',
            }],
          })(
            <Input
              type="text"
              placeholder="Connection name, e.g.: Home or Helsinki office"
              onChange={(e) => { this.props.updateData('name', e.target.value); }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="SSID"
          hasFeedback
        >
          {getFieldDecorator('ssid', {
            initialValue: this.props.data.ssid,
            rules: [{
              required: true,
              message: 'Please input SSID!',
            }],
          })(
            <Input
              type="text"
              placeholder="SSID of the WiFi access point"
              onChange={(e) => { this.props.updateData('ssid', e.target.value); }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="BSSID"
        >
          {getFieldDecorator('bssid', {
            initialValue: this.state.mac.toUpperCase(),
          })(
            <Input
              type="text"
              placeholder="BSSID (MAC address) for this access point"
              onChange={(e) => { this.props.updateData('mac', e.target.value); }}
              addonAfter={this.renderFillBssid()}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Icon"
          hasFeedback
        >
          {getFieldDecorator('icon', {
            initialValue: this.props.data.icon,
            rules: [{
              required: true,
              message: 'Please select an icon!',
            }],
          })(
            <Select
              showSearch
              placeholder="Select an icon"
              filterOption={(input, option) => (
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
              )}
              onChange={(value) => { this.props.updateData('icon', value); }}
            >
              {this.state.emojis.map(icon => (
                <Option key={icon.key} value={icon.key}>
                  <div className="option">
                    <Emoji emojis={this.props.emojis} emoji={icon.key} /> - {icon.key}
                  </div>
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Status"
          hasFeedback
        >
          {getFieldDecorator('status', {
            initialValue: this.props.data.status,
            rules: [{
              required: true,
              message: 'Please input your status!',
            },
            {
              max: 100,
              message: 'Status can be only 100 characters long!',
            }],
          })(
            <Input
              type="textarea"
              placeholder="Status, e.g.: Working remotely, At the Helsinki office, ..."
              onChange={(e) => { this.props.updateData('status', e.target.value); }}
            />,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(ConfigurationForm);
