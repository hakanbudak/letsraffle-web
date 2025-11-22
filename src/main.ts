import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { restoreAuthFromStorage, setupAuthInterceptors } from "@/services/authHelpers";
import { i18n } from "@/i18n";
import './assets/main.css'

restoreAuthFromStorage();
setupAuthInterceptors();

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
