import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('counter', () => {
  const config = ref({
    page: 'analyze',
    runBtnIsDisabled: false,
    chromePath: { executablePath: '', type: '' },
    isUpdated: false,
    isUpdating: false
  })

  const updateConfig = (): void => {}

  return { config, updateConfig }
})
