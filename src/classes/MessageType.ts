/**
 * Type attributes contain the information
 */
export type TypeAttribute = [string, string]

/**
 * Interface representing the static methods and attributes
 * of the MessageType class
 */
export interface IMessageType<T> {
  name: string
  id: number
  size: number
  attributes: TypeAttribute[]
  pool: any[]

  new(): T
  getTypeClassById<T extends MessageType>(_id: number): IMessageType<T> | undefined
  claim<T extends MessageType>(): T
  release<T extends MessageType>(instance: T): void
  create<T extends MessageType>(this: IMessageType<T>, data?: any): T
  parse<T extends MessageType>(buffer: ArrayBuffer): T
}

// tslint:disable:completed-docs
export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]

// tslint:disable:completed-docs
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>

/**
 * Message Type Data Type
 *
 * This is a type representing an instance of the message type without
 * any inherited methods or attributes attached to it.
 */
export type MessageTypeData<T extends MessageType> = Omit<T, keyof MessageType> & {
  [x: string]: any
}

/**
 * Message type base class
 *
 * This class serves two purposes
 *
 *   1. Serialization/deserialization
 *   2. Resource management (object and buffer pooling)
 */
export default class MessageType {
  /**
   * Reference to the user defined TypeIds enum
   */
  public static typeIds: { [id: number]: string }

  /**
   * ID to type classes map
   */
  public static typesRegister = new Map<number, typeof MessageType>()

  /**
   * Unique identifier when messages of this class are packed
   *
   * See `../types:TypeIds`
   */
  public static readonly id: number

  /**
   * Total size in bytes of unpacked messages of this class
   */
  public static readonly size: number = 1

  /**
   * Transmission type map
   *
   * This is used at runtime to decide how a given
   * value will be transported. For instance, numbers
   * can be boiled down to Uint8 when sent over the wire
   * so to reduce the overall data size.
   */
  public static readonly attributes: TypeAttribute[] = []

  /**
   * Pools
   */
  public static pool: any[]

  /**
   * Require instance used during auto-loading (if present)
   */
  public static require?: IContextualRequire

  /**
   * Dataview instance
   *
   * This will contain serialization/deserialization data
   */
  // tslint:disable:variable-name
  private _data?: any

  /**
   * Retrieve the class for a type using the type ID
   *
   * @param id
   */
  public static getTypeClassById<T extends MessageType>(id: number): IMessageType<T> | undefined  {
    const { typesRegister } = MessageType
    if (!typesRegister.has(id)) {
      if (!this.require) {
        return
      }

      const moduleFile = MessageType.typeIds[id]

      if (!moduleFile) {
        return
      }

      let mod: any

      try {
        mod = this.require('./' + moduleFile)
      } catch (error) {
        error.message = `Failed to auto-load type class ${moduleFile}: ${error.message}`
        throw error
      }

      const { default: typeClass } = mod

      if (!typeClass) {
        throw new Error(`${moduleFile} must export a default type class`)
      }

      typesRegister.set(typeClass.id, typeClass)
    }

    return typesRegister.get(id as any) as any
  }

  /**
   * Claim an instance of this class (or create one if none are available).
   */
  public static claim<T extends MessageType>() {
    if (!this.pool) {
      this.pool = new Array()
    }

    if (this.pool.length > 0) {
      return this.pool.shift() as T
    }

    const instance = new this() as T
    Object.defineProperty(instance, '_data', {
      value: instance._create(instance)
    })

    return instance
  }

  /**
   * Release an instance back into the object pool
   *
   * @param instance
   */
  public static release<T extends MessageType>(instance: T) {
    this.pool.push(instance)
  }

  /**
   * Create an instance of this class, and apply data to it
   *
   * @param data
   */
  public static create<T extends MessageType>(this: IMessageType<T>, data?: MessageTypeData<T>): T {
    const instance = this.claim<T>()

    if (data) {
      Object.assign(instance, data)
    }

    return instance as T
  }

  /**
   * Parse a given buffer and deserialize a message
   *
   * @param buffer
   */
  public static parse<T extends MessageType>(buffer: ArrayBuffer): T {
    const view = new DataView(buffer)
    const id = view.getUint8(0)
    const typeClass = this.getTypeClassById(id)

    if (!typeClass) {
      const type = this.typeIds[id]

      if (!type) {
        throw new Error(`Parse error: received invalid type id ${id}`)
      } else {
        throw new Error(`Parse error: received message of type ${type} but type class is not loaded`)
      }
    }

    const instance = typeClass.claim() as T
    instance.unpack(view)

    return instance
  }

  /**
   * Unpack a given dataview into an object of this class instance
   *
   * @param view DataView
   */
  public unpack(view: DataView) {
    return this._unpack(this, view)
  }

  /**
   * Pack this object instance into a DataView for transmission
   */
  public pack() {
    return this._pack(this, this._data)
  }

  /**
   * Release this object instance back into the object pool.
   */
  public release() {
    const { constructor } = this as any
    constructor.release(this)
  }

  /**
   * Internal function
   *
   * This will be overwritten at runtime with code generated from
   * the information cumulated in `MessageType.attributes`.
   */
  // tslint:disable:variable-name
  // tslint:disable:prefer-function-over-method
  private _create<T extends MessageType>(_instance: T): any {
    throw new Error('_create was not overwritten!')
  }

  /**
   * Internal function
   *
   * This will be overwritten at runtime with code generated from
   * the information cumulated in `MessageType.attributes`.
   *
   * @param view DataView
   * @param obj
   */
  // tslint:disable:variable-name
  private _unpack(_instance: any, _data: any) {
    throw new Error('_unpack was not overwritten!')
  }

  /**
   * Internal function
   *
   * This will be overwritten at runtime with code generated from
   * the information cumulated in `MessageType.attributes`.
   *
   * @param view DataView
   */
  private _pack(_instance: any, _data: any): ArrayBuffer {
    throw new Error('_pack was not overwritten!')
  }
}
