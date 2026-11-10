<template>
  <header class="relative z-[2] flex min-h-[76px] flex-wrap items-center gap-3 px-4 py-3 md:px-12 md:py-0">
    <slot name="start">
      <router-link :to="homeTo" class="flex items-center py-1 text-snow no-underline" :aria-label="t('common.appName')">
        <img :src="lockup" alt="" height="80" class="mt-1 h-[60px] w-auto drop-shadow-[0_2px_3px_rgba(40,0,0,0.25)] transition-transform duration-300 hover:scale-[1.03] md:mt-4 md:h-[84px]" />
      </router-link>
    </slot>

    <div class="hidden min-w-0 flex-1 items-center gap-4 md:flex">
      <slot name="center"></slot>
    </div>

    <nav :aria-label="t('header.menu')" class="ml-auto flex flex-wrap items-center justify-end gap-2 md:gap-3">
      <slot name="actions"></slot>
      <OpenSourceButton v-if="showOpenSource" />
      <LanguageSwitcher />
      <!-- account menu always sits at the far right -->
      <slot name="account"></slot>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/components/ui-kit/LanguageSwitcher.vue";
import OpenSourceButton from "@/components/ui-kit/OpenSourceButton.vue";
import { isAuthenticated } from "@/services/authHelpers";
import lockup from "@/assets/brand/lockup.webp";

withDefaults(defineProps<{ showOpenSource?: boolean }>(), { showOpenSource: true });

const { t } = useI18n();
const homeTo = computed(() => (isAuthenticated() ? "/dashboard" : "/"));
</script>
