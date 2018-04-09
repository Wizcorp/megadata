const type = process.argv[2] || `Binary`
const port = 19223

const { app, BrowserWindow } = require('electron')

const http = require('http')
const cp = require('child_process')

if (!type) {
  // Throw so that error popups up on Windows
  throw new Error('Usage: node ' +  process.argv[1] + ' [type]')
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
  proc.stdout.pipe(process.stdout)
  app.on('before-quit', () => proc.kill())

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

        const win = new BrowserWindow({
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
  }, 2000)
}

app.on('window-all-closed', () => app.quit())
app.on('ready', start)
