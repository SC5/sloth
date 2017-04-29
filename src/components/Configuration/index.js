import './Configuration.css';

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
const Option = Select.Option;

const residences = [{
  value: 'zhejiang',
  label: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    label: 'Hangzhou',
    children: [{
      value: 'xihu',
      label: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  label: 'Jiangsu',
  children: [{
    value: 'nanjing',
    label: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      label: 'Zhong Hua Men',
    }],
  }],
}];

class ConfigurationForm extends React.Component {
  state = {
    confirmDirty: false,
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
      emojis: emojis
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 14,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };

    return (
      <Form onSubmit={this.handleSubmit}>
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
                  <Emoji emojis={this.props.emojis} emoji={icon.key} /> - {icon.key}
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
          {getFieldDecorator('password', {
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
