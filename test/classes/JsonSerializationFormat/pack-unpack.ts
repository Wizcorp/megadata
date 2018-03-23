import * as assert from 'assert'

import Json from 'test/types/Json'
import MessageType from 'megadata/classes/MessageType'

describe('pack/unpack', () => {
  it('works properly', () => {
    const time = 12423423
    const help = 'hello'
    const array = [1, 2, 3]

    const instance = Json.create({
      time,
      ohai: { help, array }
    })

    const buffer = instance.pack()

    assert.equal(buffer.byteLength, 58)

    const ret = MessageType.parse<Json>(buffer)

    assert.equal(ret.time, time)
    assert.equal(ret.ohai.help, help)
    assert.equal(ret.ohai.array[2], array[2])
  })
})
