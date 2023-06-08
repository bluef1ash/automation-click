import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ProgressInfo } from 'electron-updater'

const api = {
  analyze: (articleUrl: string, articleClickNumber: number): void => {
    ipcRenderer.send('analyze', articleUrl, articleClickNumber)
  },
  analyzeResult: (callback: (clickCount: string) => void): void => {
    ipcRenderer.on('analyze-result', (_event, clickCount: string) => callback(clickCount))
  },
  contextMenu: (): void => {
    ipcRenderer.send('contextMenu')
  },
  //下载进度条
  downloadProgress: (callback: (progress: ProgressInfo) => void): void => {
    ipcRenderer.on('downloadProgress', (_event, progress) => {
      callback(progress)
    })
  },
  minimize: (): void => {
    ipcRenderer.send('minimize')
  },
  //退出应用
  quit: (): void => {
    ipcRenderer.send('quit')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
