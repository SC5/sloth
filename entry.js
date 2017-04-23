const language = navigator.language;

require('babel-polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/en_US';

import App from './src/containers/App';

const mount  = document.getElementById('app');
const render = () => {
  ReactDOM.render(
    <IntlProvider locale="en">
      <LocaleProvider locale={locale}>
        <App />
      </LocaleProvider>
    </IntlProvider>
  , mount);
};

if (module.hot) {
  module.hot.accept('./src/containers/App', () => render());
}

render();

