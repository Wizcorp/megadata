import MessageEmitter, { AutoloadEvents } from 'megadata/classes/MessageEmitter'

import { Color } from 'shared/enums'
import Join from 'shared/messages/types/Join'

const events = require.context('../events/')

@AutoloadEvents(events)
export default class Game extends MessageEmitter {
  public join(nickname: string, color: Color) {
    this.send(Join, { nickname, color })
  }
}
