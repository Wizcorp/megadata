import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'

import { Color } from 'shared/enums'

@Type(TypeIds.Join, JsonFormat)
export default class Join extends MessageType {
  public nickname: string
  public color: Color
}
