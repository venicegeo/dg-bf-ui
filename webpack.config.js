/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnext = require('postcss-cssnext')

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './index.js',
  devtool: 'cheap-module-eval-source-map',

  resolve: {
    alias: process.env.NODE_ENV === 'production' ? {} : {openlayers$: 'openlayers/dist/ol-debug.js'},
    extensions: ['', '.js', '.jsx']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    noParse: /\bol(-debug)?\.js$/,
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
      favicon: process.env.NODE_ENV === 'production' ? 'images/favicon.png' : 'images/favicon-dev.png',
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
