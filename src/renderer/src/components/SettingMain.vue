<script setup lang="ts">
import { FolderOpen } from '@icon-park/vue-next'
import { useConfigStore } from '@renderer/stores/useConfigStore'

const { config } = useConfigStore()

const findChrome = (): void => {
  const executablePath = window.api.openFindChromeDialog()
  if (typeof executablePath !== 'undefined') {
    config.chromePath = { executablePath, type: 'stable' }
  }
}
</script>

<template>
  <el-main class="flex flex-col bg-main">
    <el-row class="title mb-1.5">Chrome 浏览器路径</el-row>
    <el-row class="justify-between items-center">
      <el-col :span="21">
        <el-input
          v-model="config.chromePath.executablePath"
          placeholder="Chrome 浏览器路径"
          size="large"
          readonly
        />
      </el-col>
      <el-col :span="2">
        <folder-open title="浏览" theme="outline" size="28" class="icon" @click="findChrome" />
      </el-col>
    </el-row>
  </el-main>
</template>

<style scoped lang="less">
.icon {
  color: #6c9cd5;

  &:hover {
    background-color: #ced6e0;
  }
}

.title {
  font-size: 0.8rem;
}
</style>
