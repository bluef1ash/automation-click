<script setup lang="ts">
import { Close, Config, Minus } from '@icon-park/vue-next'

const chooseConfig = (): void => {}

const minimize = (): void => {
  window.api.minimize()
}

const quit = (): void => {
  window.api.quit()
}
</script>

<template>
  <div class="flex justify-end title">
    <config title="设置" theme="outline" size="24" class="icon" @click="chooseConfig" />
    <minus title="最小化" theme="outline" size="24" class="icon minus" @click="minimize" />
    <close title="退出" theme="outline" size="24" class="icon close" @click="quit" />
  </div>
</template>

<style scoped lang="less">
.title {
  -webkit-app-region: drag;
  height: 130px;
  background: -webkit-gradient(linear, left top, left bottom, from(#70a1ff), to(#1e90ff));

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
