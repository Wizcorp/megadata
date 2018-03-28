import Player from '../classes/Player'

import Move from 'shared/messages/types/Move'
import Moved from 'shared/messages/types/Moved'

export default function (player: Player) {
  const { game } = Player
  const moved = {
    playerId: player.id,
    x: 0,
    y: 0
  }

  player.on(Move, (move: Move) => {
    player.position = move
    Object.assign(moved, move)
    game.broadcast(Moved, moved, player)
  })
}
