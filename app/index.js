const language = navigator.language;

require('babel-polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/en_US';

import App from './src/containers/App';

const mount  = document.getElementById('app');

ReactDOM.render(
  <IntlProvider locale="en">
    <LocaleProvider locale={locale}>
      <App />
    </LocaleProvider>
  </IntlProvider>
, mount);

