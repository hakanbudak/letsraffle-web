import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { restoreAuthFromStorage } from "@/services/authHelpers";
import './assets/main.css'

restoreAuthFromStorage();

const app = createApp(App)
app.use(router)
app.mount('#app')
