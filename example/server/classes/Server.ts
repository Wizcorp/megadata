import { Server as WebSocketServer, IServerOptions } from 'uws'
import MessageEmitter, { Event, IEmitterConfig } from 'megadata/classes/MessageEmitter'

import Player from './Player'

/**
 * Player class interface
 */
export interface IPlayerClass {
  new(config: IEmitterConfig): IPlayer
}

/**
 * Player instance interface
 */
export interface IPlayer extends MessageEmitter {
  destroy(): void
}

/**
 * Server class
 *
 * The server class is in charge of maintaining connectivity
 */
export default class Server extends WebSocketServer {
  constructor(options: IServerOptions, callback?: () => void) {
    super(options, () => {

      this.on('connection', (ws) => {
        const player = new Player({ send: (buffer) => ws.send(buffer) })
        player.on(Event.Ignored, (message) => console.warn(
          `received message of type ${message.constructor.name}`,
          `but no listeners are set for it`
        ))

        ws.on('message', player.createMessageParser())
        ws.on('close', () => player.destroy())
      })

      if (callback) {
        callback()
      }
    })
  }
}
