import { Type, TypeIds } from 'benchmarks/app'
import MessageType from 'megadata/classes/MessageType'
import JsonFormat from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Json, JsonFormat)
export default class Json extends MessageType {
  public time: number

  public ohai: {
    help: string
    array: number[]
  }
}

export function alter(instance: Json) {
  instance.time = Date.now()
  instance.ohai = {
    help: 'hello' + instance.time.toString(),
    array: [Math.random()]
  }
}
