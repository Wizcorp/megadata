const type = process.argv[2] || `Binary`
const port = 19223

const http = require('http')
const electron = require('electron')
const cp = require('child_process')

if (!type) {
    console.error('Usage: node ' +  process.argv[1] + ' [type]')
    process.exit(1)
}

function start() {
  const proc = cp.spawn(`node`, [
    `--inspect=${port}`,
    `-r`,
    `ts-node/register`,
    __dirname,
    type
  ])

  proc.stderr.pipe(process.stderr)
  proc.on('exit', () => process.exit())

  setTimeout(() => {
    http.get('http://localhost:' + port + '/json/list', function (res) {
      res.setEncoding('utf8')
      let body = ''
      res.on('data', (data) => body += data)
      res.on('end', () => {
        const data = JSON.parse(body).shift()

        console.log('You may alternatively open the following URL in Google Chrome:')
        console.log('')
        console.log('  ', data.devtoolsFrontendUrl)
        console.log('')

        const win = new electron.BrowserWindow({
            title: type,
            frame: true
        })

        win.loadURL(data.devtoolsFrontendUrl)
        win.on('closed', () => {
          proc.kill(9)
          process.exit(0)
        })

        setTimeout(() => win.maximize(), 100)
      })
    })
  }, 100)
}

electron.app.on('ready', start)
