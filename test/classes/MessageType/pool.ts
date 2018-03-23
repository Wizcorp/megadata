import * as assert from 'assert'

import Leave from 'test/types/Leave'

describe('pool', () => {
  it('Can reuse released object instances', () => {
    const instance = Leave.create({ __reused: true } as any)
    instance.release()

    const newInstance = Leave.create({ time: 1 }) as any
    assert.equal(newInstance.__reused, true)
  })
})
