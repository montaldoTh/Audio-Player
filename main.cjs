const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

function createWindow(){
  const win = new BrowserWindow({
    width: 400,
    height: 470,
    title: 'Player',
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false
    },
    alwaysOnTop: true
  })

  Menu.setApplicationMenu(null)

  win.loadFile(path.join(__dirname, 'dist', 'index.html')).then();
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})