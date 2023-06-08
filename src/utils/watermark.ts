export function htmlGenWaterMark(options): void {
  // 默认配置
  const defaultOption = {
    id: 'watermark-id',
    // parentEl: '',
    // 防止别人外界破坏
    preventTamper: false,
    // 水印单个图片配置
    width: 110,
    height: 80,
    text: 'watermark',
    font: '20px Times New Roman',
    fontColor: 'rgba(204,204,204,0.45)',
    // 顺时针旋转的弧度
    rotateDegree: (30 * Math.PI) / 180,
    // 平移变换
    translateX: 0,
    translateY: 0,
    // 水印容器的样式
    style: {
      'pointer-events': 'none',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      position: 'fixed',
      'z-index': 1000
    }
  }
  let container

  // 创建水印背景图片
  function createImageUrl(options): string {
    const canvas = document.createElement('canvas')
    const text = options.text
    canvas.width = options.width
    canvas.height = options.height

    const ctx = canvas.getContext('2d')
    if (ctx !== null) {
      ctx.shadowOffsetX = 2 // X轴阴影距离，负值表示往上，正值表示往下
      ctx.shadowOffsetY = 2 // Y轴阴影距离，负值表示往左，正值表示往右
      ctx.shadowBlur = 2 // 阴影的模糊程度
      // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';    //阴影颜色
      ctx.font = options.font
      ctx.fillStyle = options.fontColor
      ctx.rotate(options.rotateDegree)
      ctx.translate(options.translateX, options.translateY)
      ctx.textAlign = 'left'
      // 在 (x, y)位置填充实体文本
      ctx.fillText(text, 35, 32)
    }
    return canvas.toDataURL('image/png')
  }

  // 将背景填充至指定水印位置处
  function createContainer(
    options: {
      id: string
      preventTamper: boolean
      parentEl: string
      style: { left: string; top: string }
      left: number
      top: number
    },
    forceCreate: boolean
  ): HTMLElement {
    const oldDiv = document.getElementById(options.id)
    if (!forceCreate && oldDiv) {
      return container
    }
    const url = createImageUrl(options)
    const div = oldDiv || document.createElement('div')
    div.id = options.id
    // 水印容器的父元素，默认document.body
    let parentEl = options.preventTamper ? document.body : options.parentEl || document.body
    if (typeof parentEl === 'string') {
      if (parentEl.startsWith('#')) {
        parentEl = parentEl.substring(1)
      }
      parentEl = document.getElementById(parentEl)!
    }
    // 返回元素的大小及其相对于视口的位置。
    const rect = parentEl.getBoundingClientRect()
    // 默认：按照父元素的偏移位置
    options.style.left = (options.left || rect.left) + 'px'
    options.style.top = (options.top || rect.top) + 'px'
    div.style.cssText = getStyleText(options)
    div.setAttribute('class', '')
    div.style.background = 'url(' + url + ') repeat top left'
    !oldDiv && parentEl.appendChild(div)
    return div
  }

  // 获取配置中的style
  function getStyleText(options): string {
    let ret = ''
    const style = options.style
    Object.keys(style).forEach((k) => {
      ret += k + ': ' + style[k] + ';'
    })
    return ret
  }

  // 入口函数
  function init(options): void {
    options = !options ? defaultOption : { ...defaultOption, ...options }
    container = createContainer(options, true)
  }

  init(options)
}
