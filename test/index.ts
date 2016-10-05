import '../src/polyfills'

const testsContext = require.context('.', true, /\.test$/)
testsContext.keys().forEach(testsContext)

const sourceContext = require.context('../src/', true, /\.tsx?$/)
sourceContext.keys()
  .filter(path => path !== './index.ts')
  .forEach(sourceContext)
