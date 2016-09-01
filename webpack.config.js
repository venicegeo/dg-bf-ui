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
const cssimport = require('postcss-import')

const __environment__ = process.env.NODE_ENV || 'development'

module.exports = {
  devtool: 'source-map',

  context: __dirname,
  entry: {
    'app': './app/index.js',
    'vendor': [
      'history',
      'isomorphic-fetch',
      'moment',
      'openlayers',
      'react',
      'react-dom',
    ]
  },

  resolve: {
    alias: __environment__ === 'production' ? {} : {/* openlayers$: 'openlayers/dist/ol-debug.js' */},
    extensions: ['', '.js', '.jsx'],
    root: __dirname,
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    noParse: /\bol(-debug)?\.js$/,
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style!css',
        include: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style!css?module&localIdentName=[name]-[local]&importLoaders=1!postcss',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file'
      },
      {
        test: /\.(otf|eot|svg|ttf|woff)[^/]*$/,
        loader: 'file'
      },
    ]
  },

  postcss: (webpack_) => ([
    cssimport({ addDependencyTo: webpack_ }),
    cssnext({ browsers: 'Firefox >= 38, Chrome >= 40' }),
  ]),

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(__environment__),
      'process.env.GATEWAY': process.env.GATEWAY ? JSON.stringify(process.env.GATEWAY) : (__environment__ === 'development') ? JSON.stringify('http://localhost:3000') : "location.protocol + '//' + location.hostname.replace('.int.', '.stage.').replace(/beachfront[^\\.]*\\./, 'pz-gateway.')",
    }),
    new HtmlWebpackPlugin({
      template: 'app/index.ejs',
      favicon: __environment__ === 'production' ? 'app/images/favicon.png' : 'app/images/favicon-dev.png',
      hash: true,
      xhtml: true
    }),
    new webpack.ProvidePlugin({fetch:'isomorphic-fetch'})
  ]
}

if (__environment__ === 'production') {
  module.exports.devtool = 'source-map'
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin())
}
