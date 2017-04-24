import './Authorise.css';

import React from 'react';

import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

import Utils from '../../utils';
const utils = new Utils();

class Authorise extends React.Component {
  
  render = () => {
    return (
      <Layout id="authorise">
        <Header>Welcome!</Header>
        <Content>
          <p>
            Thank you for using '<strong>SSID to Slack status</strong>'.
          </p>

          <p>
            Before you can begin configuring stuff, you need to Sign in with Slack and authorise this App to get your Slack API access token.
          </p>

          <p className="authorise">
            <a
              href="#"
              onClick={utils.electronOpenLinkInBrowser.bind(this, 'https://slack.com/oauth/authorize?client_id=2174365688.170810616229&scope=users.profile:write,users.profile:read,emoji:read&redirect_uri=http://localhost:5000/auth')}
            >
              <img src="sign_in_with_slack.png" />
            </a>
          </p>
        </Content>
        <Footer>
          <a href="http://github.com/kirbo" onClick={utils.electronOpenLinkInBrowser.bind(this)}>Kimmo Saari ©2017</a>
        </Footer>
      </Layout>
    );
  }
}

export default Authorise;
