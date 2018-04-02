import { Type, TypeIds } from '../'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'
import Json from './Json'

@Type(TypeIds.JsonExtended, JsonFormat)
export default class JsonExtended extends Json {

  public holiday: boolean

}
