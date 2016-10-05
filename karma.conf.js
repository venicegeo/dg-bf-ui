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

const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

module.exports = (config) => {
  const isCoverageRequested = config.reporters.includes('coverage')
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
      require.resolve('openlayers/dist/ol.js'),

      'test/index.ts'
    ],

    preprocessors: {
      'test/index.ts': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      context: __dirname,
      resolve: webpackConfig.resolve,
      module: {
        preLoaders: webpackConfig.module.preLoaders,
        loaders: webpackConfig.module.loaders,
        postLoaders: isCoverageRequested ? [
          {
            test: /\.tsx?$/,
            loader: 'istanbul-instrumenter',
            include: path.resolve('./src/'),
            query: {
              esModules: true,
            },
          },
        ] : []
      },
      postcss: webpackConfig.postcss,
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
    },

    //
    // Misc
    //

    coverageReporter: isCoverageRequested ? {
      dir: 'reports/',
      reporters: [
        { type: 'text-summary' },
        { type: 'html', subdir: 'coverage-html' },
        { type: 'cobertura', subdir: '.', file: 'coverage-cobertura.xml' },
      ]
    } : {},

    mochaReporter: {
      showDiff: true,
    },
  })
}
