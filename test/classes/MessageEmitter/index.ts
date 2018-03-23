import MessageEmitter from 'megadata/classes/MessageEmitter'
import * as assert from 'assert'

import Json from 'test/types/Json'
import Join from 'test/types/Join'

describe('MessageEmitter', () => {
  let emitter: MessageEmitter

  beforeEach(() => emitter = new MessageEmitter())

  this.timeout = 2000

  it('synchronous emit works with on and once', (done) => {
    let jsonDone = false
    emitter.on(Json, (message) => {
      jsonDone = true
      assert.equal(message.ohai.help, 'hello')
    })

    emitter.once(Join, (message) => {
      assert(jsonDone)
      assert.equal(message.time, 1)
      done()
    })

    emitter.emit(Json.create({
      time: 1,
      ohai: {
        help: 'hello',
        array: []
      }
    }))

    emitter.emit(Join.create({
     time: 1,
    }))
  })

  it('assynchronous emit works with on and once', async () => {
    let jsonDone = false
    emitter.on(Json, async (message) => {
      jsonDone = true
      assert.equal(message.ohai.help, 'hello')

      return new Promise((resolve) => setTimeout(resolve, 10))
    })

    emitter.once(Join, async (message) => {
      assert(jsonDone)
      assert.equal(message.time, 1)

      return new Promise((resolve) => setTimeout(resolve, 10))
    })

    return Promise.all([
      emitter.emitAsync(Json.create({
        time: 1,
        ohai: {
          help: 'hello',
          array: []
        }
      })),
      emitter.emitAsync(Join.create({
        time: 1,
      }))
    ])
  })
})
