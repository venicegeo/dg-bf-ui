'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './index.js',
  devtool: 'cheap-module-eval-source-map',

  devServer: {
    proxy: {
      '/api/v1/*': {
        target: 'http://localhost:5000'
      },
      '/api/int/*': {
        target: 'https://beachfront.int.geointservices.io',
        changeOrigin: true,
        rewrite(req) {
          req.url = req.url.replace('/api/int/', '/api/v1/')
        }
      }
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
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.less$/, loader: 'style!css?module&localIdentName=[name]__[local]!less'},
      {test: /\.(png|jpg|gif)$/, loader: 'file'},
      {test: /\.(otf|eot|svg|ttf|woff)[^/]*$/, loader: 'file'}
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.API_NAMESPACE': JSON.stringify(process.env.API_NAMESPACE || '/api/v1')
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
