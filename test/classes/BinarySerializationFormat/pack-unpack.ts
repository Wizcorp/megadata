import * as assert from 'assert'

import Binary from 'test/types/Binary'
import EmptyBinary from 'test/types/EmptyBinary'
import MessageType from 'megadata/classes/MessageType'

describe('pack/unpack', () => {
  it('works properly with empty message types', () => {
    const instance = EmptyBinary.create()
    const buffer = instance.pack()

    assert.equal(buffer.byteLength, 1)

    const ret = MessageType.parse<EmptyBinary>(buffer)

    assert.equal(ret.constructor.name, 'EmptyBinary')
    assert.equal(Object.keys(ret).length, 0)
  })

  it('works properly with all data fields', () => {
    const uint8 = 254
    const uint16 = 65534
    const uint32 = 4294967294
    const int8 = -122
    const int16 = -32123
    const int32 = -4294967
    const float32 = 3.402822971343994
    const float64 = 3.4028234663852888

    const instance = Binary.create({
      uint8, uint16, uint32,
      int8, int16, int32,
      float32, float64
    })

    const buffer = instance.pack()

    assert.equal(buffer.byteLength, 27)

    const ret = MessageType.parse<Binary>(buffer)

    assert.equal(ret.uint8, uint8)
    assert.equal(ret.uint16, uint16)
    assert.equal(ret.uint32, uint32)
    assert.equal(ret.int8, int8)
    assert.equal(ret.int16, int16)
    assert.equal(ret.int32, int32)
    assert.equal(ret.float32, float32)
    assert.equal(ret.float64, float64)
  })
})
