import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import { Uint32 } from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.JoinPreloaded)
export default class JoinPreloaded extends MessageType {
  @Uint32
  public time: number
}
