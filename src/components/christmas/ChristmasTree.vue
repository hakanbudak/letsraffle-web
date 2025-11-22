<template>
  <svg
      :class="customClass"
      :width="isLarge ? 200 : 150"
      :height="isLarge ? 350 : 280"
      :viewBox="isLarge ? '0 0 200 350' : '0 0 150 280'"
      xmlns="http://www.w3.org/2000/svg"
  >
    <template v-if="isLarge">
      <path d="M 100 50 L 40 130 L 60 130 L 20 200 L 50 200 L 10 280 L 100 280 L 100 330 L 80 330 L 80 350 L 120 350 L 120 330 L 100 330 Z" fill="#065F46" />
      <path d="M 100 50 L 160 130 L 140 130 L 180 200 L 150 200 L 190 280 L 100 280 Z" fill="#047857" />
      <path d="M 100 20 L 105 40 L 125 45 L 108 55 L 112 75 L 100 65 L 88 75 L 92 55 L 75 45 L 95 40 Z" fill="#FCD34D" />
      <circle cx="80" cy="150" r="5" fill="#EF4444" class="tree-ornament" />
      <circle cx="120" cy="160" r="5" fill="#3B82F6" class="tree-ornament" />
      <circle cx="70" cy="220" r="5" fill="#FCD34D" class="tree-ornament" />
      <circle cx="130" cy="230" r="5" fill="#EF4444" class="tree-ornament" />
      <circle cx="90" cy="260" r="5" fill="#10B981" class="tree-ornament" />
    </template>

    <template v-else>
      <path d="M 75 40 L 30 110 L 45 110 L 15 170 L 40 170 L 10 240 L 75 240 L 75 260 L 60 260 L 60 280 L 90 280 L 90 260 L 75 260 Z" fill="#065F46" />
      <path d="M 75 40 L 120 110 L 105 110 L 135 170 L 110 170 L 140 240 L 75 240 Z" fill="#047857" />
      <path d="M 75 20 L 78 35 L 93 38 L 81 46 L 84 61 L 75 53 L 66 61 L 69 46 L 57 38 L 72 35 Z" fill="#FCD34D" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'large' | 'small'
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'large',
  customClass: ''
})

const isLarge = computed(() => props.variant === 'large')
</script>

<style scoped>
.tree-ornament {
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}
</style>
