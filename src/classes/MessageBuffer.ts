import MessageType, { IMessageType, MessageTypeData } from 'megadata/classes/MessageType'

/**
 * Exposed properties of a BufferStrategy
 */
export type BufferStrategyOptions<T extends BufferStrategy> = Partial<T> | Exclude<T, BufferStrategy>

/**
 * Base class for all message buffer strategies.
 */
export abstract class BufferStrategy {

    /**
     * Initially or after a reset options can be set before
     * it becomes initialized.
     */
    private _initialized = false

    /**
     * Passes a IMessageBufferData to the strategy. A strategy may keep or drop it and store an arbitrary number
     * of data until reset() is called.
     * @param data 
     */
    put(data: IMessageBufferData): boolean | void {
        const { options, overwrite } = data.config
        if (!this._initialized || overwrite) {
            Object.assign(this, options)
            this._initialized = false
        }
    }

    /**
     * Returns an array containing all message data to be sent
     */
    abstract result(): IMessageBufferData[]

    /**
     * Called after the result has been sent. The internal state is expected to be cleaned up since
     * strategies are recycled.
     */
    reset() {
        this._initialized = false
    }

}

/**
 * Example:
 * Capacity buffer which gets sent once the capacity is full or when scheduled.
 */
export class CapacityBufferStrategy extends BufferStrategy {

    private _buffers = new Array<IMessageBufferData>()

    public capacity = 1

    public put(data: IMessageBufferData) {
        super.put(data)

        this._buffers.push(data)
        return this._buffers.length === this.capacity
    }

    public result() {
        return this._buffers
    }

    public reset() {
        super.reset()
        this._buffers.length = 0
    }

}

/**
 * Example:
 * A buffer which only keeps the most recent message between schedules.
 */
export class OverwriteBufferStrategy extends BufferStrategy {

    private _messageData?: IMessageBufferData

    public put(data: IMessageBufferData) {
        super.put(data)
        this._messageData = data
    }

    public result() {
        return this._messageData ? [this._messageData] : []
    }

    public reset() {
        super.reset()
        this._messageData = undefined
    }

}

/**
 * A scheduler is responsible for flushing messages and must be either
 * set globally on the MessageBufferPool or passed individually via IBufferConfig.
 */
export interface IMessageBufferScheduler {
    schedule: () => void
}

/**
 * Passed to MessageEmitter#send
 */
export interface IBufferConfig<T extends BufferStrategy> {
    bufferId: number
    strategy: new() => T
    options?: BufferStrategyOptions<T>
    bufferScope?: BufferScope
    overwrite?: boolean
    scheduler?: IMessageBufferScheduler
}

/**
 * Determines into which pool message data goes,
 * by default everything goes into the Instance pool.
 */
export enum BufferScope {
    Instance = 'instance',
    Shared = 'shared'
}

/**
 * Passed into the MessageBufferPool by MessageEmitter#send
 * type.create(data), pack() and send() are only called when necessary.
 */
export interface IMessageBufferData {
    type: IMessageType<MessageType>
    data: MessageTypeData<MessageType>
    send: (buffer: ArrayBuffer) => void
    config: IBufferConfig<BufferStrategy>
}

export interface Pool {
    Shared: Map<number, MessageBuffer>
    Instance: Map<number, MessageBuffer>
    [key: string]: Map<number, MessageBuffer>
}

/**
 * Manages all MessageBuffer instances and has it's own global scheduler.
 * 
 */
export abstract class MessageBufferPool {

    private static readonly _pool: Pool = {
        Shared: new Map<number, MessageBuffer>(),
        Instance: new Map<number, MessageBuffer>(),
    }

    private static _globalScheduler?: IMessageBufferScheduler

    /**
     * Put a new IMessageBufferData into the pool. 
     * @param bufferData
     */
    static pool(bufferData: IMessageBufferData) {

        const { config } = bufferData
        const { bufferId, bufferScope } = config

        // TODO: somehow enum[enumValue] doesnt work to get they key...
        const scope = (bufferScope || BufferScope.Instance)
        const poolName = scope.charAt(0).toUpperCase() + scope.slice(1)
        const pool = MessageBufferPool._pool[poolName]
        
        if (!this._globalScheduler && !config.scheduler) {
            throw new Error('You need to provide a scheduler or call MessageBufferPool.enableGlobalScheduler().')
        }

        let messageBuffer = pool.get(bufferId)
        if (!messageBuffer) {
            messageBuffer = new MessageBuffer()
            pool.set(bufferId, messageBuffer)
        }

        messageBuffer.add(bufferData)
    }

    /**
     * Clear all pools
     */
    static clear() {
        const disposedBuffers = (messageBuffers: MessageBuffer[]) => {
            for (let messageBuffer of messageBuffers) {
                messageBuffer.dispose()
            }            
        }

        // TODO: ES6+ let [key, value] of...
        disposedBuffers(Array.from(this._pool.Instance.values()))
        disposedBuffers(Array.from(this._pool.Shared.values()))

        this._pool.Instance.clear()
        this._pool.Shared.clear()
    }

    /**
     * When not providing a scheduler per MessageBuffer it is necessary
     * to enable a global scheduler. When called without a scheduler
     * the default MessageBufferPoolScheduler is used.
     * @param scheduler
     */
    static enableGlobalScheduler(scheduler?: IMessageBufferScheduler) {
        if (!scheduler) {
            scheduler = new MessageBufferPoolScheduler()
        }

        this._globalScheduler = scheduler
        this._globalScheduler.schedule = () => this.flushMessages()
    }

    /**
     * Global flush for all messages which do not have their own scheduler.
     */
    private static flushMessages() {

        const flushPool = (messageBuffers: MessageBuffer[]) => {
            for (let messageBuffer of messageBuffers) {
                if (!messageBuffer.hasOwnScheduler()) {
                    messageBuffer.schedule()
                }
            }            
        }

        // TODO: ES6+ let [key, value] of...
        flushPool(Array.from(this._pool.Instance.values()))
        flushPool(Array.from(this._pool.Shared.values()))
    }

}

/**
 * The default MessageBufferPool scheduler which will schedule all MessageBuffers
 * without their own scheduler.
 */
export class MessageBufferPoolScheduler implements IMessageBufferScheduler {
    schedule: () => void;

    constructor(private interval: number = 25) {
        setInterval(() => {
            if (this.schedule) {
                this.schedule()
            }
        }, this.interval)
    }
}

/**
 * Filled with message data until full or scheduled.
 */
export default class MessageBuffer {

    private _strategy: BufferStrategy
    private _hasOwnScheduler = false

    public add(bufferData: IMessageBufferData) {

        const { strategy, scheduler } = bufferData.config
        this._hasOwnScheduler = !!scheduler
        if (!this._strategy) {
            this._strategy = new strategy()
        }

        if (this._strategy.put(bufferData)) {
            this.sendMessages()
        }
    }

    public hasOwnScheduler() {
        return this._hasOwnScheduler
    }

    public dispose() {
        if (this._strategy) {
            this._strategy.reset()
        }
    }

    /**
     * Called by an IMessageBufferScheduler to flush the messages regardless
     * of the current state.
     */
    public schedule() {
        this.sendMessages()
    }

    private sendMessages() {
        const result = this._strategy!.result()
        for (let messageData of result) {
            const { type, data, send } = messageData
            const message = type.create(data)
            const buffer = message.pack()
            send(buffer)
            message.release()
        }

        this._strategy.reset()
        this._hasOwnScheduler = false
    }

}
