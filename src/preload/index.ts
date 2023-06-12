import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ProgressInfo, UpdateInfo } from 'electron-updater'
import { FindChromeTyping } from '../utils/find_chrome'
import { AnalyzeResultStatus } from '../config/constant'

const api = {
  analyze: (
    chromePath: FindChromeTyping,
    articleUrl: string,
    articleClickNumber: number,
    intervals: number
  ): void => {
    ipcRenderer.send(
      'analyze',
      JSON.stringify(chromePath),
      articleUrl,
      articleClickNumber,
      intervals
    )
  },
  analyzeResult: (callback: (status: AnalyzeResultStatus, clickCount: string) => void): void => {
    ipcRenderer.on('analyze-result', (_event, status: AnalyzeResultStatus, clickCount: string) =>
      callback(status, clickCount)
    )
  },
  findChrome: (): void => {
    ipcRenderer.send('find-chrome')
  },
  findChromeResult: (callback: (findChromeTyping: FindChromeTyping) => void): void => {
    ipcRenderer.on('find-chrome-result', (_event, findChromeTyping: FindChromeTyping) =>
      callback(findChromeTyping)
    )
  },
  openFindChromeDialog: (): string => {
    return ipcRenderer.sendSync('open-find-chrome-dialog')
  },
  clickCount: (callback: (clickCountForWeb: string, clickCount: number) => void): void => {
    ipcRenderer.on('click-count', (_event, clickCountForWeb: string, clickCount: number) =>
      callback(clickCountForWeb, clickCount)
    )
  },
  updateAvailable: (callback: (updateInfo: UpdateInfo) => void): void => {
    ipcRenderer.on('update-available', (_event, updateInfo: UpdateInfo) => callback(updateInfo))
  },
  downloadUpdate: (): void => {
    ipcRenderer.send('download-update')
  },
  contextMenu: (): void => {
    ipcRenderer.send('context-menu')
  },
  //下载进度条
  downloadProgress: (callback: (progress: ProgressInfo) => void): void => {
    ipcRenderer.on('download-progress', (_event, progress) => callback(progress))
  },
  updateDownloaded: (callback: () => void): void => {
    ipcRenderer.on('update-downloaded', () => callback())
  },
  minimize: (): void => {
    ipcRenderer.send('minimize')
  },
  //退出应用
  quit: (): void => {
    ipcRenderer.send('quit')
  },
  readClipboard: (): void => {
    ipcRenderer.send('read-clipboard')
  },
  readClipboardResult: (callback: (result: string) => void): void => {
    ipcRenderer.on('read-clipboard-result', (_event, result) => callback(result))
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
