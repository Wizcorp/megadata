const type = process.argv[2] || `Binary`
const port = 19223

const http = require('http')
const electron = require('electron')
const fs = require('fs')
const cp = require('child_process')
const url = require('url')

if (!type) {
    console.error('Usage: node ' +  process.argv[1] + ' [type]')
    process.exit(1)
}

process.chdir(__dirname)

function start() {
  // compile
  const proc = cp.spawn(`webpack-dev-server`)
  proc.stderr.pipe(process.stderr)
  proc.stdout.pipe(process.stdout)
  process.on('exit', () => proc.kill())

  // open browser window
  const win = new electron.BrowserWindow({
      title: type,
      frame: true,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false
      }
  })

  setTimeout(() => {
    win.loadURL(`http://localhost:${port}/?type=${type}`)
    win.webContents.openDevTools({ mode: 'bottom' })
    setTimeout(() => win.maximize(), 100)
  }, 2000)
}

electron.app.on('ready', start)
