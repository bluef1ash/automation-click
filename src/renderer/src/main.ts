import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@icon-park/vue/styles/index.css'
import 'animate.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import resetMessage from '@utils/resetMessage'
import { createApp } from 'vue'
import App from './App.vue'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.use(pinia).use(ElementPlus)
app.config.globalProperties.$message = resetMessage
app.mount('#app')
