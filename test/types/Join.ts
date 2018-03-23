import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Binary, { Uint32 } from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.Join, Binary)
export default class Join extends MessageType {
  @Uint32
  public time: number
}
