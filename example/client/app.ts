import { Event } from 'megadata/classes/MessageEmitter'
import Game from './classes/Game'

const client = new WebSocket('ws://localhost:8001/')
client.binaryType = 'arraybuffer'

import { Color } from 'shared/enums'

client.onopen = () => {
  const game = new Game({ send: (buffer) => client.send(buffer) })
  const parse = game.createMessageParser()

  game.on(Event.Ignored, (message) => console.warn(
    `received message of type ${message.constructor.name}`,
    `but no listeners are set for it`
  ))

  client.onmessage = async ({ data }) => parse(data)
  client.onclose = () => location.reload()

  let nickname: string | null = null

  while (nickname === null) {
    nickname = prompt('Nickname:')
  }

  game.join(nickname, Color.Red)
}
