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
  <suspense>
    <main class="relative h-screen" @contextmenu="contextMenu">
      <updater />
      <transition enter-active-class="animate__animated animate__flipInY">
        <analyze v-if="config.page === 'analyze'" />
        <setting v-else />
      </transition>
    </main>
  </suspense>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
