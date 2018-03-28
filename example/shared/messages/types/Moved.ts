import { Type, TypeIds, PlayerId } from '../'
import Move from './Move'
import BinaryFormat from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.Moved, BinaryFormat)
export default class Moved extends Move {
  @PlayerId
  public playerId: number
}
