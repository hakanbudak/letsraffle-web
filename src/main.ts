import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { restoreAuthFromStorage, setupAuthInterceptors } from "@/services/authHelpers";
import { i18n } from "@/i18n";
import { watch } from 'vue'
import { applySeo } from "@/utils/seo";
import '@fontsource-variable/fraunces'
import '@fontsource-variable/nunito'
import '@fontsource/great-vibes'
import './assets/main.css'

restoreAuthFromStorage();
setupAuthInterceptors();

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')

// page title, description, canonical and robots follow the current page and language
router.afterEach((to) => applySeo(to))
watch(i18n.global.locale, () => applySeo(router.currentRoute.value))

// fade out the boot splash from index.html once the first page has rendered
router.isReady().finally(() => {
  const boot = document.getElementById('boot')
  if (!boot) return
  requestAnimationFrame(() => {
    boot.classList.add('boot-hide')
    setTimeout(() => boot.remove(), 450)
  })
})
