import './Authorise.less';

import React from 'react';
import {remote } from 'electron';

let PROCESS_ENV = Object.assign({},
  process.env,
  { platform: process.platform }
);

if (remote) {
  PROCESS_ENV = Object.assign({},
    PROCESS_ENV,
    remote.getGlobal('process_env')
  );
}

import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

import Utils from '../../utils/Utils';

class Authorise extends React.Component {

  render = () => {
    return (
      <Layout id="authorise">
        <Header>Welcome!</Header>
        <Content>
          <p>
            Thank you for using <strong>Sloth</strong>.
          </p>

          <p>
            Before you can begin configuring stuff, you need to Sign in with Slack and authorise this App to get your Slack API access token.
          </p>

          <p className="authorise">
            <a
              href="#"
              onClick={Utils.electronOpenLink.bind(this, `https://${PROCESS_ENV.SLACK_NAME}.slack.com/oauth/authorize?client_id=${PROCESS_ENV.CLIENT_ID}&scope=${PROCESS_ENV.SCOPE}&redirect_uri=${PROCESS_ENV.REDIRECT_URI}`)}
            >
              <img src="sign_in_with_slack.png" />
            </a>
          </p>
        </Content>
        <Footer>
          <a href="http://github.com/kirbo" onClick={Utils.electronOpenLinkInBrowser.bind(this)}>Kimmo Saari ©2017</a>
        </Footer>
      </Layout>
    );
  }
}

export default Authorise;
