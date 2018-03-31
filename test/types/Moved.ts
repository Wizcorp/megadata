import { Type, TypeIds } from '../'
import BinaryFormat, { Int32 } from 'megadata/classes/BinarySerializationFormat'
import MessageType from 'megadata/classes/MessageType'

@Type(TypeIds.Moved, BinaryFormat)
export default class Moved extends MessageType {

    @Int32
    public playerId: number

}
