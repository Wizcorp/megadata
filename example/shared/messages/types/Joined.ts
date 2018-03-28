import { Type, TypeIds } from '../'
import Join from './Join'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Joined, JsonFormat)
export default class Joined extends Join {
  public id: number
}
