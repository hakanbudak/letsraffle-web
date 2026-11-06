<template>
  <div role="tablist" :aria-label="t('header.menu')" class="grid grid-cols-2 gap-1.5 rounded-[18px] bg-[#f6ebdd] p-1.5">
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
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ active: "login" | "register" }>();
defineEmits<{ (e: "select", value: "login" | "register"): void }>();

const { t } = useI18n();
</script>
