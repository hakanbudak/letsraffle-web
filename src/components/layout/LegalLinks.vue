<template>
  <nav class="relative z-10 flex items-center justify-center gap-4 text-[13px] font-bold text-snow/80 lg:text-cranberry-800/80" :aria-label="t('legal.navLabel')">
    <router-link to="/privacy" class="hover:underline">{{ t("legal.privacy") }}</router-link>
    <span aria-hidden="true">·</span>
    <router-link to="/terms" class="hover:underline">{{ t("legal.terms") }}</router-link>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
