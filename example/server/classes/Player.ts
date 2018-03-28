import MessageEmitter, { AutoloadEvents } from 'megadata/classes/MessageEmitter'
import Game from './Game'

import { Color } from 'shared/enums'

const events = require.context('../events/')

@AutoloadEvents(events)
export default class Player extends MessageEmitter {
  public static game: Game = new Game()

  public id: number
  public nickname: string
  public color: Color
  public position: {
    x: number
    y: number
  }

  public destroy() {
    Player.game.leave(this)
  }
}
