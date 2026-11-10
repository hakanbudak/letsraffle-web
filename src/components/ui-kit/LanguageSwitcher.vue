<template>
  <!-- TR / EN as a radio group (real radio inputs, so arrow keys and screen readers work) -->
  <div role="radiogroup" :aria-label="t('languageSwitcher.label')" class="xm-hpill xm-hpill-snow cursor-default gap-1 !py-1 !pl-2 !pr-1 hover:!translate-y-0 active:!translate-y-0">
    <svg class="pointer-events-none mr-0.5 h-[22px] w-[22px] flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12c-3-5-8-5-10-3 2 0 3 1 3 2-1 0-2 1-2 2 3 1 6 1 9-1Z" fill="#2f8a4f" stroke="#1f5c3e" stroke-width="1" />
      <path d="M12 12c3-5 8-5 10-3-2 0-3 1-3 2 1 0 2 1 2 2-3 1-6 1-9-1Z" fill="#2f8a4f" stroke="#1f5c3e" stroke-width="1" />
      <circle cx="10.5" cy="13.5" r="2.2" fill="#d62a30" /><circle cx="13.5" cy="13.5" r="2.2" fill="#d62a30" /><circle cx="12" cy="11" r="2.2" fill="#e5453c" />
    </svg>
    <label
        v-for="option in localeOptions"
        :key="option.code"
        class="relative flex h-9 min-w-[44px] cursor-pointer items-center justify-center rounded-full px-3 text-sm font-black transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-400"
        :class="selectedLocale === option.code ? 'bg-cranberry-800 text-gold-300 shadow-[inset_0_0_0_1.5px_#e6b94a]' : 'text-cranberry-900 hover:bg-[#fff0d6]'"
        :title="option.label">
      <input v-model="selectedLocale" type="radio" name="app-locale" :value="option.code" class="sr-only" :aria-label="option.label" />
      {{ option.code.toUpperCase() }}
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
  color: #7a0f14;
}
</style>
