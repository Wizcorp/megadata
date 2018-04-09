const type = process.argv[2] || `Binary`
const port = 19223

const { app, BrowserWindow } = require('electron')

const http = require('http')
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
  const proc = cp.fork(`../node_modules/webpack-dev-server/bin/webpack-dev-server.js`)
  app.on('before-quit', () => proc.kill('SIGKILL'))

  // open browser window
  const win = new BrowserWindow({
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
  }, 3000)
}

app.on('window-all-closed', () => app.quit())
app.on('ready', start)
