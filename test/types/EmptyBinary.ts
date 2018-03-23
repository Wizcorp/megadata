import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Binary from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.EmptyBinary, Binary)
export default class EmptyBinary extends MessageType {}
