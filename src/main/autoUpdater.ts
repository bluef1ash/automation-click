import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
//自动下载更新
autoUpdater.autoDownload = false
//退出时自动安装更新
autoUpdater.autoInstallOnAppQuit = false
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  autoUpdater.updateConfigPath = join(__dirname, '../../dev-app-update.yml')
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true
    }
  })
}

autoUpdater.on('checking-for-update', (): void => {})

//有新版本时
autoUpdater.on('update-available', (updateInfo) => {
  BrowserWindow.getAllWindows().map((win) => win.webContents.send('update-available', updateInfo))
})

//没有新版本时
autoUpdater.on('update-not-available', ({ version }) => {
  BrowserWindow.getAllWindows().map((win) => win.webContents.send('version', version))
})

ipcMain.on('download-update', (): void => {
  dialog
    .showMessageBox(
      new BrowserWindow({
        show: false,
        alwaysOnTop: true
      }),
      {
        type: 'question',
        title: '更新提示',
        message: '有新版本发布了',
        buttons: ['更新', '取消'],
        cancelId: 1
      }
    )
    .then((res) => {
      if (res.response === 0) {
        //开始下载更新
        autoUpdater.downloadUpdate().then()
      }
    })
})

//更新下载完毕
autoUpdater.on('update-downloaded', () => {
  BrowserWindow.getAllWindows().map((win) => win.webContents.send('update-downloaded'))
  autoUpdater.quitAndInstall()
})

//更新发生错误
autoUpdater.on('error', () => {})

// 监听下载进度
autoUpdater.on('download-progress', (progress) => {
  BrowserWindow.getAllWindows().map((win) => win.webContents.send('download-progress', progress))
})
