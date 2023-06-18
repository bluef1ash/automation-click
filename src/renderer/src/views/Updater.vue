<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ProgressInfo } from 'builder-util-runtime/out/ProgressCallbackTransform'
import { useConfigStore } from '@renderer/stores/useConfigStore'

const { config } = useConfigStore()
//下载进度条
const progress = ref<ProgressInfo>({
  total: 0,
  delta: 0,
  transferred: 0,
  percent: 0,
  bytesPerSecond: 0
})
onMounted(() => {
  window.api.updateRequest((isDownload: boolean) => {
    if (isDownload) {
      config.isUpdating = true
      config.isUpdated = false
      return
    }
    config.isUpdating = false
  })
  window.api.downloadProgress((progressInfo: ProgressInfo) => {
    console.log(progressInfo, 111)
    if (typeof progressInfo !== 'undefined') {
      progress.value = progressInfo
    }
  })
})
</script>

<template>
  <el-progress
    v-if="config.isUpdating"
    :percentage="progress.percent"
    :stroke-width="2"
    :show-text="false"
    color="#ff0000"
  />
</template>

<style scoped lang="less"></style>
