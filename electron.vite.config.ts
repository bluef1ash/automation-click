import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@utils': resolve('src/utils')
      }
    },
    plugins: [
      vue(),
      optimizer({
        electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer }`,
        fs: () => ({
          find: /^(node:)?fs$/,
          code: `const fs = require('fs'); export { fs as default }`
        }),
        child_process: () => ({
          find: /^(node:)?child_process$/,
          code: `const child_process = import.meta.glob('child_process'); export { child_process as default }`
        })
      })
    ]
  }
})
