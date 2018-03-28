import 'tsconfig-paths/register'
import 'megadata/register'

import Server from './classes/Server'

const server = new Server({ port: 8001 })

process.on('SIGINT', () => server.close())
process.on('SIGTERM', () => server.close())
