require('core-js/fn/array/includes')
require('core-js/fn/string/includes')

let testsContext = require.context('.', true, /\.test$/)
testsContext.keys().forEach(testsContext)
