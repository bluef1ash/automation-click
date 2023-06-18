<script setup lang="ts">
import { onMounted } from 'vue'
import Analyze from '@renderer/views/Analyze.vue'
import Setting from '@renderer/views/Setting.vue'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import Updater from '@renderer/views/Updater.vue'

const { config } = useConfigStore()

onMounted(() => {
  window.api.updateAvailable((updateInfo) => {
    if (updateInfo.version) {
      config.isUpdated = true
      return
    }
    config.isUpdated = false
  })
})
const contextMenu = (): void => window.api.contextMenu()
</script>

<template>
  <Suspense>
    <main class="relative h-screen" @contextmenu="contextMenu">
      <Updater />
      <transition enter-active-class="animate__animated animate__flipInY">
        <Analyze v-if="config.page === 'analyze'" />
        <Setting v-else />
      </transition>
    </main>
  </Suspense>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
