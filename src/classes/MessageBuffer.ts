import MessageType, { IMessageType } from "megadata/classes/MessageType";

/**
 * Exposed properties of T to alter the strategy.
 */
export type BufferStrategyOptions<T extends IBufferStrategy> = Partial<T> | Exclude<T, IBufferStrategy>

/**
 * Passed to MessageEmitter#send
 */
export type BufferStrategy<T extends IBufferStrategy> = { strategy: new () => T, options?: BufferStrategyOptions<T> }

/**
 * Returned by IBufferStrategy#result
 */
export type BufferStrategyResult = ArrayBuffer | ArrayBuffer[] | null

/**
 * Decorator: A BufferStrategy may be Scheduled, in which case a IMessageBufferScheduler
 * is necessary to free the buffer. By default a BufferStrategy is not scheduled.
 */
export function Scheduled() {
    return <T extends IBufferStrategy>(constructor: new () => T) => {
        Object.defineProperty(constructor, '_scheduled', {
            value: true
        })
    }
}

/**
 * Defines a behavior for message buffering.
 */
export interface IBufferStrategy {

    /**
     * Passes a new buffer of the given type into the strategy. Additional options can be used
     * to alter the behavior. The return value indicates wether the strategy finished or not.
     * A strategy that never returns true (e.g. time-based) need to be marked with @Scheduled.
     * @param type
     * @param buffer 
     * @param options 
     */
    put<T extends IBufferStrategy>(type: IMessageType<MessageType>, buffer: ArrayBuffer, options: BufferStrategyOptions<T> | undefined): boolean | void

    /**
     * Returns the final buffer(s). Can be null if put was never called.
     */
    result(): BufferStrategyResult

    /**
     * Called after the result has been sent. The internal state is expected to be cleaned up since
     * strategies are recycled.
     */
    clear(): void

}

/**
 * Example:
 * Non-scheduled capacity buffer which gets sent once the capacity is full.
 */
export class CapacityBufferStrategy implements IBufferStrategy {

    private _buffers = new Map<IMessageType<MessageType>, ArrayBuffer[]>()

    public capacity = 1

    public put<T extends IBufferStrategy>(type: IMessageType<MessageType>, buffer: ArrayBuffer, options: BufferStrategyOptions<T>) {

        if (options) {
            Object.assign(this, options)
        }

        let buffers = this._buffers.get(type)
        if (!buffers) {
            buffers = [buffer]
            this._buffers.set(type, buffers)
        }

        buffers.push(buffer)
        return buffers.length === this.capacity
    }

    public result() {
        if (this._buffers.size === 0) {
            return null
        }

        // TODO: use for (let [key, value] of ...) when target is es6+
        const buffers = [].concat.apply([], Array.from(this._buffers.values()))
        return buffers
    }

    public clear(): void {
        this._buffers.clear()
    }

}

/**
 * Example:
 * A scheduled buffer which only keeps the last message of a type before a schedule.
 */
@Scheduled()
export class OverwriteBufferStrategy implements IBufferStrategy {

    private _buffers = new Map<IMessageType<MessageType>, ArrayBuffer>()

    public put(type: IMessageType<MessageType>, buffer: ArrayBuffer) {
        this._buffers.set(type, buffer)
    }

    public result() {
        if (this._buffers.size === 0) {
            return null
        }

        // TODO: use for (let [key, value] of ...) when target is es6+
        const buffers = Array.from(this._buffers.values())
        return buffers
    }

    public clear(): void {
        this._buffers.clear()
    }

}

/**
 * A scheduler is registered by an MessageEmitter and in turn calls schedule
 * on the message buffer when e.g. a frame elapses or timeout happens.
 */
export interface IMessageBufferScheduler {
    schedule: () => void
}

export default class MessageBuffer {

    private _utilizedStrategies = new Map<new () => IBufferStrategy, IBufferStrategy>()

    constructor(private send: (buffer: ArrayBuffer) => void) { }

    public store<T extends IMessageType<MessageType>, S extends IBufferStrategy>(type: T, buffer: ArrayBuffer, config: BufferStrategy<S>) {

        const { strategy, options } = config

        // Lazy load strategies used in the MessageBuffer
        let strategyInstance = this._utilizedStrategies.get(strategy)
        if (!strategyInstance) {
            strategyInstance = new strategy()
            this._utilizedStrategies.set(strategy, strategyInstance)
        }

        if (strategyInstance.put(type, buffer, options)) {
            this.finishStrategy(strategyInstance)
        }
    }

    /**
     * Called by IMessageBufferScheduler and processes all strategies marked @Scheduled.
     */
    public schedule() {
        // TODO: use for (let [key, value] of ...) when target is es6+
        const strategies = Array.from(this._utilizedStrategies.values())
        for (let strategy of strategies) {
            if (Object.getPrototypeOf(strategy).constructor.hasOwnProperty('_scheduled')) {
                this.finishStrategy(strategy)
            }
        }
    }

    private finishStrategy(strategy: IBufferStrategy) {
        const result = strategy.result()
        if (result instanceof ArrayBuffer) {
            this.send(result)

        } else if (result instanceof Array) {

            for (let buffer of result) {
                this.send(buffer)
            }
        }

        strategy.clear()
    }

}
