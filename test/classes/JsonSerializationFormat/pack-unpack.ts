import * as assert from 'assert'

import Json from 'test/types/Json'
import JsonExtended from 'test/types/JsonExtended'
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

  it('works properly with inheritance', () => {
    const time = 12423423
    const help = 'hello'
    const array = [1, 2, 3]

    const superclass = Json.create({
      time,
      ohai: { help, array }
    })

    const subclass = JsonExtended.create({
      time,
      ohai: { help, array },
      holiday: false
    })

    const superBuffer = superclass.pack()
    const subBuffer = subclass.pack()

    // Same as previous test
    assert.equal(superBuffer.byteLength, 58)

    // 58 + "holiday": false => 74
    assert.equal(subBuffer.byteLength, 74)
  
    const retSuper = MessageType.parse<Json>(superBuffer)
    const retSub = MessageType.parse<JsonExtended>(subBuffer)
  
    // time and ohai
    assert.equal(retSuper.constructor.name, 'Json')
    assert.equal(Object.keys(retSuper).length, 2)
  
    // time, ohai and holiday 
    assert.equal(retSub.constructor.name, 'JsonExtended')
    assert.equal(Object.keys(retSub).length, 3)
  })
})
