import { app, BrowserWindow, ipcMain } from 'electron'

ipcMain.on('minimize', () => BrowserWindow.getFocusedWindow()!.minimize())
//退出应用
ipcMain.on('quit', () => {
  app.quit()
})
