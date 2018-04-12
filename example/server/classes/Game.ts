import MessageType, { MessageTypeData, IMessageType } from 'megadata/classes/MessageType'

import Player from './Player'

import Joined from 'shared/messages/types/Joined'
import Left from 'shared/messages/types/Left'
import { OverwriteBufferStrategy } from 'megadata/classes/MessageBuffer';

export default class Game {
  public players: Map<number, Player> = new Map()

  public join(player: Player) {
    this.players.set(player.id, player)
    this.broadcast(Joined, player, player)
  }

  public leave(player: Player) {
    this.players.delete(player.id)
    this.broadcast(Left, player, player)
  }

  public broadcast<T extends MessageType>(type: IMessageType<T>, data: MessageTypeData<T>, skip?: Player) {
    this.players.forEach((player, id) => {
      if (skip && skip.id === id) {
        return
      }

      player.send(type, data, { 
        bufferId: 1, 
        strategy: OverwriteBufferStrategy,
      })
    })
  }
}
