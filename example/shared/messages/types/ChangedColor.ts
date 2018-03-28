import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import BinaryFormat from 'megadata/classes/BinarySerializationFormat'

import { Color } from 'shared/enums'

@Type(TypeIds.ChangedColor, BinaryFormat)
export default class ChangeColor extends MessageType {
  public color: Color
}
