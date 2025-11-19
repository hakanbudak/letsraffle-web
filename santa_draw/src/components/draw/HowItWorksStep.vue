<template>
  <div
      class="step-card group relative"
      :style="{ animationDelay: `${delay}s` }"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div class="relative bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-red-100 group-hover:border-red-300 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-6">
      <div class="absolute top-3 right-3 text-3xl md:text-4xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
        {{ icon }}
      </div>
      <div class="flex-shrink-0">
        <div class="step-number text-7xl md:text-8xl font-bold text-red-600 opacity-30">
          {{ number }}
        </div>
      </div>
      <div class="flex-1 text-center md:text-left">
        <h4 class="text-xl md:text-2xl font-bold text-red-700 mb-3">{{ title }}</h4>
        <p class="text-sm md:text-base text-slate-600 leading-relaxed">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: number;
  icon: string;
  title: string;
  description: string;
  delay: number;
}>();
</script>

<style scoped>
.step-card {
  animation: slideInUp 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>