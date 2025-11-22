<template>
  <div class="pointer-events-none fixed inset-0 z-20" ref="snowContainer"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import Snowflakes from "magic-snowflakes";

const snowContainer = ref<HTMLElement | null>(null);
let snowInstance: Snowflakes | null = null;

const createSnow = () => {
  snowInstance = new Snowflakes({
    color: "#ffffff",
    minOpacity: 0.4,
    maxOpacity: 0.9,
    speed: 1.2,
    wind: true,
    windVariance: 25,
    count: window.innerWidth < 768 ? 40 : 70,
    container: snowContainer.value ?? document.body,
    zIndex: 5,
  });
};

onMounted(() => {
  createSnow();
});

onBeforeUnmount(() => {
  snowInstance?.destroy();
  snowInstance = null;
});
</script>

<style scoped>
:global(.magic-snowflakes__canvas) {
  pointer-events: none !important;
}
</style>


