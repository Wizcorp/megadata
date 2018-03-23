import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Json from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Leave, Json)
export default class Leave extends MessageType {
  public time: number
}
