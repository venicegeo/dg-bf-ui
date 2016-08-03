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

    files: [
      // Isolate "fat" libraries that might slow down each rebuild
      require.resolve('openlayers/dist/ol-debug.js'),

      'test/index.ts'
    ],

    preprocessors: {
      'test/index.ts': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['', '.tsx', '.ts', '.jsx', '.js'],
        root: __dirname,
      },
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            loader: 'source-map',
            exclude: /node_modules/
          },
        ],
        loaders: [
          {
            test: /\.tsx?$/,
            loader: 'ts',
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

      externals: {
        'openlayers': 'ol',

        /*
         * The following is needed for enzyme to function properly
         *
         * Refer to:
         *   https://github.com/airbnb/enzyme/blob/6cdaa068ccf204b3aef1b71afaeffaa769f5ebe0/docs/guides/webpack.md#react-15-compatability
         */
        'cheerio' : 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      }

    },

    webpackMiddleware: {
      stats: 'error-only'
    }
  })
}
