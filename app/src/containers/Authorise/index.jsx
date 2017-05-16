import React from 'react';
import { Layout } from 'antd';
import { remote } from 'electron';

import './Authorise.less';
import Utils from '../../utils/Utils';

let PROCESS_ENV = Object.assign({},
  process.env,
  { platform: process.platform },
);

if (remote) {
  PROCESS_ENV = Object.assign({},
    PROCESS_ENV,
    remote.getGlobal('process_env'),
  );
}

const { Header, Content, Footer } = Layout;

const url = `https://${PROCESS_ENV.SLACK_NAME}.slack.com/oauth/authorize?client_id=${PROCESS_ENV.CLIENT_ID}&scope=${PROCESS_ENV.SCOPE}&redirect_uri=${PROCESS_ENV.REDIRECT_URI}`;

const Authorise = () => (
  <Layout id="authorise">
    <Header>Welcome!</Header>
    <Content>
      <p>
        Thank you for using <strong>Sloth</strong>.
      </p>

      <p>
        Before you can begin configuring stuff, you need to Sign in with Slack and
        authorise this App to get your Slack API access token.
      </p>

      <p className="authorise">
        <a
          role="button"
          tabIndex={0}
          href={url}
          onClick={() => {
            Utils.electronOpenLink(url);
          }}
        >
          <img src="sign_in_with_slack.png" alt="" />
        </a>
      </p>
    </Content>
    <Footer>
      <a
        href="http://github.com/kirbo"
        onClick={() => {
          Utils.electronOpenLinkInBrowser(this);
        }}
      >Kimmo Saari ©2017</a>
    </Footer>
  </Layout>
);

export default Authorise;
