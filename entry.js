const language = navigator.language;

require('babel-polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/en_US';

import App from './src/containers/App';

const mount  = document.getElementById('app');

if (module.hot) {
	module.hot.accept();
	const NewApp = require('./src/containers/App').default;
	ReactDOM.render(
    <IntlProvider locale="en">
      <LocaleProvider locale={locale}>
        <NewApp />
      </LocaleProvider>
    </IntlProvider>
  , mount);
}

ReactDOM.render(
  <IntlProvider locale="en">
    <LocaleProvider locale={locale}>
      <App />
    </LocaleProvider>
  </IntlProvider>
, mount);

