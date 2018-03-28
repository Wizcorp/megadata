import Game from '../classes/Game'
import GameInfo from 'shared/messages/types/GameInfo'

export default function (game: Game) {
  game.once(GameInfo, (message) => {
    Object.assign(game, message)
  })
}
