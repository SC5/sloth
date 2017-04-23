require('babel-polyfill');

import React from 'react';
import ReactDOM from 'react-dom';

const language = navigator.language;

import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/en_US';

import App from './src/containers/App';

const mount  = document.getElementById('app');
const render = () => {
  ReactDOM.render(<LocaleProvider locale={locale}><App /></LocaleProvider>, mount);
};

if (module.hot) {
  module.hot.accept('./src/containers/App', () => render());
}

render();

