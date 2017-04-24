const path = require('path');
const { resolve } = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const port = 8080;

module.exports = {
  target: 'electron',
  entry: './entry.js',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  externals: {
    'fs': 'require("fs")',
    'child_process': 'require("child_process")',
    'bufferutil': 'require("bufferutil")',
    'utf-8-validate': 'require("utf-8-validate")',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.less$/, use: ExtractTextPlugin.extract(['css-loader?importLoaders=1', 'postcss-loader', 'less-loader']) },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        APP_ENV: JSON.stringify('browser')
      }
    }),

    new ExtractTextPlugin("styles.css"),
  ],
}