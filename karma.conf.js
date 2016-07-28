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

    //
    // Source Wrangling
    //

    files: ['test/index.js'],

    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        alias: {openlayers$: 'openlayers/dist/ol-debug.js'},
        extensions: ['', '.js', '.jsx'],
        root: __dirname,
      },
      module: {
        noParse: /\bol(-debug)?\.js$/,
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: /node_modules/
          },
          {
            test: /\.css$/,
            loader: 'style!css?module&localIdentName=[name]__[local]',
            exclude: /node_modules/
          },
        ]
      },
      plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test'),
          'process.env.GATEWAY': JSON.stringify('/test-gateway')
        })
      ],

      /*
       * The following is needed by enzyme
       *
       * Refer to:
       *   https://github.com/airbnb/enzyme/blob/6cdaa068ccf204b3aef1b71afaeffaa769f5ebe0/docs/guides/webpack.md#react-15-compatability
       */
      externals: {
        'cheerio' : 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      }

    },

    webpackMiddleware: {
      noInfo: true
    }
  })
}
