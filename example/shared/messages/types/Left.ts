import { Type, TypeIds, PlayerId } from '../'
import BinaryFormat from 'megadata/classes/BinarySerializationFormat'
import Join from './Join'

@Type(TypeIds.Left, BinaryFormat)
export default class Left extends Join {
  @PlayerId
  public id: number
}
