<script setup lang="ts">
import { ref } from 'vue'
import { Notebook } from '@icon-park/vue-next'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import useCurrentInstance from '@renderer/global/useCurrentInstance'
import { AnalyzeResultStatus } from '../../../config/constant'

const { config } = useConfigStore()
const { proxy } = useCurrentInstance()
const articleUrl = ref<string>('')
const articleClickNumber = ref<number>(1)
const intervals = ref<number>(30)
const runBtnIsLoading = ref<boolean>(false)
const analyzeHandle = async (): Promise<void> => {
  if (!/^[A-z]+:\/\/\S*$/g.test(articleUrl.value)) {
    proxy.$message.error('请输入正确的文章链接')
    return
  }
  runBtnIsLoading.value = true
  window.api.analyze(
    config.chromePath,
    articleUrl.value,
    articleClickNumber.value,
    intervals.value * 1000
  )
  window.api.clickCount((clickCountForWeb: string, clickCount: number) => {
    proxy.$message.info(`文章点击次数为：${clickCountForWeb}，程序点击次数：${clickCount}`)
  })
  window.api.analyzeResult((status, clickCount) => {
    if (status === AnalyzeResultStatus.SUCCESS) {
      proxy.$message.success('运行完成，最后一次点击量为：' + clickCount)
    } else {
      proxy.$message.error(clickCount)
    }
    runBtnIsLoading.value = false
  })
}

const pasteArticleUrl = (): void => {
  window.api.readClipboard()
  window.api.readClipboardResult((result) => (articleUrl.value = result))
}
</script>

<template>
  <el-main class="flex flex-col justify-between bg-main">
    <el-row class="mb-6 flex items-center">
      <el-col :span="22">
        <el-input v-model="articleUrl" placeholder="请输入需要点击的文章地址" size="large" />
      </el-col>
      <el-col :span="2" class="pl-2">
        <notebook theme="outline" size="24" title="粘贴" class="paste" @click="pasteArticleUrl" />
      </el-col>
    </el-row>
    <el-row class="flex items-center justify-between mb-6">
      <label for="article_click_number" class="input-label">刷新次数</label>
      <el-input-number
        id="article_click_number"
        v-model="articleClickNumber"
        :min="1"
        :max="100000"
      />
      <label for="intervals" class="input-label">间隔时间</label>
      <el-input-number id="intervals" v-model="intervals" :min="0" />
      <label for="intervals" class="input-label">秒</label>
    </el-row>
    <el-row>
      <el-button
        size="large"
        type="primary"
        round
        class="w-full"
        :disabled="config.runBtnIsDisabled"
        :loading="runBtnIsLoading"
        @click="analyzeHandle"
        >运行
      </el-button>
    </el-row>
  </el-main>
</template>

<style scoped lang="less">
.el-input-number {
  width: 120px;
}

.input-label {
  font-size: 0.9rem;
}

.paste {
  color: #84a7be;
}
</style>
