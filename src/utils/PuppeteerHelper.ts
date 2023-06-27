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
  public static PC_USER_AGENT: string[] = [
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60',
    'Opera/8.0 (Windows NT 5.1; U; en)',
    'Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.50',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.50',
    'Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; en) Presto/2.8.131 Version/11.11',
    'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
    'Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv,2.0.1) Gecko/20100101 Firefox/4.0.1',
    'Mozilla/5.0 (Windows NT 6.1; rv,2.0.1) Gecko/20100101 Firefox/4.0.1',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
    'MAC：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
    'Windows：Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; 360SE)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)',
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.84 Safari/535.11 SE 2.X MetaSr 1.0',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SV1; QQDownload 732; .NET4.0C; .NET4.0E; SE 2.X MetaSr 1.0)',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SE 2.X MetaSr 1.0; SE 2.X MetaSr 1.0; .NET CLR 2.0.50727; SE 2.X MetaSr 1.0)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Maxthon/4.4.3.4000 Chrome/30.0.1599.101 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 UBrowser/4.0.3214.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.4094.1 Safari/537.36',
    'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0;',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; The World)',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; TencentTraveler 4.0)',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Avant Browser)'
  ]
  public static MOBILE_USER_AGENT: string[] = [
    'Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13',
    'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.337 Mobile Safari/534.1+',
    'Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_Wildfire_A3333 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'Mozilla/5.0 (Linux; U; Android 2.3.7; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'Opera/9.80 (Android 2.3.4; Linux; Opera Mobi/build-1107180945; U; en-GB) Presto/2.8.149 Version/11.10',
    'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5',
    'Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
    'MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'Opera/9.80 (Android 2.3.4; Linux; Opera Mobi/build-1107180945; U; en-GB) Presto/2.8.149 Version/11.10',
    'Mozilla/5.0 (Linux; U; Android 2.3.7; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'Mozilla/5.0 (SymbianOS/9.4; Series60/5.0 NokiaN97-1/20.0.019; Profile/MIDP-2.1 Configuration/CLDC-1.1) AppleWebKit/525 (KHTML, like Gecko) BrowserNG/7.1.18124',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; HTC; Titan)',
    'UCWEB7.0.2.37/28/999',
    'NOKIA5700/ UCWEB7.0.2.37/28/999',
    'Openwave/ UCWEB7.0.2.37/28/999',
    'Openwave/ UCWEB7.0.2.37/28/999'
  ]
  private static MAX_WSE = 1
  private static PAGE_COUNT = 1000
  private static _instance: PuppeteerHelper
  private _wseList: string[] = []
  private _pageNum: number[] = []
  private _replaceTimer: number[] = []
  private readonly _puppeteerLaunchOptions: PuppeteerNodeLaunchOptions = {
    headless: 'new', // 以 无头模式（隐藏浏览器界面）运行浏览器
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
    if (
      typeof this._puppeteerLaunchOptions.executablePath === 'undefined' ||
      this._puppeteerLaunchOptions.executablePath === ''
    ) {
      const { executablePath } = await findChrome()
      this._puppeteerLaunchOptions.executablePath = executablePath
    }
    const browser = await puppeteer.launch(this._puppeteerLaunchOptions)
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
   * @param interception
   * @param headers
   * @param openWait
   * @param waitTimeout
   * @param callBack
   */
  public async collect({
    url,
    interception,
    headers,
    openWait,
    waitTimeout,
    prefixCallBack,
    suffixCallBack
  }: {
    url: string
    headers?: Record<string, string>
    interception?: boolean
    openWait?: boolean
    waitTimeout?: number
    prefixCallBack?: (page: Page) => Promise<void>
    suffixCallBack?: (page: Page) => Promise<void>
  }): Promise<void> {
    const browser = await this._currentBrowser()
    // 然后通过 Browser 对象创建页面 Page 对象
    const page = await browser.newPage()
    try {
      interception && (await this.setCustomRequestInterception(page))
      headers && (await page.setExtraHTTPHeaders(headers))
      prefixCallBack && (await prefixCallBack(page))
      await page.goto(url, { waitUntil: 'networkidle0' })
      suffixCallBack && (await suffixCallBack(page))
      openWait && (await this._waitRender(page, waitTimeout))
    } catch (error) {
      console.error(error)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(error.message)
    } finally {
      await page.close()
    }
  }

  /**
   * 拦截无用资源
   * @param page
   * @param resourceTypes
   * @param urls
   */
  public async setCustomRequestInterception(
    page: Page,
    resourceTypes?: string[],
    urls?: string[]
  ): Promise<void> {
    page.on('request', (req) => {
      // 根据请求类型过滤
      const resourceType = req.resourceType()
      const url = req.url()
      if (typeof resourceTypes === 'undefined') {
        resourceTypes = PuppeteerHelper.BLOCKED_RESOURCE_TYPES
      }
      if (typeof urls === 'undefined') {
        urls = PuppeteerHelper.SKIPPED_RESOURCES
      }
      if (resourceTypes.includes(resourceType) || urls.some((u) => url.indexOf(u) > -1)) {
        req.abort()
      } else {
        req.continue()
      }
    })
    await page.setRequestInterception(true)
  }

  /**
   * 伪装浏览器
   * @param page
   */
  public async camouflageBrowser(page: Page): Promise<void> {
    await page.setUserAgent(
      PuppeteerHelper.PC_USER_AGENT[
        Math.floor(Math.random() * PuppeteerHelper.PC_USER_AGENT.length)
      ]
    )
    await page.setCacheEnabled(false)
    await page.evaluateOnNewDocument(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newProto = navigator.__proto__
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete newProto.webdriver
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      navigator.__proto__ = newProto
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.chrome = {
        app: {
          InstallState: 'hehe',
          RunningState: 'haha',
          getDetails: 'xixi',
          getIsInstalled: 'ohno'
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.chrome.csi = (): void => {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.chrome.loadTimes = (): void => {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.chrome.runtime = (): void => {}
      Object.defineProperty(navigator, 'plugins', {
        //伪装真实的插件信息
        get: () => [
          {
            0: {
              type: 'application/x-google-chrome-pdf',
              suffixes: 'pdf',
              description: 'Portable Document Format',
              enabledPlugin: Plugin
            },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin'
          },
          {
            0: {
              type: 'application/pdf',
              suffixes: 'pdf',
              description: '',
              enabledPlugin: Plugin
            },
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            length: 1,
            name: 'Chrome PDF Viewer'
          },
          {
            0: {
              type: 'application/x-nacl',
              suffixes: '',
              description: 'Native Client Executable',
              enabledPlugin: Plugin
            },
            1: {
              type: 'application/x-pnacl',
              suffixes: '',
              description: 'Portable Native Client Executable',
              enabledPlugin: Plugin
            },
            description: '',
            filename: 'internal-nacl-plugin',
            length: 2,
            name: 'Native Client'
          }
        ]
      })
      Object.defineProperty(navigator, 'languages', {
        //添加语言
        get: () => ['zh-CN', 'zh', 'en']
      })
      const originalQuery = window.navigator.permissions.query //notification伪装
      window.navigator.permissions.query = (parameters): Promise<PermissionStatus> =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const getParameter = WebGLRenderingContext.getParameter
      WebGLRenderingContext.prototype.getParameter = (parameter): string => {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) {
          return 'Intel Inc.'
        }
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) {
          return 'Intel(R) Iris(TM) Graphics 6100'
        }
        return getParameter(parameter)
      }
    })
  }

  /**
   * 延迟
   * @param ms
   */
  public async intervals(ms: number): Promise<void> {
    if (ms > 0) {
      await new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}

export default PuppeteerHelper
