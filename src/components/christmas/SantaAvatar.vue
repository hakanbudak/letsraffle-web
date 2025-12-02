<template>
  <div
      ref="santaRef"
      :class="['relative z-10', wrapperClass]"
      :style="wrapperStyle"
      aria-label="Santa Avatar"
  >
    <svg
        :width="size"
        :height="size * 1.25"
        viewBox="0 0 400 500"
        class="drop-shadow-2xl select-none pointer-events-none"
    >
      <!-- Hat -->
      <path d="M 200 50 L 120 180 L 280 180 Z" fill="#DC2626" stroke="#991B1B" stroke-width="3"/>
      <ellipse cx="200" cy="45" rx="30" ry="15" fill="#FFF" />
      <circle cx="200" cy="50" r="20" fill="#FFF" />

      <!-- Face -->
      <ellipse cx="200" cy="250" rx="120" ry="140" fill="#FBBF77" />

      <!-- Beard -->
      <ellipse cx="200" cy="320" rx="130" ry="100" fill="#FFF" />
      <path d="M 70 250 Q 60 300 80 350 Q 100 380 140 390" fill="#FFF" />
      <path d="M 330 250 Q 340 300 320 350 Q 300 380 260 390" fill="#FFF" />

      <!-- Hat brim -->
      <ellipse cx="200" cy="180" rx="140" ry="25" fill="#FFF" />

      <!-- Eye whites -->
      <ellipse cx="160" cy="200" rx="35" ry="40" fill="#FFF" />
      <ellipse cx="240" cy="200" rx="35" ry="40" fill="#FFF" />

      <!-- Thinking/worried eyes (looking up and to the side) -->
      <g v-if="thinking">
        <!-- Left eye looking up-right with worried brow -->
        <ellipse cx="165" cy="195" rx="20" ry="25" fill="#1F2937" />
        <circle cx="168" cy="190" r="6" fill="#FFF" />
        <!-- Worried eyebrow -->
        <path d="M 135 175 Q 155 170 175 175" fill="none" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        
        <!-- Right eye looking up-right with worried brow -->
        <ellipse cx="245" cy="195" rx="20" ry="25" fill="#1F2937" />
        <circle cx="248" cy="190" r="6" fill="#FFF" />
        <!-- Worried eyebrow -->
        <path d="M 215 175 Q 235 168 255 175" fill="none" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
      </g>
      
      <!-- Normal eyes (following mouse) -->
      <g v-else>
        <circle :cx="160 + leftEye.x" :cy="200 + leftEye.y" r="18" fill="#1F2937" />
        <circle :cx="160 + leftEye.x + 5" :cy="200 + leftEye.y - 5" r="6" fill="#FFF" />
        <circle :cx="240 + rightEye.x" :cy="200 + rightEye.y" r="18" fill="#1F2937" />
        <circle :cx="240 + rightEye.x + 5" :cy="200 + rightEye.y - 5" r="6" fill="#FFF" />
      </g>

      <!-- Nose -->
      <ellipse cx="200" cy="240" rx="20" ry="25" fill="#EF4444" />
      <ellipse cx="205" cy="235" rx="6" ry="8" fill="#FCA5A5" opacity="0.6" />

      <!-- Mouth - worried/thinking expression -->
      <path v-if="thinking" d="M 170 280 Q 200 275 230 280" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round" />
      <!-- Normal smile -->
      <path v-else d="M 170 280 Q 200 295 230 280" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round" />

      <!-- Body -->
      <ellipse cx="200" cy="430" rx="100" ry="80" fill="#DC2626" />
      <ellipse cx="200" cy="400" rx="90" ry="30" fill="#1F2937" />

      <!-- Buttons -->
      <circle cx="200" cy="420" r="10" fill="#FCD34D" stroke="#B45309" stroke-width="2" />
      <circle cx="200" cy="450" r="10" fill="#FCD34D" stroke="#B45309" stroke-width="2" />
      
      <!-- Hand on chin (thinking pose) -->
      <g v-if="thinking">
        <ellipse cx="260" cy="280" rx="25" ry="30" fill="#FBBF77" transform="rotate(-20 260 280)" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  wrapperClass?: string
  wrapperStyle?: Record<string, string>
  trackMouse?: boolean
  thinking?: boolean
}>(), {
  size: 400,
  wrapperClass: '',
  wrapperStyle: () => ({}),
  trackMouse: true,
  thinking: false,
})

const santaRef = ref<HTMLElement | null>(null)
const mousePos = ref({ x: 0, y: 0 })
const leftEye = ref({ x: 0, y: 0 })
const rightEye = ref({ x: 0, y: 0 })

function getEyePosition(eyeX: number, eyeY: number) {
  if (!santaRef.value) return { x: 0, y: 0 }
  const rect = santaRef.value.getBoundingClientRect()
  const eyeAbsX = rect.left + eyeX
  const eyeAbsY = rect.top + eyeY
  const angle = Math.atan2(mousePos.value.y - eyeAbsY, mousePos.value.x - eyeAbsX)
  const distance = Math.min(8, Math.hypot(mousePos.value.x - eyeAbsX, mousePos.value.y - eyeAbsY) / 30)
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
}

function handleMouseMove(e: MouseEvent) {
  mousePos.value = { x: e.clientX, y: e.clientY }
  leftEye.value = getEyePosition(180, 200)
  rightEye.value = getEyePosition(260, 200)
}

onMounted(() => {
  if (props.trackMouse && !props.thinking) {
    window.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (props.trackMouse) {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>
