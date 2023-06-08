import { htmlGenWaterMark } from './watermark'
import puppeteer, { Browser, Page, PuppeteerNodeLaunchOptions } from 'puppeteer-core'
import findChrome from './find_chrome'

/**
 * Puppeteer 实例
 * 请求到达 -> 连接 Chromium -> 打开 tab 页 -> 运行代码 -> 关闭 tab 页 -> 返回数据
 * */
class PuppeteerHelper {
  private static BLOCKED_RESOURCE_TYPES: string[] = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset'
  ]
  private static SKIPPED_RESOURCES: string[] = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn'
  ]
  private static MAX_WSE = 4
  private static PAGE_COUNT = 1000
  private static _instance: PuppeteerHelper
  private _wseList: string[] = []
  private _pageNum: number[] = []
  private _replaceTimer: number[] = []
  private readonly _puppeteerLaunchOptions: PuppeteerNodeLaunchOptions = {
    headless: true, // 以 无头模式（隐藏浏览器界面）运行浏览器
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-gpu', // GPU硬件加速
      '--disable-dev-shm-usage', // 创建临时文件共享内存
      '--disable-setuid-sandbox', // uid沙盒
      '--no-first-run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
      '--no-sandbox', // 沙盒模式
      '--no-zygote'
      // '--single-process' // 单进程运行
    ]
  }

  private constructor(puppeteerLaunchOptions?: PuppeteerNodeLaunchOptions) {
    if (typeof puppeteerLaunchOptions !== 'undefined') {
      this._puppeteerLaunchOptions = {
        ...this._puppeteerLaunchOptions,
        ...puppeteerLaunchOptions
      }
    }
    this._init()
  }

  public static getInstance(puppeteerLaunchOptions?: PuppeteerNodeLaunchOptions): PuppeteerHelper {
    if (typeof this._instance === 'undefined') {
      if (typeof puppeteerLaunchOptions === 'undefined') {
        this._instance = new PuppeteerHelper()
      } else {
        this._instance = new PuppeteerHelper(puppeteerLaunchOptions)
      }
    }
    return this._instance
  }

  /**
   * 初始化
   * 使用puppeteer.connect比puppeteer.launch启动一个浏览器实例要快很多
   * 当开启多个browser实例时，可以通过缓存wsEndpoint来达到复用的目的
   */
  private _init(): void {
    ;(async (): Promise<void> => {
      for (let i = 0; i < PuppeteerHelper.MAX_WSE; i++) {
        await this._generateBrowser(i)
      }
    })()
  }

  /**
   * 生成指定编号的浏览器
   * @param {number} num 编号
   * */
  private async _generateBrowser(num): Promise<Browser> {
    const findChromePath = await findChrome()
    const executablePath = findChromePath.executablePath
    const browser = await puppeteer.launch({ ...this._puppeteerLaunchOptions, executablePath })
    this._wseList[num] = browser.wsEndpoint()
    this._pageNum[num] = 1
    return browser
  }

  /**
   * 替换当前浏览器实例
   * @param {Promise<Browser>} browser 当前浏览器实例
   * @param {number} num 当前浏览器编号
   * @param {number} retries 重试次数，超过这个次数直接关闭浏览器
   * */
  private async _replaceBrowserInstance(browser, num, retries = 2): Promise<Browser> {
    clearTimeout(this._replaceTimer[num])
    const openPages = await browser.pages()
    const oneMinute = 60 * 1000
    if (openPages && openPages.length > 1 && retries > 0) {
      const nextRetries = retries - 1
      this._replaceTimer[num] = window.setTimeout(
        () => this._replaceBrowserInstance(browser, num, nextRetries),
        oneMinute
      )
      return browser
    }
    browser.close()
    return await this._generateBrowser(num)
  }

  /**
   * 提供浏览器实例
   */
  private async _currentBrowser(): Promise<Browser> {
    const tmp = Math.floor(Math.random() * PuppeteerHelper.MAX_WSE)
    const browserWSEndpoint = this._wseList[tmp]
    let browser
    try {
      browser = await puppeteer.connect({ browserWSEndpoint })
      if (this._pageNum[tmp] > PuppeteerHelper.PAGE_COUNT) {
        browser = this._replaceBrowserInstance(browser, tmp)
      }
    } catch (err) {
      browser = await this._generateBrowser(tmp)
    }
    this._pageNum[tmp] += 1
    return browser
  }

  /**
   * 自定义等待
   * @param  page 页面
   * @param {number} [timeout] 自定义等待时长，单位ms，默认30S
   */
  private async _waitRender(page, timeout): Promise<void> {
    const renderDoneHandle = await page.waitForFunction('window._renderDone', {
      polling: 120,
      timeout: timeout
    })
    const renderDone = await renderDoneHandle.jsonValue()
    if (typeof renderDone === 'object') {
      await page.close()
      throw new Error(`客户端请求重试： -- ${renderDone.msg}`)
    }
  }

  /**
   * 水印
   * @param page
   * @param {string} text 水印文字
   * @return {Promise<void>}
   * @private
   */
  private async _watermark(page, text): Promise<void> {
    await page.addScriptTag({ content: htmlGenWaterMark.toString() })
    await page.evaluate(
      (options) => {
        htmlGenWaterMark(options)
      },
      { text: text }
    )
  }

  /**
   * 截图
   * @param {string} url 网址链接
   * @param {string} selector 选择器
   * @param {object} headers 每个 HTTP 请求都会带上这些请求头。值必须是字符串
   * @param {boolean} openWait 是否开启等待
   * @param {number} waitTimeout 自定义等待时长
   * @param {boolean} openWatermark 是否开启等待
   * @param {string} filePath 图片保存路径,如果未提供，则保存在当前程序运行下的example.png
   * @param {number} width 可视区域宽度，截图设定fullPage,可滚动，因此此设定可能对截图无意义
   * @param {number} height 可视区域高度，截图设定fullPage,可滚动，因此此设定暂时对截图无意义
   * @param {string} screenshotType 截图类型
   * @param {number} altitudeCompensation 高度补偿
   * @param {string} watermarkText 是否开启等待
   * @return {string} 截图存储位置
   */
  public async screenshots({
    url,
    selector,
    headers,
    openWait,
    waitTimeout,
    openWatermark,
    filePath = './example.png',
    width = 800,
    height = 600,
    screenshotType = 'default',
    altitudeCompensation = 0,
    watermarkText = '水印'
  }: {
    url: string
    selector: string
    headers?: Record<string, string>
    openWait?: boolean
    waitTimeout?: number
    openWatermark?: boolean
    filePath?: string
    width?: number
    height?: number
    screenshotType?: 'default' | 'fullPage' | 'window'
    altitudeCompensation?: number
    watermarkText?: string
  }): Promise<Buffer | string | void> {
    const browser = await this._currentBrowser()
    const page = await browser.newPage()
    try {
      await page.setViewport({ width, height })
      headers && (await page.setExtraHTTPHeaders(headers))
      await page.goto(url, {
        waitUntil: 'networkidle0'
      })
      await page.evaluate(() => {
        return {
          width: document.documentElement.clientWidth,
          // document.body.scrollHeight
          height: document.body.clientHeight
        }
      })
      // 加载自定义等待时间
      openWait && (await this._waitRender(page, waitTimeout))
      // 加载水印
      openWatermark && (await this._watermark(page, watermarkText))
      // 针对body元素进行截图
      // const element = await page.$('body');
      // const picture = await page.screenshot({ path: filePath });
      // 调用 page.screenshot() 对页面进行截图
      return await this._capture(page, {
        screenshotType,
        filePath,
        selector,
        altitudeCompensation
      })
    } finally {
      await page.close()
    }
  }

  /**
   * 按照截图类型获取指定区域图片
   * @param page
   * @param {string} screenshotType 截图类型
   * @param {string} filePath 图片保存路径,如果未提供，则保存在当前程序运行下的example.png
   * @param {string} selector 选择器
   * @param {number} altitudeCompensation 高度补偿
   * @return
   */
  private async _capture(
    page: Page,
    { screenshotType, filePath, selector, altitudeCompensation = 0 }
  ): Promise<Buffer | string | void> {
    switch (screenshotType) {
      case 'selector': {
        const element = await page.$(selector)
        const boundingBox = await element!.boundingBox()
        return await element!.screenshot({
          path: filePath,
          clip: boundingBox!
        })
      }
      case 'scrollBody': {
        // page.evaluate方法遍历所有div节点，找到一个scrollHeight大于视口高度的节点，将其标记为滚动节点。如果所有元素节点的scrollHeight都不大于视口高度，则body为滚动节点。
        const { scrollHeight, isBody, width } = await page.evaluate(() => {
          const clientHeight = document.documentElement.clientHeight
          const clientWidth = document.documentElement.clientWidth
          const divs = document.querySelectorAll('div')
          const len = divs.length
          let isBody = false
          let boxEl: HTMLElement | null = null
          let i = 0
          for (; i < len; i++) {
            const div = divs[i]
            if (div.scrollHeight > clientHeight) {
              boxEl = div
              break
            }
          }
          if (boxEl !== null && i === len) {
            boxEl = document.querySelector('body')
            isBody = true
          }
          return {
            scrollHeight: boxEl !== null ? boxEl.scrollHeight : 0,
            isBody: isBody,
            width: clientWidth
          }
        })
        !isBody &&
          (await page.setViewport({ height: scrollHeight + altitudeCompensation, width: width }))
        // 截图
        return await page.screenshot({
          path: filePath,
          fullPage: true
        })
      }
      case 'default':
      default: {
        return await page.screenshot({
          path: filePath,
          fullPage: true
        })
      }
    }
  }

  /**
   * 采集
   * @param url
   * @param headers
   * @param openWait
   * @param waitTimeout
   * @param callBack
   */
  public async collect({
    url,
    headers,
    openWait,
    waitTimeout,
    prefixCcallBack,
    suffixCcallBack
  }: {
    url: string
    headers?: Record<string, string>
    openWait?: boolean
    waitTimeout?: number
    prefixCcallBack?: (page: Page) => Promise<void>
    suffixCcallBack?: (page: Page) => Promise<void>
  }): Promise<void> {
    const browser = await this._currentBrowser()
    // 然后通过 Browser 对象创建页面 Page 对象
    const page = await browser.newPage()
    await this.setRequestInterception(page)
    try {
      headers && (await page.setExtraHTTPHeaders(headers))
      prefixCcallBack && (await prefixCcallBack(page))
      await page.goto(url, {
        waitUntil: 'networkidle0'
      })
      suffixCcallBack && (await suffixCcallBack(page))
      openWait && (await this._waitRender(page, waitTimeout))
    } catch (error) {
      console.error(error)
      throw new Error(`Failed to load ${url}`)
    } finally {
      await page.close()
    }
  }

  /**
   * 拦截无用资源
   * @param page
   * @private
   */
  private async setRequestInterception(page): Promise<void> {
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      // 根据请求类型过滤
      const resourceType = req.resourceType()
      const url = req.url()
      if (
        PuppeteerHelper.BLOCKED_RESOURCE_TYPES.includes(resourceType) ||
        url.indexOf(PuppeteerHelper.SKIPPED_RESOURCES) > -1
      ) {
        req.abort()
      } else {
        req.continue()
      }
    })
  }
}

export default PuppeteerHelper
