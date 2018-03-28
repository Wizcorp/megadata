import megadata, { TypeDecorator } from 'megadata'
import { Uint8 } from 'megadata/classes/BinarySerializationFormat'

const types = require.context('./types/')

export enum TypeIds {
  Join,
  GameInfo,
  Joined,
  Leaved,
  ChangeColor,
  ChangedColor,
  Move,
  Moved
}

export const Type: TypeDecorator<TypeIds> = megadata(module, types)

export const PlayerId = Uint8
