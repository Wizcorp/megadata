import MessageType from './MessageType'

/**
 * Interface representing the return value of SerializationFormat.create
 */
export interface ISerializerFunctions<T extends MessageType> {
  create: (size: number) => any
  pack: (instance: T, attributes: any) => any
  unpack: (instance: T, attributes: any) => void
}

/**
 * Interface representing the static methods of SerializationFormat
 */
export interface ISerializationFormat {
  create<I extends number, T extends MessageType>(id: I, size: number, attributes: any): ISerializerFunctions<T>
}

/**
 * Serialization format base class
 *
 * All custom Serialization format classes must extend this base class.
 */
export default abstract class SerializationFormat {
  /**
   * Create serialization and deserialization hooks to be applied onto the message class
   *
   * This method must be overridden by the inheriting serialization format class.
   *
   * @param _id
   * @param _size
   * @param _attributes
   */
  public static create<T extends MessageType>(_id: number, _size: number, _attributes: any): ISerializerFunctions<T> {
    throw new Error(`${this.name}.create is not implemented`)
  }
}
