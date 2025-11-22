<template>
  <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="$emit('close')"
  >
    <div
        class="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
        @click.stop
    >
      <div class="text-center space-y-4">
        <div class="text-6xl">🎉</div>
        <h3 class="text-2xl font-bold text-red-700">{{ titleText }}</h3>
        <p class="text-slate-600">
          {{ messageText }}
        </p>
        <p v-if="additionalMessage" class="text-sm text-slate-500">
          {{ additionalMessage }}
        </p>
        <p class="text-sm font-medium text-red-600">
          {{ footerTextValue }}
        </p>
        <button
            type="button"
            @click="$emit('close')"
            class="mt-4 w-full px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
        >
          {{ buttonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  additionalMessage?: string;
  footerText?: string;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const { t } = useI18n();

const titleText = computed(() => props.title ?? t("modals.successTitle"));
const messageText = computed(() => props.message ?? t("modals.successMessage"));
const footerTextValue = computed(() => props.footerText ?? t("modals.successFooter"));
const buttonLabel = computed(() => t("modals.close"));
</script>

<style scoped>
</style>

