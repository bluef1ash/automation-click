import { ComponentCustomProperties, ComponentInternalInstance, getCurrentInstance } from 'vue'

export default function useCurrentInstance(): {
  proxy: ComponentCustomProperties & Record<string, any>
} {
  const { appContext } = getCurrentInstance() as ComponentInternalInstance
  const proxy = appContext.config.globalProperties
  return {
    proxy
  }
}
