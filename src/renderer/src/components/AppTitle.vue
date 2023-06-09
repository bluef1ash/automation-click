<script setup lang="ts">
import { defineProps } from 'vue'
import { ClickTap, Close, Config, Minus } from '@icon-park/vue-next'
import { useConfigStore } from '@renderer/stores/useConfigStore'

const { config: configStore } = useConfigStore()
const { height } = defineProps({ height: { type: String, default: '130px' } })

const minimize = (): void => {
  window.api.minimize()
}

const quit = (): void => {
  window.api.quit()
}
</script>

<template>
  <div class="flex justify-end title">
    <config
      v-if="configStore.page === 'analyze'"
      title="设置"
      theme="outline"
      size="24"
      class="icon"
      @click="configStore.page = 'config'"
    />
    <click-tap
      v-else
      title="自动点击"
      theme="outline"
      size="24"
      class="icon"
      @click="configStore.page = 'analyze'"
    />
    <minus title="最小化" theme="outline" size="24" class="icon minus" @click="minimize" />
    <close title="退出" theme="outline" size="24" class="icon close" @click="quit" />
  </div>
</template>

<style scoped lang="less">
.title {
  -webkit-app-region: drag;
  height: v-bind(height);
  background: -webkit-gradient(linear, left top, left bottom, from(#70a1ff), to(#81a9c1));

  .icon {
    width: 30px;
    height: 30px;
    color: white;
    -webkit-app-region: no-drag;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: #ced6e0;
    }
  }

  .close {
    &:hover {
      background-color: red;
    }
  }

  .minus {
    align-items: end;
  }
}
</style>
