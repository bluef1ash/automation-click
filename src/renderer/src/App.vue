<script setup lang="ts">
import Analyze from '@renderer/views/Analyze.vue'
import Setting from '@renderer/views/Setting.vue'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import Updater from '@renderer/views/Updater.vue'

const { config } = useConfigStore()
const contextMenu = (): void => window.api.contextMenu()
</script>

<template>
  <Suspense>
    <main class="relative" @contextmenu="contextMenu">
      <Updater />
      <section>
        <Analyze v-if="config.page === 'analyze'" />
        <Setting v-else />
      </section>
    </main>
  </Suspense>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
