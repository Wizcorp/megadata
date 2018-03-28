import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Binary, { Uint32 } from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.JoinPreloaded, Binary)
export default class JoinPreloaded extends MessageType {
  @Uint32
  public time: number
}
