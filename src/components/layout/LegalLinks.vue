<template>
  <nav class="legal-links relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12.5px] font-extrabold tracking-wide" :aria-label="t('legal.navLabel')">
    <router-link to="/privacy" class="legal-link">{{ t("legal.privacy") }}</router-link>
    <span aria-hidden="true" class="legal-sep">✦</span>
    <router-link to="/terms" class="legal-link">{{ t("legal.terms") }}</router-link>
    <template v-if="$slots.default">
      <span aria-hidden="true" class="legal-sep">✦</span>
      <slot />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
.legal-links :deep(.legal-link) {
  color: rgb(255 251 245 / 0.75);
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
  transition: color 0.2s;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
.legal-links :deep(.legal-link:hover) {
  color: #fffbf5;
  text-decoration-line: underline;
  text-decoration-color: #e6b94a;
}
.legal-sep {
  font-size: 9px;
  color: #e6b94a;
  opacity: 0.8;
}
@media (min-width: 1024px) {
  .legal-links :deep(.legal-link) { color: rgb(122 15 20 / 0.6); }
  .legal-links :deep(.legal-link:hover) { color: #9b1418; }
  .legal-sep { color: #d4a640; }
}
</style>
