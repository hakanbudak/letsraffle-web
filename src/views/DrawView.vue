<template>
  <ChristmasScene :garland="false" :mobile-garland="false" :pines="false" :ground="false" glow-x="50%" glow-y="0%" :snow="8">
    <DrawLayout />
  </ChristmasScene>
</template>

<script setup lang="ts">
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import DrawLayout from "@/components/draw/DrawLayout.vue";
</script>
