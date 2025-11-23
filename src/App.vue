<template>
  <SnowEffect />
  <LanguageSwitcher />
  <OpenSourceButton />
  <router-view />
</template>

<script setup lang="ts">
import SnowEffect from "@/components/christmas/SnowEffect.vue";
import LanguageSwitcher from "@/components/ui-kit/LanguageSwitcher.vue";
import OpenSourceButton from "@/components/ui-kit/OpenSourceButton.vue";
</script>


