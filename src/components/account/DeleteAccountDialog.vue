<template>
  <div
      v-if="visible"
      class="xm-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(40,4,8,0.62)] px-4"
      @click="close">
    <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-body"
        class="xm-pop relative w-full max-w-[460px] rounded-[32px] bg-snow px-6 py-8 text-center text-ink shadow-[inset_0_0_0_2px_#e6b94a,inset_0_0_0_8px_#fffbf5,inset_0_0_0_9px_rgba(230,185,74,0.55),0_50px_120px_rgba(20,0,0,0.6)] sm:px-10"
        @click.stop>
      <h3 id="delete-account-title" class="m-0 font-display text-[28px] font-black leading-tight text-cranberry-800">{{ t("account.delete.title") }}</h3>
      <div class="xm-candy mx-auto mb-4 mt-3 w-[88px]"></div>
      <div id="delete-account-body" class="space-y-2 text-[15px] leading-relaxed text-ink-soft">
        <p class="m-0">{{ t("account.delete.body") }}</p>
        <p class="m-0">{{ t("account.delete.draws") }}</p>
      </div>
      <p v-if="error" class="mt-4 rounded-2xl bg-cranberry-400/10 px-4 py-2.5 text-sm font-bold text-cranberry-700" role="alert">{{ error }}</p>
      <div class="mt-6 flex flex-col gap-2.5">
        <button type="button" class="xm-btn xm-btn-red w-full" data-testid="confirm-delete" :disabled="busy" @click="confirm">
          {{ busy ? t("account.delete.deleting") : t("account.delete.confirm") }}
        </button>
        <button type="button" class="xm-btn w-full bg-transparent text-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a]" :disabled="busy" @click="close">
          {{ t("account.delete.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/services/api";

/** Confirms and permanently deletes the signed-in account (DELETE /api/v1/auth/me). */
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: "close"): void; (e: "deleted"): void }>();

const { t } = useI18n();
const busy = ref(false);
const error = ref("");

function close() {
  if (busy.value) return;
  error.value = "";
  emit("close");
}

async function confirm() {
  busy.value = true;
  error.value = "";
  try {
    await api.delete("/api/v1/auth/me");
    emit("deleted");
  } catch {
    error.value = t("account.delete.failed");
  } finally {
    busy.value = false;
  }
}
</script>
