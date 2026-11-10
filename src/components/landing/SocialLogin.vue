<template>
  <div class="mt-5">
    <div class="mb-4 flex items-center gap-3 text-[13px] font-extrabold text-ink-muted" aria-hidden="true">
      <span class="h-1.5 flex-1 rounded-full bg-[repeating-linear-gradient(-45deg,#e8cfc0_0_6px,transparent_6px_12px)]"></span>
      {{ t("auth.social.or") }}
      <span class="h-1.5 flex-1 rounded-full bg-[repeating-linear-gradient(-45deg,#e8cfc0_0_6px,transparent_6px_12px)]"></span>
    </div>
    <div class="mx-auto flex w-full max-w-[400px] flex-col items-stretch gap-2.5">
      <!-- Apple's official left-aligned logo (Apple Design Resources): never redraw or
           recolor it, and keep the background pure black so it matches the artwork. -->
      <button
        type="button"
        class="apple-btn"
        :disabled="appleBusy"
        data-testid="apple-signin"
        @click="onApple"
      >
        <img :src="appleLogo" alt="" aria-hidden="true" class="h-11 w-auto" />
        <span class="pr-4">{{ t("auth.social.apple") }}</span>
      </button>

      <!-- Google first paints an English placeholder and only then swaps in its localized iframe:
           keep the slot invisible until that iframe has loaded so the label never flips language -->
      <div
          v-if="googleEnabled"
          ref="googleEl"
          class="flex min-h-[44px] w-full justify-center transition-opacity duration-200"
          :class="googleReady ? 'opacity-100' : 'pointer-events-none opacity-0'"
          data-testid="google-signin"></div>
      <button
        v-else
        type="button"
        class="google-fallback-btn"
        data-testid="google-soon"
        @click="notice = t('auth.social.soon')"
      >
        <img :src="googleLogo" alt="" class="h-[18px] w-[18px] object-contain" />
        {{ t("auth.social.google") }}
      </button>
    </div>
    <p v-if="notice" class="mt-2.5 text-center text-[13px] font-bold text-ink-muted" role="status">{{ notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import appleLogo from "@/assets/brand/apple-logo-official.svg";
import googleLogo from "@/assets/brand/google-g.png";
import { handleAuthSuccess } from "@/services/authHelpers";
import {
  APPLE_SERVICES_ID,
  GOOGLE_CLIENT_ID,
  isAppleCancel,
  renderGoogleButton,
  signInWithApple,
} from "@/services/socialAuth";
import type { AuthResponse } from "@/types";

/**
 * Sign in with Apple / Google. Enabled by VITE_APPLE_SERVICES_ID and
 * VITE_GOOGLE_CLIENT_ID; a provider without config shows a "coming soon" notice.
 * Emits `success` once the session is stored, like the email login does.
 */
const emit = defineEmits<{ (e: "success"): void }>();

const { t, locale } = useI18n();
const notice = ref("");
const appleBusy = ref(false);
const googleEl = ref<HTMLElement | null>(null);
const googleEnabled = Boolean(GOOGLE_CLIENT_ID);
const googleReady = ref(false);
let readyTimer: ReturnType<typeof setTimeout> | undefined;
let iframeWatch: MutationObserver | null = null;

/** reveal the Google button once its (localized) iframe has finished loading */
function revealWhenLoaded(el: HTMLElement) {
  iframeWatch?.disconnect();
  clearTimeout(readyTimer);
  const done = () => { googleReady.value = true; iframeWatch?.disconnect(); clearTimeout(readyTimer); };
  const hook = () => {
    const frame = el.querySelector("iframe");
    if (!frame) return false;
    frame.addEventListener("load", () => setTimeout(done, 60), { once: true });
    return true;
  };
  if (!hook() && typeof MutationObserver !== "undefined") {
    iframeWatch = new MutationObserver(() => { if (hook()) iframeWatch?.disconnect(); });
    iframeWatch.observe(el, { childList: true, subtree: true });
  }
  readyTimer = setTimeout(done, 3000);
}

function mountGoogle() {
  const el = googleEl.value;
  if (!googleEnabled || !el) return;
  googleReady.value = false;
  el.innerHTML = "";
  revealWhenLoaded(el);
  renderGoogleButton(el, locale.value, finish, fail).catch((e) => { googleReady.value = true; fail(e); });
}

function finish(data: AuthResponse) {
  handleAuthSuccess(data);
  emit("success");
}

function fail(error: unknown) {
  const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
  notice.value = typeof detail === "string" ? detail : t("auth.social.failed");
}

async function onApple() {
  notice.value = "";
  if (!APPLE_SERVICES_ID) {
    notice.value = t("auth.social.soon");
    return;
  }
  appleBusy.value = true;
  try {
    finish(await signInWithApple(locale.value));
  } catch (error) {
    if (!isAppleCancel(error)) fail(error);
  } finally {
    appleBusy.value = false;
  }
}

onMounted(mountGoogle);
// re-render in the new language when the visitor switches TR / EN
watch(locale, () => mountGoogle());
onUnmounted(() => { iframeWatch?.disconnect(); clearTimeout(readyTimer); });
</script>

<style scoped>
.apple-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 9999px;
  background: #000;
  color: #fff;
  font: 600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: pointer;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.apple-btn:hover {
  opacity: 0.85;
}
.apple-btn:disabled {
  opacity: 0.55;
  cursor: progress;
}
.google-fallback-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 44px;
  width: 100%;
  border: 0;
  border-radius: 9999px;
  background: #fff;
  color: #1f1f1f;
  box-shadow: inset 0 0 0 1.5px #747775;
  font: 600 15px var(--font-body, Nunito), sans-serif;
  cursor: pointer;
}
.apple-btn:active,
.google-fallback-btn:active {
  transform: translateY(2px);
}
.apple-btn:focus-visible,
.google-fallback-btn:focus-visible {
  outline: 3px solid #e6b94a;
  outline-offset: 2px;
}
</style>
