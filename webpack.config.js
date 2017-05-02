const path = require('path');
const { resolve } = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BabiliPlugin = require("babili-webpack-plugin");

const port = 8080;

const webpackConfig = {
  target: 'electron',
  entry: './entry.js',
  output: {
    path: path.join(__dirname, './bundles'),
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
      { test: /\.less$/, use: ExtractTextPlugin.extract(['css-loader?importLoaders=1', 'less-loader']) },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        APP_ENV: JSON.stringify('browser'),
        HOME: JSON.stringify(process.env.HOME),
      }
    }),

    new ExtractTextPlugin("styles.css"),
  ],
}

if (process.env.NODE_ENV === 'production') {
  webpackConfig.plugins.push(
    new BabiliPlugin({
      test: /\.js$|\.jsx$/,
      babili: {
        presets: [
          [
            require('babel-preset-babili'),
            {
              mangle: { topLevel: true },
              deadcode: false,
              removeConsole: true,
            },
          ],
        ],
      },
    })
  );
}

module.exports = webpackConfig;
