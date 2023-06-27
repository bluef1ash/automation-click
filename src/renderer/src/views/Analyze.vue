<script setup lang="ts">
import { onMounted } from 'vue'
import AppTitle from '@renderer/components/AppTitle.vue'
import AnalyzeMain from '@renderer/components/AnalyzeMain.vue'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import useCurrentInstance from '@renderer/global/useCurrentInstance'
import { FindChromeTyping } from '../../../utils/find_chrome'

const { config } = useConfigStore()
const { proxy } = useCurrentInstance()

onMounted(() => {
  window.api.findChrome()
  window.api.findChromeResult((chromePath: FindChromeTyping) => {
    // console.log(chromePath)
    if (chromePath.executablePath === '') {
      proxy.$message.error('没有安装 Chrome 浏览器，请安装后运行本程序')
      config.runBtnIsDisabled = true
      return
    }
    config.chromePath = chromePath
    config.runBtnIsDisabled = false
  })
})
</script>

<template>
  <el-container direction="vertical" class="h-full">
    <app-title />
    <analyze-main />
  </el-container>
</template>

<style scoped lang="less"></style>
