<template>
  <ChristmasScene :garland="false" :pines="false" glow-x="70%" glow-y="25%">
    <template #header>
      <AppHeader>
        <template #actions>
          <span v-if="userEmail" class="hidden text-sm font-bold text-snow/85 xl:inline">{{ userEmail }}</span>
          <button type="button" class="xm-btn xm-btn-sm !rounded-full bg-snow text-cranberry-800 shadow-none" @click="handleLogout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            {{ t("dashboard.logout") }}
          </button>
        </template>
      </AppHeader>
    </template>

    <main class="grid flex-1 gap-8 px-4 pb-10 pt-2 lg:min-h-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:pb-[72px]">
      <section class="xm-card xm-rise flex min-h-[420px] flex-col p-6 lg:min-h-0 lg:p-8" aria-labelledby="ev-title">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="xm-eyebrow text-cranberry-600">{{ t("participantsPanel.tagline") }}</p>
            <h2 id="ev-title" class="mt-1 mb-2.5 font-display text-[28px] font-black leading-tight text-cranberry-800 lg:text-[34px]">
              {{ t("participantsPanel.title") }}
            </h2>
            <div class="xm-candy xm-candy-move w-[88px]"></div>
          </div>
        </div>
        <div class="mt-5 flex min-h-0 flex-1 flex-col">
          <ParticipantsPanel @draw-selected="handleDrawSelected" />
        </div>
      </section>

      <section class="relative flex flex-col justify-center gap-[18px] lg:min-h-0" aria-labelledby="mode-title">
        <div class="flex items-end gap-2">
          <div class="min-w-0 flex-1">
            <p class="xm-glow font-script text-[44px] leading-none text-gold-300 lg:text-[52px]">{{ t("dashboard.script") }}</p>
            <h1 id="mode-title" class="mt-1 font-display text-[32px] font-black leading-tight text-snow lg:text-[40px]">{{ t("dashboard.title") }}</h1>
          </div>
          <SantaCharacter class="-mb-3 shrink-0" mood="wave" :size="150" interactive eager />
        </div>

        <article class="xm-rise xm-d2 relative rounded-3xl bg-snow p-6 text-ink shadow-[inset_0_0_0_2px_#e6b94a,0_20px_50px_rgba(50,0,0,0.3)] lg:p-[26px]">
          <span class="xm-seal xm-wobble absolute -top-4 right-6 h-[60px] w-[60px] bg-cranberry-800 text-xs text-gold-300 shadow-[inset_0_0_0_3px_#e6b94a]">
            {{ t("dashboard.inviteCard.tag") }}
          </span>
          <h2 class="mb-1.5 font-display text-[26px] font-black text-cranberry-800">{{ t("dashboard.inviteCard.title") }}</h2>
          <p class="mb-[18px] max-w-[420px] text-[15px] leading-normal text-ink-soft">{{ t("dashboard.inviteCard.description") }}</p>
          <button type="button" class="xm-btn xm-btn-gold xm-shine" @click="goInvite">
            {{ t("dashboard.inviteCard.cta") }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
        </article>

        <article class="xm-rise xm-d4 rounded-3xl bg-snow/10 p-6 shadow-[inset_0_0_0_2px_rgba(246,217,138,0.5)] lg:p-[26px]">
          <h2 class="mb-1.5 font-display text-[26px] font-black text-snow">{{ t("dashboard.manualCard.title") }}</h2>
          <p class="mb-[18px] max-w-[420px] text-[15px] leading-normal text-snow/90">{{ t("dashboard.manualCard.description") }}</p>
          <button type="button" class="xm-btn xm-btn-red !shadow-[inset_0_0_0_2px_#f6d98a,0_5px_0_#4a080c]" @click="goManual">
            {{ t("dashboard.manualCard.cta") }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
        </article>
      </section>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";
import ParticipantsPanel from "@/components/panel/ParticipantsPanel.vue";
import type { DrawDetail } from "@/components/draw/types";
import { logoutUser, USER_KEY } from "@/services/authHelpers";

const router = useRouter();
const { t } = useI18n();

const userEmail = (() => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw)?.email as string | undefined) ?? "" : "";
  } catch {
    return "";
  }
})();

const goManual = () => router.push("/draw/manual").catch(() => undefined);
const goInvite = () => router.push("/draw/dynamic").catch(() => undefined);
const handleLogout = () => logoutUser(true);

const handleDrawSelected = (drawDetail: DrawDetail) => {
  if (drawDetail.inviteCode) {
    router.push(`/draws/${drawDetail.inviteCode}`).catch(() => undefined);
  }
};
</script>
