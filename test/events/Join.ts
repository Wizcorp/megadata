import { AutoloadEmitter } from 'test/classes/MessageEmitter/autoload'

import Join from '../types/Join'
export default function (emitter: AutoloadEmitter) {
  if (emitter.throws) {
    throw new Error('bam')
  }

  emitter.on(Join, (_message) => emitter.touched = true)
  emitter.eventAttached = true
}
