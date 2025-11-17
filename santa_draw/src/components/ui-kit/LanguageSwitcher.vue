<template>
  <div class="fixed top-4 right-4 z-50">
    <label
        class="relative inline-flex items-center gap-2 rounded-2xl border border-red-200/70
               bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm backdrop-blur">
      <span class="sr-only">{{ t("languageSwitcher.label") }}</span>
      <select
          v-model="selectedLocale"
          :aria-label="t('languageSwitcher.label')"
          class="appearance-none bg-transparent pr-5 text-xs font-semibold uppercase tracking-wide
                 focus:outline-none cursor-pointer"
      >
        <option
            v-for="option in localeOptions"
            :key="option.code"
            :value="option.code"
        >
          {{ option.code.toUpperCase() }} · {{ option.label }}
        </option>
      </select>
      <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-500">
        ▼
      </span>
    </label>
  </div>
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
  color: #991b1b;
}
</style>

