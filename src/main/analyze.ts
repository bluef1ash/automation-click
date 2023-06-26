import { BrowserWindow, ipcMain } from 'electron'
import PuppeteerHelper from '../utils/PuppeteerHelper'
import { FindChromeTyping } from '../utils/find_chrome'
import { PuppeteerNodeLaunchOptions } from 'puppeteer-core'
import { AnalyzeResultStatus } from '../config/constant'

ipcMain.on(
  'analyze',
  (
    event,
    chromePath: string,
    articleUrl: string,
    articleClickNumber: number,
    intervals: number,
    isChromeVisible: boolean
  ) =>
    analyzer(JSON.parse(chromePath), articleUrl, articleClickNumber, intervals, isChromeVisible)
      .then((result) => event.reply('analyze-result', AnalyzeResultStatus.SUCCESS, result))
      .catch((reason) => event.reply('analyze-result', AnalyzeResultStatus.ERROR, reason.message))
)

const analyzer = async (
  { executablePath }: FindChromeTyping,
  url: string,
  clickCount: number,
  intervals: number,
  isChromeVisible: boolean
): Promise<string> => {
  let clickCountForWeb = '0'
  const puppeteerLaunchOptions: PuppeteerNodeLaunchOptions = {
    headless: isChromeVisible ? false : 'new',
    executablePath,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process'
      // '--proxy-server=http://:8080'
    ]
  }
  const puppeteerHelper = PuppeteerHelper.getInstance(puppeteerLaunchOptions)
  for (let i = 0; i < clickCount; i++) {
    await puppeteerHelper.collect({
      url,
      async prefixCallBack(page) {
        await puppeteerHelper.camouflageBrowser(page)
      },
      async suffixCallBack(page) {
        clickCountForWeb = await page.evaluate((u) => {
          let element: HTMLElement | null = null
          if (u.indexOf('club.autohome') > -1) {
            const elementName = 'span.post-handle-view > strong'
            element = document.querySelector(elementName)
          }
          if (element === null) {
            throw new Error('找不到对应的标签')
          }
          return element.innerHTML
        }, url)
      }
    })
    BrowserWindow.getAllWindows().map((w) =>
      w.webContents.send('click-count', clickCountForWeb, i + 1)
    )
    if (clickCount - i > 1) {
      await puppeteerHelper.intervals(intervals)
    }
  }
  return clickCountForWeb
}
