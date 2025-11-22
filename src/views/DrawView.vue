<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>

    <ChristmasTree
        variant="large"
        customClass="absolute left-10 bottom-0 translate-y-8 opacity-60" />

    <ChristmasTree
        variant="small"
        customClass="absolute right-10 bottom-0 translate-y-4 opacity-60" />

    <div class="absolute -left-20 top-10 w-56 h-56 rounded-full bg-yellow-200/20 blur-3xl"></div>
    <div class="absolute -right-24 top-24 w-64 h-64 rounded-full bg-red-300/25 blur-3xl"></div>
    <div class="absolute right-10 bottom-10 w-40 h-40 rounded-full bg-green-300/20 blur-2xl"></div>

    <div class="relative z-10 w-full max-w-[103.125rem] px-4 md:px-8">
      <div class="relative flex justify-center">
        <div class="relative -mb-20 -z-10">
          <SantaAvatar :size="200" />
        </div>
      </div>

      <DrawLayout class="mt-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SantaAvatar from "@/components/christmas/SantaAvatar.vue";
import ChristmasTree from "@/components/christmas/ChristmasTree.vue";
import DrawLayout from "@/components/draw/DrawLayout.vue";
</script>

<style scoped>
</style>
