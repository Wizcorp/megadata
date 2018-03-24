import BinarySerializationFormat from './classes/BinarySerializationFormat'
import MessageType, { IMessageType } from './classes/MessageType'
import { ISerializationFormat } from './classes/SerializationFormat'

/**
 * TypeDecoratorReturn represents the type of the function returned by a @Type decorator
 */
export type TypeDecoratorReturn = (target: any) => void

/**
 * TypeDecorator represents the type of the function returned by the 'megadata' default function
 */
export type TypeDecorator<I> = (id: I, format?: ISerializationFormat) => TypeDecoratorReturn

let initialized = false

/**
 * Extract the parent directory and normalize path to forward-slashes
 *
 * Not using Node's path library since it is not available in the browsers
 *
 * @param path
 */
function getPath(path: string) {
  const dir = path.replace(/\\/g, '').split('/')
  dir.pop()
  return dir.join('/')
}

/**
 * 'megadata' type decorator generator
 */
// tslint:disable:variable-name
export default function generateTypeDecorator<I extends number>(
  parentModule: any,
  defaultSerializationFormat: ISerializationFormat = BinarySerializationFormat
) {
  if (initialized) {
    throw new Error('megadata has already been initialized')
  }

  initialized = true

  const typesRegister = new Map<I, typeof MessageType>()

  // Register runtime information onto the MessageType base class
  MessageType.getTypeClassById = (id: number) => typesRegister.get(id as any) as any
  MessageType.typesDirectory = `${getPath(parentModule.id)}/types`
  MessageType.typeIds = parentModule.exports.TypeIds

  return (id: I, format: ISerializationFormat = defaultSerializationFormat) => {
    return <M extends MessageType>(target: IMessageType<M>) => {
      const newClassName = target.name

      if (typesRegister.has(id)) {
        const registeredClassName = typesRegister.get(id)!.name

        throw new Error(
          `Tried to register type ID ${id} to type ${newClassName} `
          + `but already assigned to type ${registeredClassName}`
        )
      }

      target.id = id
      typesRegister.set(id, target as any)

      const { prototype, attributes, size } = target as any
      const hooks = format.create(id, size, attributes)

      Object.assign(prototype, {
        _create: hooks.create,
        _pack: hooks.pack,
        _unpack: hooks.unpack
      })
    }
  }
}
