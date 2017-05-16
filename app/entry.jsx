import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/en_US';
import { AppContainer } from 'react-hot-loader';

import App from './src/containers/App';

const mount = document.getElementById('app');

const render = (Component) => {
  ReactDOM.render(
    <IntlProvider locale="en">
      <LocaleProvider locale={locale}>
        <AppContainer>
          <Component />
        </AppContainer>
      </LocaleProvider>
    </IntlProvider>,
    mount
  );
}

if (module.hot) {
  module.hot.accept();
}

render(App);
