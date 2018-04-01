import MessageType from './MessageType'
import SerializationFormat, { ISerializerFunctions } from './SerializationFormat'

/**
 * Type sizes
 */
interface ISizes { [key: string]: number }

const sizes: ISizes = {
  Float32: 4,
  Float64: 8,
  Int8: 1,
  Int16: 2,
  Int32: 4,
  Uint8: 1,
  Uint16: 2,
  Uint32: 4
}

/**
 * Cumulate attribute definitions onto the static class
 *
 * At runtime, the class itself will hold the attribute mapping
 * defined by the decorators assigned to each classes' attributes.
 *
 * @param target
 * @param attribute
 * @param type
 * @param size
 */
function addAttribute<T extends MessageType>(target: T, attribute: string, type: string) {
  const size = sizes[type]
  const { constructor } = target as any
  const parent = Object.getPrototypeOf(constructor)

  if (parent.attributes === constructor.attributes) {
    constructor.attributes = [...parent.attributes]
  }

  constructor.size += size
  constructor.attributes.unshift([attribute, type])
}

/**
 * Mark an attribute as a 32-bit float
 *
 * @param target
 * @param propertyKey
 */
export function Float32<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Float32')
}

/**
 * Mark an attribute as a 64-bit float
 *
 * @param target
 * @param propertyKey
 */
export function Float64<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Float64')
}

/**
 * Mark an attribute as a 8-bit signed integer
 *
 * @param target
 * @param propertyKey
 */
export function Int8<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Int8')
}

/**
 * Mark an attribute as a 16-bit signed integer
 *
 * @param target
 * @param propertyKey
 */
export function Int16<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Int16')
}

/**
 * Mark an attribute as a 32-bit signed integer
 *
 * @param target
 * @param propertyKey
 */
export function Int32<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Int32')
}

/**
 * Mark an attribute as a 8-bit unsigned integer
 *
 * @param target
 * @param propertyKey
 */
export function Uint8<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Uint8')
}

/**
 * Mark an attribute as a 16-bit unsigned integer
 *
 * @param target
 * @param propertyKey
 */
export function Uint16<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Uint16')
}

/**
 * Mark an attribute as a 32-bit unsigned integer
 *
 * @param target
 * @param propertyKey
 */
export function Uint32<T extends MessageType>(target: T, propertyKey: string) {
  addAttribute(target, propertyKey, 'Uint32')
}

/**
 * Dynamically generate a pack function for a given format
 *
 * @param id
 * @param attributes
 */
function createPack<I extends number>(id: I, attributes: any) {
  let offset = 1
  let body = ``

  body += `view.setUint8(0, ${id});\n`

  for (const [name, type] of attributes) {
    const size: number = sizes[type]

    body += `view.set${type}(${offset}, instance.${name});\n`
    offset += size
  }

  body += `return view.buffer;\n`

  return body
}

/**
 * Dynamically create an unpack function for the given type
 *
 * @param format
 */
function createUnpack(attributes: any) {
  let body = ''
  let offset = 1

  for (const [name, type] of attributes) {
    const size: number = sizes[type]

    body += `instance.${name} = view.get${type}(${offset});\n`
    offset += size
  }

  return body
}

/**
 * Binary Serialization Format
 *
 * This serialization format will serialize and deserialize messages based
 * on the attribute information registered by the different decorators provided
 * by this module.
 *
 * ```typescript
 * import { Type, TypeIds } from '../'
 * import MessageType from 'megadata/classes/MessageType'
 * import Binary, { Uint32 } from 'megadata/classes/BinarySerializationFormat'
 *
 * @Type(TypeIds.Join, Binary)
 * export default class Join extends MessageType {
 *   @Uint32
 *   public time?: number
 * }
 * ```
 */
export default class BinarySerializationFormat extends SerializationFormat {
  /**
   * Create serialization and deserialization hooks to be applied onto the message class
   *
   * @param id
   * @param size
   * @param attributes
   */
  // tslint:disable:prefer-function-over-method
  public static create<I extends number, T extends MessageType>(id: I, size: number, attributes: any) {
    return {
      create:	new Function('size', `return new DataView(new ArrayBuffer(${size}))`),
      pack:	new Function('instance', 'view', createPack(id, attributes)),
      unpack:	new Function('instance', 'view', createUnpack(attributes))
    } as ISerializerFunctions<T>
  }
}
