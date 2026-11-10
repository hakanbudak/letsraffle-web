import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { restoreAuthFromStorage, setupAuthInterceptors } from "@/services/authHelpers";
import { i18n } from "@/i18n";
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

// fade out the boot splash from index.html once the first page has rendered
router.isReady().finally(() => {
  const boot = document.getElementById('boot')
  if (!boot) return
  requestAnimationFrame(() => {
    boot.classList.add('boot-hide')
    setTimeout(() => boot.remove(), 450)
  })
})
