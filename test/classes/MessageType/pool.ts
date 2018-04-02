import * as assert from 'assert'

import Leave from 'test/types/Leave'
import Move from 'test/types/Move'
import Moved from 'test/types/Moved'

describe('pool', () => {
  it('Can reuse released object instances', () => {
    const instance = Leave.create({ __reused: true } as any)
    instance.release()

    const newInstance = Leave.create({ time: 1 }) as any
    assert.equal(newInstance.__reused, true)
  })

  it('Each types has a separate pool regardless of inheritance', () => {
    const move = Move.create({} as any)
    const moved = Moved.create({} as any)
    move.release()

    assert.equal(Move.pool.length, 1)
    assert.equal(Moved.pool.length, 0)

    assert(moved instanceof Moved)
    assert.notDeepEqual(move.constructor.name, moved.constructor.name)
  })
})
