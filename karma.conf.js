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

const webpack = require('webpack')

module.exports = (config) => {
  config.set({
    //
    // Base Config
    //

    browsers: ['Chrome'],

    customLaunchers: {
      gs_firefox_38: {
        base: 'Firefox',
        prefs: {'dom.fetch.enabled': true}
      }
    },

    frameworks: ['mocha'],

    reporters: ['mocha'],

    //
    // Source Wrangling
    //

    files: ['app/**/*test.js'],

    preprocessors: {
      'app/**/*.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {pattern: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
          {test: /\.css$/, loader: 'style!css?module&localIdentName=[name]__[local]'}
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test'),
          'process.env.GATEWAY': JSON.stringify('/test-gateway')
        })
      ]
    },

    webpackMiddleware: {
      noInfo: true
    }
  })
}
