import { app, BrowserWindow, clipboard, ipcMain } from 'electron'

ipcMain.on('minimize', () => BrowserWindow.getFocusedWindow()!.minimize())
//退出应用
ipcMain.on('quit', () => app.quit())

ipcMain.on('read-clipboard', (event) => event.reply('read-clipboard-result', clipboard.readText()))
