import { dialog, ipcMain } from 'electron'
import findChrome from '../utils/find_chrome'

ipcMain.on('find-chrome', (event) => {
  findChrome({}).then((result) => event.reply('find-chrome-result', result))
})

ipcMain.on('open-find-chrome-dialog', (event) => {
  dialog
    .showOpenDialog({
      title: '请选择 Chrome 浏览器的可执行文件',
      defaultPath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      filters: [
        {
          name: 'chrome',
          extensions: ['exe', 'app', '']
        }
      ]
    })
    .then((result) => {
      event.returnValue = result.filePaths[0]
    })
    .catch((err) => {
      console.error(err)
    })
})
