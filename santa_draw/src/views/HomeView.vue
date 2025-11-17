<template>
  <div class="min-h-screen flex flex-col lg:flex-row overflow-hidden relative">
    <div class="snowfall"></div>
    <!-- Left side - Hidden on mobile, visible on desktop -->
    <div class="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]"></div>

      <ChristmasTree
          variant="large"
          customClass="absolute left-10 top-1/2 -translate-y-1/2 opacity-40" />

      <ChristmasTree
          variant="small"
          customClass="absolute right-16 top-1/2 -translate-y-1/2 opacity-30" />

      <div class="absolute left-8 top-1/2 translate-y-16 z-10">
        <GiftBox
            size="20"
            box-color="linear-gradient(to bottom right, #34d399, #059669)"
            ribbon-color="#dc2626"
            customClass="absolute left-8 top-1/2 translate-y-16 rotate-3" />

        <GiftBox
            size="14"
            box-color="linear-gradient(to bottom right, #ef4444, #b91c1c)"
            ribbon-color="#fcd34d"
            customClass="absolute -right-6 top-4 rotate-6" />
      </div>

      <div class="absolute right-12 top-1/2 translate-y-16 z-10">
        <GiftBox
            size="16"
            box-color="linear-gradient(to bottom right, #3b82f6, #1e40af)"
            ribbon-color="#ffffff"
            customClass="absolute right-12 top-1/2 translate-y-16" />
      </div>

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

      <div ref="santaRef" class="relative z-10">
        <SantaAvatar class="relative z-10" :size="400" />
      </div>
    </div>

    <!-- Right side - Full width on mobile -->
    <div
        class="w-full lg:w-1/2 bg-gradient-to-b from-red-700 via-red-600 to-red-800
         flex flex-col items-center justify-center p-4 md:p-6 relative min-h-screen lg:min-h-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]"></div>

      <div class="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-yellow-200/20 blur-2xl"></div>
      <div class="absolute -right-16 top-10 w-52 h-52 rounded-full bg-red-300/20 blur-3xl"></div>
      <div class="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-green-300/15 blur-2xl"></div>

      <!-- Mobile Santa Avatar - Top of page -->
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
          @login-success="router.push('/draw/manual')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SantaAvatar from "@/components/christmas/SantaAvatar.vue";
import ChristmasTree from "@/components/christmas/ChristmasTree.vue";
import GiftBox from "@/components/christmas/GiftBox.vue";
import ChristmasBell from "@/components/christmas/ChristmasBell.vue";
import DecorativeLight from "@/components/christmas/DecorativeLight.vue";
import IntroCard from "@/components/landing/IntroCard.vue";
import RegisterCard from "@/components/landing/RegisterCard.vue";
import LoginCard from "@/components/landing/LoginCard.vue";

const router = useRouter()
const route = useRoute()

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

<style scoped>
@keyframes sleigh-fly {
  0% { transform: translateX(-100px) translateY(0) rotate(-8deg); }
  100% { transform: translateX(calc(100vw + 10px)) translateY(-30px) rotate(2deg); }
}

.animate-sleigh-fly {
  animation: sleigh-fly 25s linear infinite;
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 3px #EF4444) drop-shadow(0 0 6px #EF4444);
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 8px #FCA5A5) drop-shadow(0 0 12px #FCA5A5);
    opacity: 0.8;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

@keyframes twinkle-delayed {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.animate-swing {
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}
</style>