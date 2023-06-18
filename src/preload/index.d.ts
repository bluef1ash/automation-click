import { AnalyzeResultStatus } from '../config/constant'

export declare global {
  import { ElectronAPI } from '@electron-toolkit/preload'
  import { FindChromeTyping } from '../utils/find_chrome'

  interface Window {
    electron: ElectronAPI
    api: {
      analyze: (
        chromePath: FindChromeTyping,
        articleUrl: string,
        articleClickNumber: number,
        intervals: number
      ) => void
      analyzeResult: (callback: (status: AnalyzeResultStatus, clickCount: string) => void) => void
      findChrome: () => void
      findChromeResult: (callback: (findChromeTyping: FindChromeTyping) => void) => void
      openFindChromeDialog: () => string
      clickCount: (callback: (clickCountForWeb: string, clickCount: number) => void) => void
      updateAvailable: (callback: (updateInfo: UpdateInfo) => void) => void
      downloadUpdate: () => void
      updateDownloaded: (callback: () => void) => void
      contextMenu: () => void
      updateRequest: (callback: (isDownload: boolean) => void) => void
      downloadProgress: (callback: (progress: ProgressInfo) => void) => void
      minimize: () => void
      quit: () => void
      readClipboard: () => void
      readClipboardResult: (callback: (result: string) => void) => void
    }
  }
}
