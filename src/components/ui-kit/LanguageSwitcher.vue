<template>
  <label class="relative inline-flex items-center">
    <span class="sr-only">{{ t("languageSwitcher.label") }}</span>
    <select
        v-model="selectedLocale"
        :aria-label="t('languageSwitcher.label')"
        class="min-h-11 cursor-pointer appearance-none rounded-full border-0 bg-snow py-0 pl-4 pr-9 text-sm font-extrabold text-cranberry-900 shadow-[0_6px_16px_rgba(60,0,0,0.25)] outline-none focus-visible:ring-4 focus-visible:ring-gold-400/60">
      <option v-for="option in localeOptions" :key="option.code" :value="option.code">
        {{ option.code.toUpperCase() }} · {{ option.label }}
      </option>
    </select>
    <svg class="pointer-events-none absolute right-3.5 h-4 w-4 text-cranberry-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { localeOptions, setLocale, type Locale } from "@/i18n";

const { locale, t } = useI18n();

const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => {
    setLocale(value as Locale);
  },
});
</script>

<style scoped>
select option {
  color: #7a0f14;
}
</style>
