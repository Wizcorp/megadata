import megadata, { TypeDecorator } from 'megadata'
import * as assert from 'assert'

const types = require.context('./types')

export enum TypeIds {
  TypeFileIsADirectory,
  DoesNotExposeDefault,
  Binary,
  EmptyBinary,
  Json,
  JsonExtended,
  Join,
  JoinPreloaded,
  Leave,
  Double,
  Move,
  Moved
}

export const Type: TypeDecorator<TypeIds> = megadata(module, types)

describe('megadata', () => {
  describe('@Type', () => {
    it('Attempting initialize without exporting a TypeIds enum will throw', () => {
      const id = 'badModule'

      try {
        megadata<TypeIds>({ id, exports: {} } as NodeModule, types)
      } catch (error) {
        return assert.equal(error.message, `${id} does not export a TypeIds enum!`)
      }

      throw new Error('Did not throw')
    })

    it('Attempting to re-run the initialization should throw', () => {
      try {
        megadata<TypeIds>(module, types)
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
