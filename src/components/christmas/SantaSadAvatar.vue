<template>
  <div
      :class="['relative z-10', wrapperClass]"
      :style="wrapperStyle"
      aria-label="Santa Sad Avatar"
  >
    <svg
        :width="size"
        :height="size * 1.25"
        viewBox="0 0 400 500"
        class="drop-shadow-2xl select-none pointer-events-none"
    >
      <path d="M 200 50 L 120 180 L 280 180 Z" fill="#DC2626" stroke="#991B1B" stroke-width="3"/>
      <ellipse cx="200" cy="45" rx="30" ry="15" fill="#FFF" />
      <circle cx="200" cy="50" r="20" fill="#FFF" />

      <ellipse cx="200" cy="250" rx="120" ry="140" fill="#FBBF77" />

      <ellipse cx="200" cy="320" rx="130" ry="100" fill="#FFF" />
      <path d="M 70 250 Q 60 300 80 350 Q 100 380 140 390" fill="#FFF" />
      <path d="M 330 250 Q 340 300 320 350 Q 300 380 260 390" fill="#FFF" />

      <ellipse cx="200" cy="180" rx="140" ry="25" fill="#FFF" />

      <ellipse cx="160" cy="200" rx="35" ry="40" fill="#FFF" />
      <ellipse cx="240" cy="200" rx="35" ry="40" fill="#FFF" />

      <path d="M 145 205 Q 160 215 175 205" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
      <path d="M 225 205 Q 240 215 255 205" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
      <circle cx="160" cy="210" r="12" fill="#1F2937" />
      <circle cx="240" cy="210" r="12" fill="#1F2937" />

      <ellipse cx="200" cy="240" rx="20" ry="25" fill="#EF4444" />
      <ellipse cx="205" cy="235" rx="6" ry="8" fill="#FCA5A5" opacity="0.6" />

      <path d="M 170 290 Q 200 270 230 290" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round" />

      <ellipse cx="200" cy="430" rx="100" ry="80" fill="#DC2626" />
      <ellipse cx="200" cy="400" rx="90" ry="30" fill="#1F2937" />

      <circle cx="200" cy="420" r="10" fill="#FCD34D" stroke="#B45309" stroke-width="2" />
      <circle cx="200" cy="450" r="10" fill="#FCD34D" stroke="#B45309" stroke-width="2" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
  wrapperClass?: string
  wrapperStyle?: Record<string, string>
}>(), {
  size: 400,
  wrapperClass: '',
  wrapperStyle: () => ({}),
})
</script>

