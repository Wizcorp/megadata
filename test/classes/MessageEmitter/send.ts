import MessageEmitter from 'megadata/classes/MessageEmitter'
import * as assert from 'assert'

import Json from 'test/types/Json'
import Join from 'test/types/Join'

describe('send and message parser factory', () => {
  let emitter: MessageEmitter

  beforeEach(() => { emitter = new MessageEmitter() })

  it('an optional send function can be passed at configuration, and will receive buffer of sent events', (done) => {
    const emitter = new MessageEmitter({
      send: (buffer) => {
        assert.strictEqual(buffer.byteLength, 5)
        done()
      }
    })

    emitter.send(Join, {
      time: 1
    })
  })

  it('emitter.send throws if send function was not configured', () => {
    try {
      emitter.send(Json, {} as Json)
    } catch (error) {
      return assert.strictEqual(error.message, 'Instance not configured with a send function')
    }
  })

  it('message parser factory parses buffers into messages and emits the received messages asynchronously', async () => {
    let joinDone = false
    const parse = emitter.createMessageParser()

    emitter.once(Join, async (message) => {
      assert.strictEqual(message.time, 1)
      await new Promise((resolve) => setTimeout(resolve, 10))
      joinDone = true
    })

    const message = Join.create({
      time: 1
    })

    await parse(message.pack())
    assert(joinDone)
  })
})
