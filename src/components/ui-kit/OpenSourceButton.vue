<template>
  <div class="group relative">
    <button
        type="button"
        class="xm-hpill xm-hpill-berry w-10 justify-center !px-0 sm:w-11"
        aria-haspopup="true"
        :aria-label="t('header.openSource')"
        :title="t('header.openSource')">
      <IconGithub :width="20" :height="20" stroke-class="stroke-current" class="text-gold-300" />
    </button>

    <div
        class="invisible absolute right-0 top-full z-50 mt-2 flex min-w-[170px] translate-y-2 flex-col gap-1 rounded-2xl bg-snow p-2 text-ink opacity-0 shadow-[0_16px_40px_rgba(50,0,0,0.35)] transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <a
          href="https://github.com/hakanbudak/letsraffle-web"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-ink no-underline hover:bg-snow-200">
        Frontend
        <IconGithub :width="16" :height="16" stroke-class="stroke-current" />
      </a>
      <a
          href="https://github.com/selamet/letsraffle-api"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-ink no-underline hover:bg-snow-200">
        Backend
        <IconGithub :width="16" :height="16" stroke-class="stroke-current" />
      </a>
      <a
          href="https://github.com/selamet/letsraffle-ios"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-ink no-underline hover:bg-snow-200">
        iOS
        <IconGithub :width="16" :height="16" stroke-class="stroke-current" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import IconGithub from "@/components/icons/IconGithub.vue";

const { t } = useI18n();
</script>
