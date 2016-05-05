const webpack = require('webpack')

module.exports = (config) => {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],

    files: ['app/**/*test.js'],
    preprocessors: {
      'app/**/*.js': ['webpack']
    },

    webpack: {
      devtool: 'cheap-module-eval-source-map',
      module: {
        loaders: [
          {pattern: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
          {test: /\.css$/, loader: 'style!css?module&localIdentName=[name]__[local]'}
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test'),
          'process.env.API_NAMESPACE': JSON.stringify('/api/test')
        })
      ]
    }
  })
}
