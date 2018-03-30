import MessageEmitter, { AutoloadEvents, Event } from 'megadata/classes/MessageEmitter'
import * as assert from 'assert'

import Binary from 'test/types/Binary'
import EmptyBinary from 'test/types/EmptyBinary'
import Json from 'test/types/Json'
import Join from 'test/types/Join'

const events = require.context('../../events')

@AutoloadEvents(events)
export class AutoloadEmitter extends MessageEmitter {
  public throws = false
  public eventAttached = false
  public touched = false
}

describe('event handler auto-loading', () => {
  let emitter: AutoloadEmitter

  beforeEach(() => { emitter = new AutoloadEmitter() })

  this.timeout = 2000

  it('auto-loading ignores events that do not have a an event handler file', (done) => {
    emitter.on(Event.Ignored, (message: Json) => {
      assert.equal(message.time, 1)
      done()
    })

    emitter.emit(Json.create({
      time: 1
    } as Json))
  })

  it('auto-loading throws when handling invalid event handler file', (done) => {
    const int32 = 12345687984
    let errorEmitted = false

    emitter.on(Event.Error, (error) => {
      assert.equal(error.message, 'Failed to auto-load event handler for Binary: garbage is not defined')
      errorEmitted = true
    })

    emitter.on(Event.Ignored, (message: Binary) => {
      assert(errorEmitted)
      assert.equal(message.int32, int32)
      done()
    })

    emitter.emit(Binary.create({
      int32
    } as Binary))
  })

  it('auto-loading throws if no default functions are exported', (done) => {
    let errorEmitted = false

    emitter.on(Event.Error, (error) => {
      assert.equal(error.message, 'Event handler for EmptyBinary must export a default function')
      errorEmitted = true
    })

    emitter.on(Event.Ignored, () => {
      assert(errorEmitted)
      done()
    })

    emitter.emit(EmptyBinary.create({}))
  })

  it('event thrown during auto-loaded setup function execution are emitted as error', (done) => {
    // Auto-load loads the event file
    emitter.throws = true
    emitter.on(Event.Error, (error) => {
      assert.equal(error.message, 'bam')
      done()
    })

    emitter.emit(Join.create({ time: 1 }))

  })

  it('event handlers are auto-loaded and internally cached', () => {
    // Auto-load loads the event file
    emitter.emit(Join.create({ time: 1 }))

    assert.equal(emitter.eventAttached, true)
    assert.equal(emitter.touched, true)

    // Already loaded, auto-load should not run again
    emitter.touched = false
    emitter.eventAttached = false

    emitter.emit(Join.create({ time: 1}))

    assert.equal(emitter.eventAttached, false)
    assert.equal(emitter.touched, true)
  })
})
