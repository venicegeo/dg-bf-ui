'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnext = require('postcss-cssnext')

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './index.js',
  devtool: 'cheap-module-eval-source-map',

  devServer: {
    proxy: {
      /*
       2016-06-01 -- This accounts for the way connect-history-api-fallback treats URIs
       containing dots (.) as file requests.  No easy way to solve that problem without
       making CHAF's file detection logic smarter, THEN propagating whatever required
       configuration changes are needed to the webpack-dev-server project. ¯\_(ツ)_/¯
       */
      '/create-job/*': {bypass: () => '/index.html'}
    }
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    noParse: /\/openlayers\/.*\.js$/,
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint', exclude: /node_modules/}
    ],
    loaders: [
      {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: 'style!css', include: /node_modules/},
      {test: /\.css$/, loader: 'style!css?module&localIdentName=[name]__[local]&importLoaders=1!postcss', exclude: /node_modules/},
      {test: /\.(png|jpg|gif)$/, loader: 'file'},
      {test: /\.(otf|eot|svg|ttf|woff)[^/]*$/, loader: 'file'}
    ]
  },

  postcss: () => [cssnext({browsers: 'Firefox >= 38, Chrome >= 40'})],

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.GATEWAY': JSON.stringify(process.env.GATEWAY || 'http://localhost:3000')
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      hash: true,
      xhtml: true
    }),
    new webpack.ProvidePlugin({fetch:'isomorphic-fetch'})
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map'
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin())
}
