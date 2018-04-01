import { Type, TypeIds } from '../'
import BinaryFormat, { Int32 } from 'megadata/classes/BinarySerializationFormat'
import Move from './Move'

@Type(TypeIds.Moved, BinaryFormat)
export default class Moved extends Move {

    @Int32
    public playerId: number

}
