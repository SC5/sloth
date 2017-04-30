import './Configuration.less';

import React from 'react';

import Emoji from '../Emoji';

import Utils from '../../utils';
const utils = new Utils();

import * as constants from '../../utils/constants';
const { SECOND, MINUTE } = constants.TIMES;

import {
  Form,
  Input,
  Select,
} from 'antd';

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

class ConfigurationForm extends React.Component {
  state = {
    emojis: []
  };

  componentDidMount = () => {
    const emojis = utils.standardEmojis();

    Object.keys(this.props.emojis).map(key => {
      emojis.push({
        key,
        emoji: null
      })
    });

    this.setState({
      emojis: utils.alphabeticSortByProperty(emojis, 'key')
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="Name"
          hasFeedback
        >
          {getFieldDecorator('ssid', {
            initialValue: this.props.data.ssid,
            rules: [{
              required: true,
              message: 'Please input Name!',
            }],
          })(
            <Input
              type="text"
              onChange={e => { this.props.updateData('ssid', e.target.value) }}
            />
            )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="BSSID"
          hasFeedback
        >
          {getFieldDecorator('bssid', {
            initialValue: this.props.data.mac.toUpperCase(),
            rules: [{
              required: !!this.props.data.ssid,
              message: 'Please input BSSID!',
            }],
          })(
            <Input
              type="text"
              onChange={e => { this.props.updateData('mac', e.target.value) }}
            />
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
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              onChange={(value,label) => {this.props.updateData('icon', value)}}
            >
              {this.state.emojis.map(icon => (
                <Option value={icon.key}>
                  <div className="option">
                    <Emoji emojis={this.props.emojis} emoji={icon.key} /> - {icon.key}
                  </div>
                </Option>
              ))}
            </Select>
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
              message: 'Status can be only 100 characters long!'
            }],
          })(
            <Input
              type="textarea"
              onChange={e => { this.props.updateData('status', e.target.value) }}
            />
          )}
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(ConfigurationForm);
