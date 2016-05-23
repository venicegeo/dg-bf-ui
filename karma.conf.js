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
