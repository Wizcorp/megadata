import { EventEmitter2 as EventEmitter } from 'eventemitter2'
import MessageType, { IMessageType } from './MessageType'

/**
 * MessageEmitter class
 *
 * MessageEmitter instances can be used to simplify listening to
 * and emitting messages.
 */
export default class MessageEmitter {
  /**
   * Internal event emitter
   */
  private emitter = new EventEmitter()

  /**
   * Message Event listener
   *
   * @param type
   * @param callback
   */
  public on<T extends MessageType>(type: IMessageType<T>, callback: (message: T) => void) {
    this.emitter.on(type.name, callback)
  }

  /**
   * Message Event listener
   *
   * @param type
   * @param callback
   */
  public once<T extends MessageType>(type: IMessageType<T>, callback: (message: T) => void) {
    return this.emitter.once(type.name, callback)
  }

  /**
   * Synchronously emit a message
   *
   * @param message
   */
  public emit<T extends MessageType>(message: T) {
    const { constructor } = message as any
    return this.emitter.emit(constructor.name, message)
  }

  /**
   * Asynchronously emit a message
   *
   * @param message
   */
  public async emitAsync<T extends MessageType>(message: T) {
    const { constructor } = message as any
    return this.emitter.emitAsync(constructor.name, message)
  }
}
