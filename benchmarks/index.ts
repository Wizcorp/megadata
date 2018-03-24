// Support config paths from the tsconfig.json file
// See: https://www.npmjs.com/package/tsconfig-paths

const tsConfigPaths = require('tsconfig-paths')
const tsConfig = require('../tsconfig.json')

tsConfigPaths.register(tsConfig.compilerOptions)

require('./app')
