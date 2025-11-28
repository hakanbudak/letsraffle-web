<script setup lang="ts">
const props = defineProps<{ strokeClass: string }>();
defineExpose({ propKeys: Object.keys(props) });
</script>
<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke-width="2" :class="strokeClass" />
    <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="strokeClass" />
  </svg>
</template>