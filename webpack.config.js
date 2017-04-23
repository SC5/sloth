const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron',
  entry: {
    app: ['webpack/hot/dev-server', './entry.js'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:8080/dist/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    publicPath: 'http://localhost:8080/dist/'
  },
  externals: {
    'fs': 'require("fs")',
    'child_process': 'require("child_process")',
    'bufferutil': 'require("bufferutil")',
    'utf-8-validate': 'require("utf-8-validate")',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!sass-loader' }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}