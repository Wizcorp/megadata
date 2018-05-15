import { EventEmitter2 as EventEmitter } from 'eventemitter2'
import MessageType, { MessageTypeData, IMessageType } from './MessageType'

/**
 * Setup events auto-loading for all instances of this class
 *
 * The class needs to inherit MessageEmitter to take effect
 *
 * @param module Node.js/Webpack module
 * @param folder Path relative to this module to the folder containing events files
 */
export function AutoloadEvents(require: __WebpackModuleApi.RequireContext) {
  return function (target: any) {
    target.prototype.require = require
  }
}

/**
 * Configuration options for message event emitters
 */
export interface IEmitterConfig {
  send?: (buffer: ArrayBuffer) => void
}

/**
 * List of events other than messages that users may listen on
 */
export const enum Event {
  Error = 'error',
  Ignored = 'ignored'
}

/**
 * Callback for Event.Error events
 */
export type ErrorEventCallback = (error: Error) => any

/**
 * Event callback
 */
export type EventCallback<T> = (message: T) => any

/**
 * Retrieve the event name to emit on from an event type
 *
 * @param type Message type or MessageEmitter-specific event
 */
function getTypeEventName<T extends MessageType>(type: IMessageType<T> | Event): string {
  return (type as any).name || type
}

/**
 * MessageEmitter class
 *
 * MessageEmitter instances can be used to simplify listening to
 * and emitting messages.
 */
export default class MessageEmitter {
  /**
   * Known events
   *
   * List of events we have either listened to or
   */
  protected knownEvents: { [eventName: string]: boolean }

  /**
   * Events loaded using the auto-loading mechanism
   *
   * @see `@AutoloadEvents`
   */
  protected autoloadedEvents: { [eventName: string]: <T extends MessageEmitter>(instance: T) => void }

  /**
   * Internal function
   */
  private _send?: (buffer: ArrayBuffer) => void

  /**
   * Internal event emitter
   */
  private emitter = new EventEmitter()

  /**
   * Require instance to use during auto-loading
   */
  private readonly require: __WebpackModuleApi.RequireContext

  constructor(config?: IEmitterConfig) {
    this.autoloadedEvents = {}
    this.knownEvents = {}

    if (config) {
      const { send } = config
      this._send = send
    }
  }

  /**
   * Message Event listener
   *
   * @param type
   * @param callback
   */
  public on(type: Event.Error, callback: ErrorEventCallback): void
  public on(type: Event.Ignored, callback: EventCallback<any>): void
  public on<T extends MessageType>(type: IMessageType<T>, callback: EventCallback<T>): void
  public on<T extends MessageType>(type: IMessageType<T> | Event, callback: any) {
    const name = getTypeEventName(type)
    this.knownEvents[name] = true
    this.emitter.on(name, callback)
  }

  /**
   * Message Event listener
   *
   * @param type
   * @param callback
   */
  public once(type: Event.Error, callback: ErrorEventCallback): void
  public once(type: Event.Ignored, callback: EventCallback<any>): void
  public once<T extends MessageType>(type: IMessageType<T>, callback: EventCallback<T>): void
  public once<T extends MessageType>(type: IMessageType<T> | Event, callback: any) {
    const name = getTypeEventName(type)
    this.knownEvents[name] = true
    this.emitter.once(name, callback)
  }

  /**
   * Synchronously emit a message
   *
   * @param message
   */
  public emit<T extends MessageType>(message: T) {
    const name = this.prepareEmit(message)

    return this.emitter.emit(name, message)
  }

  /**
   * Asynchronously emit a message
   *
   * @param message
   */
  public async emitAsync<T extends MessageType>(message: T) {
    const name = this.prepareEmit(message)
    return this.emitter.emitAsync(name, message)
  }

  /**
   * Utility to create a message parser
   */
  public createMessageParser() {
    return async (buffer: ArrayBuffer) => {
      const instance = MessageType.parse(buffer)
      await this.emitAsync(instance)
      instance.release()
    }
  }

  /**
   * Send message using the configured send function
   *
   * @param type
   * @param data
   */
  public send<T extends MessageType>(type: IMessageType<T>, data: MessageTypeData<T>)  {
    if (!this._send) {
      throw new Error('Instance not configured with a send function')
    }

    const message = type.create(data)
    const buffer = message.pack()

    this._send(buffer)

    message.release()
  }

  /**
   * Prepare a message emission
   *
   * This method will attempt event file auto-loading, and
   * emit an Ignored event if the message type has never
   * been listened to by this listener
   *
   * @param message
   */
  private prepareEmit<T extends MessageType>(message: T) {
    const { constructor: { name } } = message as any
    this.autoload(name)

    if (!this.knownEvents[name]) {
      this.emitIgnored(message)
    }

    return name
  }

  /**
   * Emit message as ignored
   *
   * @param message
   */
  private emitIgnored<T extends MessageType>(message: T) {
    this.emitter.emit(Event.Ignored, message)
  }

  /**
   * Attempt to automatically load event listeners from a file
   *
   * @param name
   */
  private autoload(name: string) {
    if (!this.require || this.autoloadedEvents[name]) {
      return
    }

    try {
      const { default: eventModule } = this.require(`./${name}`)

      if (!eventModule) {
        return this.emitter.emit(Event.Error, new Error(
          `Event handler for ${name} must export a default function`
        ))
      }

      this.autoloadedEvents[name] = eventModule
    } catch (error) {
      return this.handleAutoloadError(name, error)
    }

    try {
      this.autoloadedEvents[name](this)
    } catch (error) {
      this.emitter.emit(Event.Error, error)
    }
  }

  /**
   * Process auto-load errors
   *
   * @param name
   */
  private handleAutoloadError(name: string, error: any) {
    switch (error.code) {
      case 'MODULE_NOT_FOUND':
        break
      default:
        error.message = `Failed to auto-load event handler for ${name}: ${error.message}`
        this.emitter.emit(Event.Error, error)
    }
  }
}
