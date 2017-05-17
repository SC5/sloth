import React from 'react';
import { Layout } from 'antd';

import Utils from '../../utils/Utils';

import './Footer.less';

const Footer = () => (
  <Layout.Footer>
    <a
      href="http://github.com/sc5"
      onClick={event => Utils.electronOpenLinkInBrowser(event, this)}
    >
      SC5 © 2017
    </a>
  </Layout.Footer>
);

export default Footer;
