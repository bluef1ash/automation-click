import { ElectronAPI } from '@electron-toolkit/preload'

export declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      analyze: (articleUrl: string, articleClickNumber: number) => void
      analyzeResult: (callback: (clickCount: string) => void) => void
      contextMenu: () => void
      downloadProgress: (callback: (progress: ProgressInfo) => void) => void
      minimize: () => void
      quit: () => void
    }
  }
}
