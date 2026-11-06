<template>
    <div
        v-if="visible"
        class="xm-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(40,4,8,0.62)] px-4 pt-28"
        @click="$emit('close')">
      <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          class="xm-pop relative w-full max-w-[500px] rounded-[32px] bg-snow px-6 pb-8 pt-[165px] text-center text-ink shadow-[inset_0_0_0_2px_#e6b94a,inset_0_0_0_8px_#fffbf5,inset_0_0_0_9px_rgba(230,185,74,0.55),0_50px_120px_rgba(20,0,0,0.6)] sm:px-11"
          @click.stop>
        <div class="absolute -top-[120px] left-1/2 h-[275px] w-[220px] -translate-x-1/2">
          <SantaCharacter mood="celebrate" fluid eager />
        </div>
        <h3 id="success-title" class="m-0 font-display text-[30px] font-black leading-tight text-cranberry-800">{{ titleText }}</h3>
        <div class="xm-candy xm-candy-move mx-auto mb-4 mt-3 w-[88px]"></div>
        <p class="m-0 text-base leading-relaxed text-ink-soft">{{ messageText }}</p>
        <p v-if="additionalMessage" class="mt-2 text-sm leading-normal text-ink-muted whitespace-pre-line">{{ additionalMessage }}</p>
        <button type="button" class="xm-btn xm-btn-red xm-shine mt-6 w-full" @click="$emit('close')">{{ buttonLabel }}</button>
        <p class="mt-4 text-sm font-extrabold text-pine-700">{{ footerTextValue }}</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";

const props = defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  additionalMessage?: string;
  footerText?: string;
  buttonText?: string;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const { t } = useI18n();

const titleText = computed(() => props.title ?? t("modals.successTitle"));
const messageText = computed(() => props.message ?? t("modals.successMessage"));
const footerTextValue = computed(() => props.footerText ?? t("modals.successFooter"));
const buttonLabel = computed(() => props.buttonText ?? t("modals.close"));
</script>

<style scoped>
</style>

