import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import './window'
import './autoUpdater'
import './analyze'
import './findChrome'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 430,
    height: 328,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then()
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then()
    const devtools = new BrowserWindow({ autoHideMenuBar: true })
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
    installExtension(VUEJS_DEVTOOLS).then()
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then()
  }
  log.initialize()
  //检查是否有更新
  autoUpdater.checkForUpdates().then()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
