import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Json, JsonFormat)
export default class Json extends MessageType {
  public time: number

  public ohai: {
    help: string
    array: number[]
  }
}
