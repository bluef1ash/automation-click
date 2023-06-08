import { ElMessage } from 'element-plus'

let messageDom = null
const resetMessage = (options): void => {
  if (messageDom) {
    // @ts-ignore
    messageDom.close()
  }
  // @ts-ignore
  messageDom = ElMessage(options)
}
const typeArr = ['success', 'error', 'warning', 'info']
typeArr.forEach((type) => {
  resetMessage[type] = (options): void => {
    if (typeof options === 'string') {
      options = { message: options }
    }
    options.type = type
    return resetMessage(options)
  }
})
export default resetMessage
