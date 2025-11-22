<template>
  <div
      :class="['inline-block origin-top', swing ? 'animate-swing' : '']"
      :style="{ width: size + 'px', height: size * 1.25 + 'px' }"
  >
    <svg
        :width="size"
        :height="size * 1.25"
        viewBox="0 0 40 50"
        fill="none"
    >
      <path
          d="M 20 10 Q 15 10 15 20 L 15 30 Q 15 40 20 40 Q 25 40 25 30 L 25 20 Q 25 10 20 10 Z"
          :fill="bodyColor"
          :stroke="strokeColor"
          stroke-width="1"
      />

      <circle
          cx="20"
          cy="42"
          r="3"
          :fill="strokeColor"
      />

      <rect
          x="18"
          y="5"
          width="4"
          height="8"
          rx="2"
          :fill="strokeColor"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  bodyColor?: string
  strokeColor?: string
  swing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  bodyColor: "#FCD34D",
  strokeColor: "#B45309",
  swing: true
})
</script>

<style scoped>
@keyframes swing {
  0% { transform: rotate(3deg); }
  50% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

.animate-swing {
  animation: swing 1.5s ease-in-out infinite;
}
</style>
