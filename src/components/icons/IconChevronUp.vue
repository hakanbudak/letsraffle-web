<script setup lang="ts">
const props = defineProps<{ strokeClass: string }>();
defineExpose({ propKeys: Object.keys(props) });
</script>
<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 15l7-7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="strokeClass" />
  </svg>
</template>