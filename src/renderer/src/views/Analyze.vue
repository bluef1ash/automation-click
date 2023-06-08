<script setup lang="ts">
import { onMounted } from 'vue'
import AppTitle from '@renderer/components/AppTitle.vue'
import AnalyzeMain from '@renderer/components/AnalyzeMain.vue'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import useCurrentInstance from '@renderer/global/useCurrentInstance'
import findChrome from '@utils/find_chrome'

const { config } = useConfigStore()
const { proxy } = useCurrentInstance()
onMounted(() => {
  ;(async function (): Promise<void> {
    const findChromePath = await findChrome({})
    if (findChromePath.executablePath === '') {
      proxy.$message.error('没有安装 Chrome 浏览器，请安装后运行本程序')
      config.runBtnIsDisabled = true
      return
    }
    config.runBtnIsDisabled = false
  })()
})
</script>

<template>
  <AppTitle />
  <AnalyzeMain />
</template>

<style scoped lang="less"></style>
