<template>
  <header class="relative z-[2] flex min-h-[76px] flex-wrap items-center gap-3 px-4 py-3 md:px-12 md:py-0">
    <slot name="start">
      <router-link :to="homeTo" class="flex items-center gap-3 text-snow no-underline" :aria-label="t('common.appName')">
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-200 to-gold-400 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.6)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7a0f14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
          </svg>
        </span>
        <span class="font-display text-[22px] font-black tracking-tight md:text-2xl">Lets Raffle</span>
      </router-link>
    </slot>

    <div class="hidden min-w-0 flex-1 items-center gap-4 md:flex">
      <slot name="center"></slot>
    </div>

    <nav :aria-label="t('header.menu')" class="ml-auto flex flex-wrap items-center justify-end gap-2 md:gap-3">
      <slot name="actions"></slot>
      <OpenSourceButton v-if="showOpenSource" />
      <LanguageSwitcher />
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/components/ui-kit/LanguageSwitcher.vue";
import OpenSourceButton from "@/components/ui-kit/OpenSourceButton.vue";
import { isAuthenticated } from "@/services/authHelpers";

withDefaults(defineProps<{ showOpenSource?: boolean }>(), { showOpenSource: true });

const { t } = useI18n();
const homeTo = computed(() => (isAuthenticated() ? "/dashboard" : "/"));
</script>
