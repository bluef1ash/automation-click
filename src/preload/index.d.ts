export declare global {
  import { ElectronAPI } from '@electron-toolkit/preload'
  import { FindChromeTyping } from '../utils/find_chrome'

  interface Window {
    electron: ElectronAPI
    api: {
      analyze: (
        chromePath: FindChromeTyping,
        articleUrl: string,
        articleClickNumber: number
      ) => void
      analyzeResult: (callback: (clickCount: string) => void) => void
      findChrome: () => void
      findChromeResult: (callback: (findChromeTyping: FindChromeTyping) => void) => void
      openFindChromeDialog: () => string
      clickCount: (callback: (clickCountForWeb: string, clickCount: number) => void) => void
      contextMenu: () => void
      downloadProgress: (callback: (progress: ProgressInfo) => void) => void
      minimize: () => void
      quit: () => void
    }
  }
}
