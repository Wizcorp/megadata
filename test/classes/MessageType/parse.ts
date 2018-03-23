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
      return assert.equal(error.message, 'Parse error: received invalid type id 255')
    }

    throw new Error('Did not throw')
  })

  it('Throws if lazy-loading fails', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)

    view.setUint8(0, TypeIds.MissingTypeClassFile)

    try {
      MessageType.parse(buffer)
    } catch (error) {
      return assert.equal(error.message.substring(0, 32), 'Failed to lazy-load type class: ')
    }

    throw new Error('Did not throw')
  })

  it('Throws if a lazily-loaded type module does not expose a default class', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)

    // Join
    view.setUint8(0, TypeIds.DoesNotExposeDefault)

    try {
      MessageType.parse(buffer)
    } catch (error) {
      return assert.notEqual(error.message.indexOf('does not expose a default class'), -1)
    }

    throw new Error('Did not throw')
  })

  it('Pre-loaded type classes can be used during parsing', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    const time = 123456789

    // Join
    view.setUint8(0, TypeIds.JoinPreloaded)
    view.setUint32(1, time)

    const message = MessageType.parse<JoinPreloaded>(buffer)
    assert.equal(message.constructor.name, 'JoinPreloaded')
    assert.equal(message.time, time)
  })

  it('Type classes yet to be loaded are auto-loaded', () => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    const time = 123456789

    // Join
    view.setUint8(0, TypeIds.Join)
    view.setUint32(1, time)

    const message = MessageType.parse(buffer)
    assert.equal(message.constructor.name, 'Join')
    assert.equal((message as any).time, time)
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
    assert.equal(message.constructor.name, 'Leave')
    assert.equal((message as any).time, time)
  })
})
