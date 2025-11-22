<template>
  <div
      :class="['absolute', wrapperClass]"
      :style="{
      wrapperStyle,
      animationDuration: duration + 's',
      animationTimingFunction: timing,
      animationIterationCount: loop ? 'infinite' : '1'
    }"
      class="animate-sleigh-fly"
      aria-hidden="true"
  >
    <svg :width="width" :height="height" viewBox="0 0 450 160" class="drop-shadow-2xl">
      <g transform="translate(0, 48)">
        <path d="M 15 48 Q 8 55 15 62 L 145 62 Q 152 55 145 48 Z" fill="#DC2626" stroke="#991B1B" stroke-width="3" />
        <path d="M 20 52 L 140 52" stroke="#B91C1C" stroke-width="2" />
        <path d="M 20 58 L 140 58" stroke="#B91C1C" stroke-width="2" />
        <path d="M 8 65 Q 2 70 8 75 L 22 75" stroke="#654321" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M 138 65 Q 132 70 138 75 L 152 75" stroke="#654321" stroke-width="5" fill="none" stroke-linecap="round" />
        <ellipse cx="80" cy="38" rx="32" ry="24" fill="#8B4513" />
        <path d="M 60 30 Q 80 22 100 30" stroke="#D4AF37" stroke-width="3" fill="none" stroke-linecap="round" />
        <rect x="65" y="48" width="12" height="12" fill="#10B981" rx="2" />
        <rect x="85" y="48" width="12" height="12" fill="#EF4444" rx="2" />
        <rect x="105" y="48" width="12" height="12" fill="#3B82F6" rx="2" />
        <circle cx="35" cy="55" r="4" fill="#FCD34D" />
        <circle cx="125" cy="55" r="4" fill="#10B981" />
        <circle cx="80" cy="55" r="4" fill="#EF4444" />
      </g>

      <path d="M 152 90 L 232 88" stroke="#654321" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.7" />
      <path d="M 152 92 L 312 88" stroke="#654321" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.7" />
      <path d="M 152 95 L 390 88" stroke="#654321" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.7" />

      <g transform="translate(160, 35)">
        <ellipse cx="50" cy="55" rx="26" ry="19" fill="#8B4513" />
        <circle cx="65" cy="41" r="15" fill="#A0522D" />
        <circle cx="71" cy="38" r="5" fill="#2C1810" />
        <circle cx="61" cy="39" r="3" fill="#2C1810" />
        <path d="M 68 23 L 72 12 M 68 23 L 64 15 M 64 15 L 66 9" stroke="#654321" stroke-width="2.8" fill="none" stroke-linecap="round" />
        <path d="M 62 23 L 66 12 M 62 23 L 58 15 M 58 15 L 60 9" stroke="#654321" stroke-width="2.8" fill="none" stroke-linecap="round" />
        <line x1="40" y1="71" x2="40" y2="85" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <line x1="60" y1="71" x2="60" y2="85" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="65" cy="29" rx="4" ry="7" fill="#A0522D" transform="rotate(20 65 29)" />
        <path d="M 22 55 Q 15 52 16 45" stroke="#654321" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>

      <g transform="translate(240, 38)">
        <ellipse cx="50" cy="55" rx="26" ry="19" fill="#8B4513" />
        <circle cx="65" cy="41" r="15" fill="#A0522D" />
        <circle cx="71" cy="38" r="5" fill="#2C1810" />
        <circle cx="61" cy="39" r="3" fill="#2C1810" />
        <path d="M 68 23 L 72 12 M 68 23 L 64 15 M 64 15 L 66 9" stroke="#654321" stroke-width="2.8" fill="none" stroke-linecap="round" />
        <path d="M 62 23 L 66 12 M 62 23 L 58 15 M 58 15 L 60 9" stroke="#654321" stroke-width="2.8" fill="none" stroke-linecap="round" />
        <line x1="40" y1="71" x2="40" y2="86" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <line x1="60" y1="71" x2="60" y2="86" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="65" cy="29" rx="4" ry="7" fill="#A0522D" transform="rotate(20 65 29)" />
        <path d="M 22 55 Q 15 52 16 45" stroke="#654321" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>

      <g transform="translate(320, 30)">
        <ellipse cx="50" cy="55" rx="28" ry="20" fill="#8B4513" />
        <circle cx="65" cy="40" r="16" fill="#A0522D" />
        <circle cx="72" cy="36" r="7" fill="#EF4444" class="animate-glow" />
        <circle cx="62" cy="38" r="3" fill="#2C1810" />
        <path d="M 68 22 L 72 10 M 68 22 L 64 14 M 64 14 L 66 8" stroke="#654321" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 62 22 L 66 10 M 62 22 L 58 14 M 58 14 L 60 8" stroke="#654321" stroke-width="3" fill="none" stroke-linecap="round" />
        <line x1="40" y1="72" x2="40" y2="88" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <line x1="60" y1="72" x2="60" y2="88" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <path d="M 22 55 Q 15 52 16 45" stroke="#654321" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="65" cy="28" rx="4" ry="7" fill="#A0522D" transform="rotate(20 65 28)" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  duration?: number
  timing?: string
  loop?: boolean
  wrapperClass?: string
  wrapperStyle?: Record<string, string>
}>(), {
  width: 450,
  height: 160,
  duration: 25,
  timing: 'linear',
  loop: true,
  wrapperClass: '',
  wrapperStyle: () => ({ top: '3rem', left: '0' })
})
</script>

<style scoped>
@keyframes sleigh-fly {
  0% { transform: translateX(-100px) translateY(0) rotate(-8deg); }
  100% { transform: translateX(calc(100vw + 10px)) translateY(-30px) rotate(2deg); }
}
.animate-sleigh-fly {
  animation-name: sleigh-fly;
}
@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 3px #EF4444) drop-shadow(0 0 6px #EF4444); opacity: 1; }
  50% { filter: drop-shadow(0 0 8px #FCA5A5) drop-shadow(0 0 12px #FCA5A5); opacity: 0.8; }
}
.animate-glow { animation: glow 1.5s ease-in-out infinite; }
</style>
