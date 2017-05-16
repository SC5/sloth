const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

const webpackConfig = {
  target: 'electron',
  entry: './app/entry.jsx',
  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: 'bundle.js',
  },
  devtool: 'inline-source-map',
  externals: {
    fs: 'require("fs")',
    child_process: 'require("child_process")',
    bufferutil: 'require("bufferutil")',
    'utf-8-validate': 'require("utf-8-validate")',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    exprContextCritical: false,
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.less$/, use: ExtractTextPlugin.extract(['css-loader?importLoaders=1', 'less-loader']) },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
        APP_ENV: JSON.stringify('browser'),
      },
    }),

    new ExtractTextPlugin('styles.css'),
  ],
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig.plugins.push(new BabiliPlugin({
    test: /\.jsx?$/,
    babili: {
      presets: [
        [
          require('babel-preset-babili'), // eslint-disable-line
          {
            mangle: { topLevel: true },
            deadcode: false,
            removeConsole: true,
          },
        ],
      ],
    },
  }));
}

module.exports = webpackConfig;
