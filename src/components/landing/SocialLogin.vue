<template>
  <div class="mt-5">
    <div class="mb-4 flex items-center gap-3 text-[13px] font-extrabold text-ink-muted" aria-hidden="true">
      <span class="h-1.5 flex-1 rounded-full bg-[repeating-linear-gradient(-45deg,#e8cfc0_0_6px,transparent_6px_12px)]"></span>
      {{ t("auth.social.or") }}
      <span class="h-1.5 flex-1 rounded-full bg-[repeating-linear-gradient(-45deg,#e8cfc0_0_6px,transparent_6px_12px)]"></span>
    </div>
    <div class="flex flex-col gap-2.5 sm:flex-row">
      <button type="button" class="social-btn bg-black text-white hover:brightness-125" @click="go('apple')">
        <img :src="appleLogo" alt="" class="h-[19px] w-[16px] object-contain -mt-0.5" />
        {{ t("auth.social.apple") }}
      </button>
      <button type="button" class="social-btn bg-white text-[#1f1f1f] shadow-[inset_0_0_0_1.5px_#747775] hover:bg-[#f7f3ee]" @click="go('google')">
        <img :src="googleLogo" alt="" class="h-[18px] w-[18px] object-contain" />
        {{ t("auth.social.google") }}
      </button>
    </div>
    <p v-if="notice" class="mt-2.5 text-center text-[13px] font-bold text-ink-muted" role="status">{{ notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import appleLogo from "@/assets/brand/apple-logo-white.png";
import googleLogo from "@/assets/brand/google-g.png";

/**
 * Apple / Google ile giriş.
 * Backend'in OAuth başlangıç adresleri .env ile verilir:
 *   VITE_APPLE_AUTH_URL=https://api.example.com/api/v1/auth/apple
 *   VITE_GOOGLE_AUTH_URL=https://api.example.com/api/v1/auth/google
 * Adres tanımlı değilse buton "yakında" bilgisini gösterir.
 */
const { t } = useI18n();
const notice = ref("");

const URLS: Record<"apple" | "google", string | undefined> = {
  apple: import.meta.env.VITE_APPLE_AUTH_URL,
  google: import.meta.env.VITE_GOOGLE_AUTH_URL,
};

function go(provider: "apple" | "google") {
  const url = URLS[provider];
  if (!url) {
    notice.value = t("auth.social.soon");
    return;
  }
  const redirect = encodeURIComponent(`${window.location.origin}/dashboard`);
  window.location.href = `${url}${url.includes("?") ? "&" : "?"}redirect_uri=${redirect}`;
}
</script>

<style scoped>
.social-btn {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  font: 800 15px var(--font-body, Nunito), sans-serif;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}
.social-btn:active {
  transform: translateY(2px);
}
.social-btn:focus-visible {
  outline: 3px solid #e6b94a;
  outline-offset: 2px;
}
</style>
