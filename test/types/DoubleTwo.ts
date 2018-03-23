import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Json from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Double, Json)
export default class DoubleTwo extends MessageType {
  public time: number
}
