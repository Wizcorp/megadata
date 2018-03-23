import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import BinaryFormat, {
  Uint8,
  Uint16,
  Uint32,
  Int8,
  Int16,
  Int32,
  Float32,
  Float64
} from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.Binary, BinaryFormat)
export default class Binary extends MessageType {
  @Uint8
  public uint8: number

  @Uint16
  public uint16: number

  @Uint32
  public uint32: number

  @Int8
  public int8: number

  @Int16
  public int16: number

  @Int32
  public int32: number

  @Float32
  public float32: number

  @Float64
  public float64: number
}
