<template>
  <div
      class="relative w-full bg-[#f9d9de]/95 backdrop-blur-md border border-red-200
           rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.5)] px-6 py-8 md:px-10 md:py-10
           min-h-[860px] flex flex-col md:flex-row gap-8 md:gap-10">
    <ParticipantsPanel />

    <DrawActionsPanel />
  </div>
</template>

<script setup lang="ts">
import ParticipantsPanel from "@/components/draw/ParticipantsPanel.vue";
import DrawActionsPanel from "@/components/draw/DrawActionsPanel.vue";
</script>
