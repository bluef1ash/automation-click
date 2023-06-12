<script setup lang="ts">
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

const update = (): void => {
  window.api.downloadUpdate()
}
</script>

<template>
  <el-header :class="['flex', configStore.isUpdated ? 'justify-between' : 'justify-end', 'title']">
    <div title="有新版本" class="new-update-icon">
      <svg-icon v-if="configStore.isUpdated" icon-name="icon-new" @click="update" />
    </div>
    <div class="flex justify-end">
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
  </el-header>
</template>

<style scoped lang="less">
.el-header {
  --el-header-padding: 0;
}

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

  .new-update-icon {
    height: 80px;
    width: 80px;
    font-size: 5em;
    -webkit-app-region: no-drag;
    cursor: pointer;

    &:hover {
      background-color: transparent;
    }
  }
}
</style>
