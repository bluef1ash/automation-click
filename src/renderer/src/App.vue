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
        <transition enter-active-class="animate__animated animate__flipInY">
          <Analyze v-if="config.page === 'analyze'" />
          <Setting v-else />
        </transition>
      </section>
    </main>
  </Suspense>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
