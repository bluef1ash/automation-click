<script setup lang="ts">
import { ref } from 'vue'
import { useConfigStore } from '@renderer/stores/useConfigStore'
import useCurrentInstance from '@renderer/global/useCurrentInstance'

const { config } = useConfigStore()
const { proxy } = useCurrentInstance()
const articleUrl = ref<string>('')
const articleClickNumber = ref<number>(1)
const runBtnIsLoading = ref<boolean>(false)
const analyzeHandle = async (): Promise<void> => {
  if (!/^[A-z]+:\/\/\S*$/g.test(articleUrl.value)) {
    proxy.$message.error('请输入正确的文章链接')
    return
  }
  runBtnIsLoading.value = true
  window.api.analyze(articleUrl.value, articleClickNumber.value)
  window.api.analyzeResult((clickCount) => {
    if (clickCount !== '-1') {
      proxy.$message.success('运行完成，最后一次点击量为：' + clickCount)
    } else {
      proxy.$message.error('运行失败，请稍后再试')
    }
    runBtnIsLoading.value = false
  })
}
</script>

<template>
  <el-container>
    <el-main>
      <el-input v-model="articleUrl" placeholder="请输入需要点击的文章地址" size="large" />
      <div class="mt-5 bg-blend-color flex justify-around">
        <label for="article_click_number">点击量</label>
        <el-input-number
          id="article_click_number"
          v-model="articleClickNumber"
          :min="1"
          :max="100000"
        />
      </div>
      <div class="mt-6">
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
      </div>
    </el-main>
  </el-container>
</template>

<style scoped lang="less"></style>
