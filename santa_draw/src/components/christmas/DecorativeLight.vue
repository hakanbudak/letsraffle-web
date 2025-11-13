<template>
  <div
      class="rounded-full shadow-lg"
      :class="animationClass"
      :style="{
      width: size + 'px',
      height: size + 'px'
    }"
  >
    <!-- içerik yok, sadece renk/pozisyon parent'ten gelen class ile -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: number
  variant?: 'twinkle' | 'delayed'
}

const props = withDefaults(defineProps<Props>(), {
  size: 12,
  variant: 'twinkle'
})

const animationClass = computed(() =>
    props.variant === 'delayed'
        ? 'animate-twinkle-delayed'
        : 'animate-twinkle'
)
</script>

<style scoped>
@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

@keyframes twinkle-delayed {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

.animate-twinkle-delayed {
  animation: twinkle-delayed 2.3s ease-in-out infinite;
}
</style>
