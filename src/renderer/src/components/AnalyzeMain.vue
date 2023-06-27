<script setup lang="ts">
import { ref, watch } from 'vue'
import { Notebook } from '@icon-park/vue-next'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import useCurrentInstance from '@renderer/global/useCurrentInstance'
import { AnalyzeResultStatus } from '../../../config/constant'

const { config } = useConfigStore()
const { proxy } = useCurrentInstance()
const articleUrl = ref<string>('')
const articleClickNumber = ref<number>(1)
const intervals = ref<number>(0)
const runBtnIsLoading = ref<boolean>(false)
const isRandomIntervalsDisabled = ref<boolean>(true)
const intervalsDisabled = ref<boolean>(true)

watch(intervals, (value) => {
  if (value === 0) {
    config.isRandomIntervals = false
    isRandomIntervalsDisabled.value = true
  } else {
    isRandomIntervalsDisabled.value = false
  }
})

watch(articleClickNumber, (value) => {
  if (value === 1) {
    intervals.value = 0
    intervalsDisabled.value = true
    config.isRandomIntervals = false
    isRandomIntervalsDisabled.value = true
  } else {
    intervals.value = 2
    intervalsDisabled.value = false
    isRandomIntervalsDisabled.value = false
  }
})

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
    intervals.value * 1000,
    config.isRandomIntervals,
    config.isChromeVisible
  )
  window.api.clickCount((clickCountForWeb: string, clickCount: number) => {
    proxy.$message.info(`文章点击次数为：${clickCountForWeb}，程序点击次数：${clickCount}`)
  })
  window.api.analyzeResult((status: AnalyzeResultStatus, clickCount: string) => {
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
  <el-main class="bg-main flex flex-col justify-between">
    <el-row class="items-center">
      <el-col :span="22">
        <el-input v-model="articleUrl" placeholder="请输入需要点击的文章地址" size="large" />
      </el-col>
      <el-col :span="2" class="pl-2">
        <notebook theme="outline" size="24" title="粘贴" class="paste" @click="pasteArticleUrl" />
      </el-col>
    </el-row>
    <el-row class="items-center justify-between">
      <el-col :span="12">
        <label for="article_click_number" class="input-label">刷新次数</label>
        <el-input-number
          id="article_click_number"
          v-model="articleClickNumber"
          :min="1"
          :max="100000"
        />
      </el-col>
      <el-col :span="12">
        <label for="intervals" class="input-label">间隔时间</label>
        <el-input-number
          id="intervals"
          v-model="intervals"
          :min="0"
          :disabled="intervalsDisabled"
        />
        <label for="intervals" class="input-label">秒</label>
        <el-checkbox
          v-model="config.isRandomIntervals"
          :disabled="isRandomIntervalsDisabled"
          label="是否随机间隔时间"
          title="不超过设置的时间"
        />
      </el-col>
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
