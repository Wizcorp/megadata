import Player from '../classes/Player'

import Join from 'shared/messages/types/Join'
import GameInfo from 'shared/messages/types/GameInfo'

let nextId = 0

export default function (player: Player) {
  const { game } = Player

  const gameInfo = {
    players: Array.from(game.players.values())
  }

  player.once(Join, (message) => {
    nextId += 1

    player.nickname = message.nickname
    player.color = message.color
    player.id = nextId

    game.join(player)

    gameInfo.players = Array.from(game.players.values())
    player.send(GameInfo, gameInfo)
  })
}
