const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./libs/parts');
const pkg = require('./package.json');
const PATHS = {
  app: path.join(__dirname, 'client/index.js'),
  build: path.join(__dirname, 'build'),
  style: path.join(__dirname, 'client/stylesheets/index.scss')
};

const common = {
  entry: {
    style: PATHS.style,
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Campfire Stories',
      template: './client/index.ejs',
      minify: {
       removeComments: true,
       collapseWhitespace: true
    },
    inject: true
  })
  ]
};


var config;

switch(process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js',
        }
      },
      parts.clean(PATHS.build),
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg["client-dependencies"])//['react']
      }),
      parts.extractCSS(PATHS.style),
      //parts.purifyCSS([PATHS.app]),
      parts.minify(),
      {});
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
      parts.setupCSS(PATHS.style),
      parts.devServer({
        port: 3000, host: process.env.HOST
      })
    )
}

module.exports = validate(config, {
  quiet: true
});
