import { ipcMain } from 'electron'
import PuppeteerHelper from '../utils/PuppeteerHelper'
import { FindChromeTyping } from '../utils/find_chrome'
import { PuppeteerNodeLaunchOptions } from 'puppeteer-core'

ipcMain.on(
  'analyze',
  (event, chromePath: string, articleUrl: string, articleClickNumber: number) => {
    analyzer(JSON.parse(chromePath), articleUrl, articleClickNumber)
      .then((result) => event.reply('analyze-result', result))
      .catch(() => event.reply('analyze-result', '-1'))
  }
)

const analyzer = async (
  { executablePath }: FindChromeTyping,
  url: string,
  clickCount: number
): Promise<string> => {
  let clickCountForWeb = '0'
  const puppeteerLaunchOptions: PuppeteerNodeLaunchOptions = {
    headless: 'new',
    executablePath,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote'
      // '--single-process'
    ]
  }
  const puppeteerHelper = PuppeteerHelper.getInstance(puppeteerLaunchOptions)
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  }
  for (let i = 0; i < clickCount; i++) {
    await puppeteerHelper.collect({
      url,
      headers,
      async prefixCcallBack(page) {
        await page.setCacheEnabled(false)
      },
      async suffixCcallBack(page) {
        clickCountForWeb = await page.evaluate((u) => {
          if (u.indexOf('club.autohome') > -1) {
            const elementName = 'span.post-handle-view strong'
            return document.querySelector(elementName)!.innerHTML
          }
          return '0'
        }, url)
        console.log(`点击量：${clickCountForWeb}，第${i + 1}次点击`)
      }
    })
  }
  return clickCountForWeb
}
