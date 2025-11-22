<template>
  <div class="min-h-screen flex flex-col lg:flex-row overflow-hidden relative">
    <div class="snowfall"></div>
    <div class="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]"></div>

      <div class="absolute top-32 left-1/2 -translate-x-1/2 z-20 text-center w-full px-8">
        <h1 class="text-7xl font-bold text-amber-50 mb-2 drop-shadow-2xl tracking-wider"
            style="text-shadow: 4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)">
          {{ t("common.tagline") }}
        </h1>
        <h1 class="text-8xl font-bold text-yellow-400 drop-shadow-2xl tracking-wider"
            style="text-shadow: 4px 4px 8px rgba(0,0,0,0.4), 0 0 25px rgba(234,179,8,0.3)">
          {{ t("common.title") }}
        </h1>
      </div>

      <ChristmasTree
          variant="large"
          customClass="absolute left-10 top-1/2 -translate-y-1/2 opacity-40" />

      <ChristmasTree
          variant="small"
          customClass="absolute right-16 top-1/2 -translate-y-1/2 opacity-30" />

      <DecorativeLight
          class="absolute top-1/4 left-1/4 bg-yellow-300 shadow-yellow-300/50"
          :size="12"
          variant="twinkle" />

      <DecorativeLight
          class="absolute top-1/3 right-1/4 bg-red-300 shadow-red-300/50"
          :size="8"
          variant="delayed" />

      <DecorativeLight
          class="absolute top-2/3 left-1/3 bg-green-300 shadow-green-300/50"
          :size="8"
          variant="twinkle" />

      <DecorativeLight
          class="absolute top-1/2 right-1/3 bg-blue-300 shadow-blue-300/50"
          :size="12"
          variant="delayed" />

      <DecorativeLight
          class="absolute bottom-1/3 left-1/4 bg-yellow-300 shadow-yellow-300/50"
          :size="8"
          variant="delayed" />

      <div class="absolute top-16 right-20 animate-swing">
        <ChristmasBell
            size="40"
            class="absolute top-16 right-20"
            swing />
      </div>

      <div ref="santaRef" class="relative z-10 mt-40">
        <SantaAvatar class="relative z-10" :size="400" />
      </div>
    </div>


    <div
        class="w-full lg:w-1/2 bg-gradient-to-b from-red-700 via-red-600 to-red-800
         flex flex-col items-center justify-center p-4 md:p-6 relative min-h-screen lg:min-h-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]"></div>

      <div class="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-yellow-200/20 blur-2xl"></div>
      <div class="absolute -right-16 top-10 w-52 h-52 rounded-full bg-red-300/20 blur-3xl"></div>
      <div class="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-green-300/15 blur-2xl"></div>

      <div class="lg:hidden mb-4 md:mb-6 relative z-10">
        <SantaAvatar :size="120" />
      </div>

      <IntroCard
          v-if="currentPanel === 'intro'"
          @manual-click="goManual"
          @register-click="openRegister" />

      <RegisterCard
          v-else-if="currentPanel === 'register'"
          @go-login="openLogin"
          @back-to-intro="backToIntro"
          @register-success="currentPanel = 'login'" />

      <LoginCard
          v-else
          @go-register="openRegister"
          @back-to-intro="backToIntro"
          @login-success="router.push('/dashboard')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from "vue-i18n";
import SantaAvatar from "@/components/christmas/SantaAvatar.vue";
import ChristmasTree from "@/components/christmas/ChristmasTree.vue";
import ChristmasBell from "@/components/christmas/ChristmasBell.vue";
import DecorativeLight from "@/components/christmas/DecorativeLight.vue";
import IntroCard from "@/components/landing/IntroCard.vue";
import RegisterCard from "@/components/landing/RegisterCard.vue";
import LoginCard from "@/components/landing/LoginCard.vue";

const router = useRouter()
const route = useRoute()
const { t } = useI18n();

const santaRef = ref<HTMLElement | null>(null)
const mousePos = ref({ x: 0, y: 0 })
const leftEye = ref({ x: 0, y: 0 })
const rightEye = ref({ x: 0, y: 0 })

const currentPanel = ref<'intro' | 'register' | 'login'>('intro')

const getEyePosition = (eyeX: number, eyeY: number) => {
  if (!santaRef.value) return { x: 0, y: 0 }

  const rect = santaRef.value.getBoundingClientRect()
  const eyeAbsX = rect.left + eyeX
  const eyeAbsY = rect.top + eyeY

  const angle = Math.atan2(mousePos.value.y - eyeAbsY, mousePos.value.x - eyeAbsX)
  const distance = Math.min(8, Math.hypot(mousePos.value.x - eyeAbsX, mousePos.value.y - eyeAbsY) / 30)

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  }
}

const handleMouseMove = (e: MouseEvent) => {
  mousePos.value = { x: e.clientX, y: e.clientY }
  leftEye.value = getEyePosition(180, 200)
  rightEye.value = getEyePosition(260, 200)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  
  // Check if panel query parameter exists
  const panelParam = route.query.panel as string | undefined
  if (panelParam === 'register') {
    currentPanel.value = 'register'
  } else if (panelParam === 'login') {
    currentPanel.value = 'login'
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const goManual = () => {
  router.push({ path: '/draw/manual', query: { directStart: 'true' } })
}

const openRegister = () => {
  currentPanel.value = 'register'
}

const openLogin = () => {
  currentPanel.value = 'login'
}

const backToIntro = () => {
  currentPanel.value = 'intro'
}

</script>

<style>
@keyframes fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0.3;
  }
}

@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.animate-swing {
  animation: swing 2s ease-in-out infinite;
}
</style>