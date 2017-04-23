/*
import React from 'react';
import App from './src/containers/App'

React.render(<App />, document.getElementById('app'));
*/

require('babel-polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/containers/App';

const mount  = document.getElementById('app');
const render = app => {
  ReactDOM.render(app, mount);
};

if (module.hot) {
  module.hot.accept('./src/containers/App', () => render(<App />));
}

render(<App />);

