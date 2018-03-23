import MessageType from './MessageType'
import SerializationFormat, { ISerializerFunctions } from './SerializationFormat'

/**
 * Create a pack function based on a given message ID
 *
 * @param id
 */
function createPack<I extends number>(id: I) {
  return <T extends MessageType>(instance: T, view: DataView) => {
    const str = JSON.stringify(instance)
    const { length } = str

    view.setUint8(0, id)

    for (let i = 0; i < length; i++) {
      view.setUint8(i + 1, str.charCodeAt(i))
    }

    return view.buffer.slice(0, length + 1)
  }
}

/**
 * Unpack function for a given message type
 */
function unpack<T extends MessageType>(instance: T, view: DataView) {
  const str = String.fromCharCode.apply(null, new Uint8Array(view.buffer.slice(1)))
  const vals = JSON.parse(str)
  Object.assign(instance, vals)
}

/**
 * JSON Serialization Format
 *
 * This serialization format will stringify objects to JSON and
 * returned them as an ArrayBuffer prefixed with the message ID.
 * No additional attribute decorators are required
 *
 * ```typescript
 * import { Type, TypeIds } from '../'
 * import MessageType from 'megadata/classes/MessageType'
 * import Json from 'megadata/classes/JsonSerializationFormat'
 *
 * @Type(TypeIds.Leave, Json)
 * export default class Leave extends MessageType {
 *   public time?: number
 * }
 * ```
 */
export default class JsonSerializationFormat extends SerializationFormat {
  /**
   * Maximum buffer size
   *
   * This represents the maximum size of pooled buffers.
   */
  public static maxByteSize = 4 * 1024

  /**
   * Create serialization and deserialization hooks to be applied onto the message class
   *
   * @param id
   * @param _size
   * @param _attributes
   */
  public static create<I extends number, T extends MessageType>(id: I, _size: number, _attributes: any) {
    const { maxByteSize } = this as typeof JsonSerializationFormat

    return {
      create:	(_size: number) => new DataView(new ArrayBuffer(maxByteSize)),
      pack: createPack<I>(id),
      unpack
    } as ISerializerFunctions<T>
  }
}
