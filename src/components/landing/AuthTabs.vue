<template>
  <div class="flex items-center gap-2">
  <!-- back to the intro card -->
  <button
      type="button"
      class="flex h-[56px] w-12 flex-none cursor-pointer items-center justify-center rounded-[18px] border-0 bg-[#f6ebdd] text-cranberry-700 transition-colors hover:bg-[#f0dfcb] hover:text-cranberry-900"
      :aria-label="t('auth.goBack')"
      :title="t('auth.goBack')"
      @click="$emit('back')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
  </button>
  <div role="tablist" :aria-label="t('header.menu')" class="grid flex-1 grid-cols-2 gap-1.5 rounded-[18px] bg-[#f6ebdd] p-1.5">
    <button
        role="tab"
        type="button"
        :aria-selected="active === 'login'"
        class="min-h-11 cursor-pointer rounded-[13px] border-0 text-[15px] font-extrabold transition-all"
        :class="active === 'login' ? 'bg-white text-cranberry-800 shadow-[0_2px_8px_rgba(110,13,18,0.12)]' : 'bg-transparent text-[#7a5f5f] hover:text-cranberry-800'"
        @click="$emit('select', 'login')">
      {{ t("auth.loginTitle") }}
    </button>
    <button
        role="tab"
        type="button"
        :aria-selected="active === 'register'"
        class="min-h-11 cursor-pointer rounded-[13px] border-0 text-[15px] font-extrabold transition-all"
        :class="active === 'register' ? 'bg-white text-cranberry-800 shadow-[0_2px_8px_rgba(110,13,18,0.12)]' : 'bg-transparent text-[#7a5f5f] hover:text-cranberry-800'"
        @click="$emit('select', 'register')">
      {{ t("auth.registerTitle") }}
    </button>
  </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ active: "login" | "register" }>();
defineEmits<{ (e: "select", value: "login" | "register"): void; (e: "back"): void }>();

const { t } = useI18n();
</script>
