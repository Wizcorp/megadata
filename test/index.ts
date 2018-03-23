// Support config paths from the tsconfig.json file
// See: https://www.npmjs.com/package/tsconfig-paths
const tsConfig = require('./tsconfig.json')
const tsConfigPaths = require('tsconfig-paths')

tsConfigPaths.register(tsConfig.compilerOptions)

import megadata, { TypeDecorator } from 'megadata'
import Binary from 'megadata/classes/BinarySerializationFormat'
import * as assert from 'assert'

export const enum TypeIds {
  MissingTypeClassFile,
  DoesNotExposeDefault,
  Binary,
  EmptyBinary,
  Json,
  Join,
  JoinPreloaded,
  Leave,
  Double
}

export const Type: TypeDecorator<TypeIds> = megadata(module)

describe('megadata', () => {
  describe('@Type', () => {
    it('Attempting to re-run the initialization should throw', () => {
      try {
        megadata<TypeIds>(module, Binary)
      } catch (error) {
        return assert.equal(error.message, 'megadata has already been initialized')
      }

      throw new Error('Did not throw')
    })

    it('Assigning the same message ID to two class will throw', () => {
      require('./types/DoubleOne')

      try {
        require('./types/DoubleTwo')
      } catch (error) {
        return assert.equal(error.message, `Tried to register type ID ${TypeIds.Double} to type DoubleTwo but already assigned to type DoubleOne`)
      }

      throw new Error('Did not throw')
    })
  })

  require('./classes')
})
