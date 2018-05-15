import * as assert from 'assert'
import MessageType from 'megadata/classes/MessageType'

import { TypeIds } from 'test'
import JoinPreloaded from 'test/types/JoinPreloaded'
import Leave from 'test/types/Leave'

describe('parse', () => {
  it('Throws if the message ID is invalid', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)

    view.setUint8(0, 255)

    try {
      MessageType.parse(buffer)
    } catch (error) {
      return assert.strictEqual(error.message, 'Parse error: received invalid type id 255')
    }

    throw new Error('Did not throw')
  })

  it('Throws if auto-loading fails', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)

    view.setUint8(0, TypeIds.TypeFileIsADirectory)

    try {
      MessageType.parse(buffer)
    } catch (error) {
      return assert.strictEqual(error.message.split(':')[0], 'Failed to auto-load type class TypeFileIsADirectory')
    }

    throw new Error('Did not throw')
  })

  it('Throws if a auto-loaded type module do not expose a default class', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)

    // Join
    view.setUint8(0, TypeIds.DoesNotExposeDefault)

    try {
      MessageType.parse(buffer)
    } catch (error) {
      return assert.strictEqual(error.message, 'DoesNotExposeDefault must export a default type class')
    }

    throw new Error('Did not throw')
  })

  it('Auto-loading is disabled if a require context is not available', () => {
    const FakeMessageType = Object.assign({}, MessageType)
    FakeMessageType.require = undefined

    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    const time = 123456789

    // Join
    view.setUint8(0, TypeIds.JoinPreloaded)
    view.setUint32(1, time)

    try {
      FakeMessageType.parse<JoinPreloaded>(buffer)
    } catch (error) {
      return assert.strictEqual(error.message, 'Parse error: received message of type JoinPreloaded but type class is not loaded')
    }

    throw new Error('Did not throw')
  })

  it('Auto-loading type classes can be used during parsing', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    const time = 123456789

    // Join
    view.setUint8(0, TypeIds.JoinPreloaded)
    view.setUint32(1, time)

    const message = MessageType.parse<JoinPreloaded>(buffer)
    assert.strictEqual(message.constructor.name, 'JoinPreloaded')
    assert.strictEqual(message.time, time)
  })

  it('Type classes yet to be loaded are auto-loaded', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    const time = 123456789

    // Join
    view.setUint8(0, TypeIds.Join)
    view.setUint32(1, time)

    const message = MessageType.parse(buffer)
    assert.strictEqual(message.constructor.name, 'Join')
    assert.strictEqual((message as any).time, time)
  })

  it('Parsing using JsonSerializationFormat works', () => {
    const buffer = new ArrayBuffer(20)
    const view = new DataView(buffer)
    const time = 123456789
    const data = `{"time": ${time}}`

    // Join
    view.setUint8(0, TypeIds.Leave)
    for (let i = 0; i < data.length; i += 1) {
      view.setUint8(i + 1, data.charCodeAt(i))
    }

    const message = MessageType.parse<Leave>(buffer)
    assert.strictEqual(message.constructor.name, 'Leave')
    assert.strictEqual((message as any).time, time)
  })
})
