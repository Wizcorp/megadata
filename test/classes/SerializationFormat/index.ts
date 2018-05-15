import * as assert from 'assert'

import SerializationFormat from 'megadata/classes/SerializationFormat'

describe('SerializationFormat', () => {
  it('throws if create is not overridden', () => {
    try {
      SerializationFormat.create(0, 0, [])
    } catch (error) {
      return assert.strictEqual(error.message, 'SerializationFormat.create is not implemented')
    }

    throw new Error('Did not throw')
  })
})
