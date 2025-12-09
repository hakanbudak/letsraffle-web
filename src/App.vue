<template>
  <div class="absolute top-4 left-4 z-50">
    <a href="https://www.producthunt.com/products/lets-raffle?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-lets&#0045;raffle" target="_blank">
      <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1047397&theme=light&t=1765196820214" alt="Lets&#0032;Raffle - Organize&#0032;Secret&#0032;Santa&#0032;exchanges&#0046;&#0032;Fair&#0044;&#0032;fun&#0044;&#0032;festive&#0033; | Product Hunt" style="width: 150px; height: 32.4px;" class="md:!w-[250px] md:!h-[54px]" width="150" height="32.4" />
    </a>
  </div>
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


