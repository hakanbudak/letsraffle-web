<template>
  <div ref="rootRef" class="relative" @keydown.esc="close">
    <button
        type="button"
        class="xm-hpill xm-hpill-snow"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-label="t('header.account')"
        @click="open = !open">
      <span class="xm-hpill-icon text-[13px] font-black" aria-hidden="true">{{ initial }}</span>
      <span class="hidden sm:inline">{{ t("header.account") }}</span>
      <svg class="hidden h-4 w-4 flex-none transition-transform duration-200 sm:block" :class="open ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="-translate-y-2 opacity-0">
      <div
          v-if="open"
          role="menu"
          class="absolute right-0 top-full z-50 mt-3 w-[260px] overflow-hidden rounded-2xl border-2 border-[#e6b94a] bg-snow text-ink shadow-[0_18px_40px_rgba(50,0,0,0.35)]">
        <div class="flex items-center gap-3 border-b-2 border-[#f0dfcb] bg-[#fff7ec] px-4 py-3.5">
          <span class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-cranberry-800 font-display text-lg font-black text-gold-300 shadow-[inset_0_0_0_2px_#e6b94a]" aria-hidden="true">{{ initial }}</span>
          <span class="min-w-0">
            <span class="block text-xs font-extrabold uppercase tracking-wider text-cranberry-600">{{ t("header.signedInAs") }}</span>
            <span class="block truncate text-sm font-bold text-ink" :title="email">{{ email }}</span>
          </span>
        </div>
        <div class="p-2">
          <button
              type="button"
              role="menuitem"
              class="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm font-extrabold text-cranberry-800 hover:bg-[#fdecec] focus-visible:bg-[#fdecec] focus-visible:outline-none"
              @click="logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            {{ t("dashboard.logout") }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { logoutUser, USER_KEY } from "@/services/authHelpers";

/** Account button for the header: opens a small menu with the signed-in e-mail and "Log out". */
const { t } = useI18n();
const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const email = (() => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? ((JSON.parse(raw)?.email as string | undefined) ?? "") : "";
  } catch {
    return "";
  }
})();
const initial = computed(() => (email ? email.charAt(0).toUpperCase() : "★"));

const close = () => { open.value = false; };
const logout = () => { open.value = false; logoutUser(true); };
const onDocClick = (e: MouseEvent) => {
  if (open.value && rootRef.value && !rootRef.value.contains(e.target as Node)) close();
};

onMounted(() => document.addEventListener("click", onDocClick));
onUnmounted(() => document.removeEventListener("click", onDocClick));
</script>
