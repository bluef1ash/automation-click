<script setup lang="ts">
import { ref } from 'vue'
import { ProgressInfo } from 'builder-util-runtime/out/ProgressCallbackTransform'
import { useConfigStore } from '../stores/useConfigStore'

const { config } = useConfigStore()
//下载进度条
const progress = ref<ProgressInfo>({
  total: 0,
  delta: 0,
  transferred: 0,
  percent: 0,
  bytesPerSecond: 0
})
window.api.downloadProgress((progressInfo: ProgressInfo) => {
  progress.value = progressInfo
})
window.api.updateDownloaded(() => {
  config.isUpdated = false
  config.isUpdating = false
})
</script>

<template>
  <el-progress
    v-if="useConfigStore.isUpdating"
    :percentage="progress.percent"
    stroke-width="2"
    :show-text="false"
  />
</template>

<style scoped lang="less"></style>
