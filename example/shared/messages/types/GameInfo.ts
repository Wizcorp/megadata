import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'

import { Color } from 'shared/enums'

export interface IPlayer {
  id: number
  nickname: string
  color: Color
  position: {
    x: number
    y: number
  }
}

@Type(TypeIds.GameInfo, JsonFormat)
export default class GameInfo extends MessageType {
  public players: IPlayer[]
}
