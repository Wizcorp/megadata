import * as assert from 'assert'

import MessageType from 'megadata/classes/MessageType'

describe('generated', () => {
  function test(method: string) {
    it(`${method} throws if it was not overriden`, () => {
      const instance = new MessageType() as any
      try {
        instance[method]()
      } catch (error) {
        return assert.equal(error.message, `${method} was not overwritten!`)
      }

      throw new Error('Did not throw')
    })
  }

  test('_create')
  test('_pack')
  test('_unpack')
})
