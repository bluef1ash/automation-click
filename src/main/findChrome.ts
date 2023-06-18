import { BrowserWindow, dialog, ipcMain } from 'electron'
import findChrome from '../utils/find_chrome'

ipcMain.on('find-chrome', (event) => {
  findChrome({}).then((result) => event.reply('find-chrome-result', result))
})

ipcMain.on('open-find-chrome-dialog', (event) => {
  dialog
    .showOpenDialog(
      new BrowserWindow({
        show: false,
        alwaysOnTop: true
      }),
      {
        title: '请选择 Chrome 浏览器的可执行文件',
        filters: [
          {
            name: 'chrome',
            extensions: ['exe', 'app', '']
          }
        ]
      }
    )
    .then((result) => {
      event.returnValue = result.filePaths[0]
    })
    .catch((err) => {
      console.error(err)
    })
})
