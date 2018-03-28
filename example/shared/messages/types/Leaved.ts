import { Type, TypeIds, PlayerId } from '../'
import BinaryFormat from 'megadata/classes/BinarySerializationFormat'
import Join from './Join'

@Type(TypeIds.Leaved, BinaryFormat)
export default class Leaved extends Join {
  @PlayerId
  public id: number
}
