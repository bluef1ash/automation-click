<script setup lang="ts">
import { FolderOpen } from '@icon-park/vue-next'
import { useConfigStore } from '@renderer/stores/useConfigStore'

const { config } = useConfigStore()

const findChrome = (): void => {
  config.chromePath = { executablePath: window.api.openFindChromeDialog(), type: 'stable' }
}
</script>

<template>
  <el-container>
    <el-main>
      <div class="title mb-1.5">Chrome 浏览器路径</div>
      <div class="bg-blend-color flex justify-around">
        <el-input
          v-model="config.chromePath.executablePath"
          placeholder="Chrome 浏览器路径"
          size="large"
          readonly
        />
        <folder-open
          title="浏览"
          theme="outline"
          size="24"
          class="ml-3 flex items-center icon"
          @click="findChrome"
        />
      </div>
    </el-main>
  </el-container>
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
