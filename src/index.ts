import './register'

import MessageType, { IMessageType } from './classes/MessageType'
import { ISerializationFormat } from './classes/SerializationFormat'

/**
 * TypeDecoratorReturn represents the type of the function returned by a @Type decorator
 */
export type TypeDecoratorReturn = (target: any) => void

/**
 * TypeDecorator represents the type of the function returned by the 'megadata' default function
 */
export type TypeDecorator<I> = (id: I, format: ISerializationFormat) => TypeDecoratorReturn

let initialized = false

/**
 * 'megadata' type decorator generator
 */
// tslint:disable:variable-name
export default function generateTypeDecorator<I extends number>(
  parentModule: NodeModule,
  require?: IContextualRequire
) {
  if (!parentModule.exports.TypeIds) {
    throw new Error(`${parentModule.id} does not export a TypeIds enum!`)
  }

  const { TypeIds } = parentModule.exports

  if (initialized) {
    throw new Error('megadata has already been initialized')
  }

  initialized = true

  MessageType.require = require
  MessageType.typeIds = TypeIds

  return (id: I, format: ISerializationFormat) => {
    return <M extends MessageType>(target: IMessageType<M>) => {
      const { typesRegister } = MessageType
      const newClassName = target.name

      if (typesRegister.has(id)) {
        const registeredClassName = typesRegister.get(id)!.name

        throw new Error(
          `Tried to register type ID ${id} to type ${newClassName} `
          + `but already assigned to type ${registeredClassName}`
        )
      }

      target.id = id
      target.pool = new Array()
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
