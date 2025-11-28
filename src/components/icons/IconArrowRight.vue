<script setup lang="ts">
const props = defineProps<{
  size?: number;
  strokeClass?: string;
}>();

defineExpose({
  propKeys: Object.keys(props)
});
</script>

<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size || 24"
      :height="size || 24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="strokeClass">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
</template>