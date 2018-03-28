import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import BinaryFormat, { Float32 } from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.Move, BinaryFormat)
export default class Move extends MessageType {
  @Float32
  public x: number

  @Float32
  public y: number
}
