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

      <section class="relative flex flex-col justify-center gap-[18px] compact:gap-3.5 lg:min-h-0" aria-labelledby="mode-title">
        <div class="flex items-end gap-2">
          <div class="min-w-0 flex-1">
            <p class="xm-glow font-script text-[44px] leading-none text-gold-300 lg:text-[52px] compact:text-[40px]">{{ t("dashboard.script") }}</p>
            <h1 id="mode-title" class="mt-1 font-display text-[32px] font-black leading-tight text-snow lg:text-[40px] compact:text-[32px]">{{ t("dashboard.title") }}</h1>
          </div>
          <div class="-mb-3 shrink-0 origin-bottom-right compact:-ml-8 compact:-mt-8 compact:scale-[0.78]">
            <SantaCharacter mood="watch" :size="150" interactive eager />
          </div>
        </div>

        <!-- Each mode is one big raffle-ticket button: the whole ticket is clickable. -->
        <div class="xm-rise xm-d2">
        <button type="button" class="ticket-btn" @click="goInvite">
          <span class="ticket ticket-shine bg-[linear-gradient(135deg,#fffbf5_0%,#fff3dc_100%)] text-cranberry-900">
            <span class="flex min-w-0 flex-1 flex-col gap-2 p-5 pr-4 text-left lg:px-6">
              <span class="flex flex-wrap items-center gap-2.5">
                <span class="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a]">
                  <IconLink :size="22" stroke-class="stroke-gold-300" />
                </span>
                <span class="font-display text-[24px] font-black leading-none text-cranberry-800 lg:text-[26px]">{{ t("dashboard.inviteCard.title") }}</span>
                <span class="rounded-full bg-cranberry-800 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-gold-300">✦ {{ t("dashboard.inviteCard.tag") }}</span>
              </span>
              <span class="text-[15px] font-semibold leading-snug text-ink-soft">{{ t("dashboard.inviteCard.description") }}</span>
              <span class="text-[12.5px] font-extrabold text-pine-700">{{ inviteFeatures.map((k) => t(`dashboard.inviteCard.features.${k}`)).join(" · ") }}</span>
            </span>
            <span class="ticket-stub bg-[linear-gradient(180deg,#f8e09a,#e6b94a)] text-cranberry-900">
              <span class="ticket-go bg-cranberry-800 text-snow shadow-[inset_0_0_0_2px_#fff3dc]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></span>
              <span class="px-2 text-center font-display text-[15px] font-black leading-tight">{{ t("dashboard.inviteCard.cta") }}</span>
            </span>
          </span>
        </button>
        </div>

        <div class="xm-rise xm-d4">
        <button type="button" class="ticket-btn" @click="goManual">
          <span class="ticket bg-[linear-gradient(135deg,#2b6b4a_0%,#1f5c3e_100%)] text-snow">
            <span class="flex min-w-0 flex-1 flex-col gap-2 p-5 pr-4 text-left lg:px-6">
              <span class="flex flex-wrap items-center gap-2.5">
                <span class="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-snow/15 shadow-[inset_0_0_0_2px_rgba(246,217,138,0.7)]">
                  <IconUser :size="22" stroke-class="stroke-snow" />
                </span>
                <span class="font-display text-[24px] font-black leading-none lg:text-[26px]">{{ t("dashboard.manualCard.title") }}</span>
              </span>
              <span class="text-[15px] font-semibold leading-snug text-snow/90">{{ t("dashboard.manualCard.description") }}</span>
              <span class="text-[12.5px] font-extrabold text-gold-300">{{ manualFeatures.map((k) => t(`dashboard.manualCard.features.${k}`)).join(" · ") }}</span>
            </span>
            <span class="ticket-stub bg-[#164a31] text-gold-300">
              <span class="ticket-go bg-[linear-gradient(180deg,#f8e09a,#e6b94a)] text-[#164a31]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></span>
              <span class="px-2 text-center font-display text-[15px] font-black leading-tight">{{ t("dashboard.manualCard.cta") }}</span>
            </span>
          </span>
        </button>
        </div>
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
import IconLink from "@/components/icons/IconLink.vue";
import IconUser from "@/components/icons/IconUser.vue";
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

const inviteFeatures = ["link", "schedule", "oneClick"] as const;
const manualFeatures = ["addYourself", "rules", "instant"] as const;

const goManual = () => router.push("/draw/manual").catch(() => undefined);
const goInvite = () => router.push("/draw/dynamic").catch(() => undefined);
const handleLogout = () => logoutUser(true);

const handleDrawSelected = (drawDetail: DrawDetail) => {
  if (drawDetail.inviteCode) {
    router.push(`/draws/${drawDetail.inviteCode}`).catch(() => undefined);
  }
};
</script>

<style scoped>
/* Raffle-ticket buttons: notched edges at the perforation, a tear-off stub with the CTA. */
.ticket-btn {
  --stub: 108px;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: inherit;
  filter: drop-shadow(0 8px 12px rgba(40, 0, 0, 0.28));
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.25s;
}
@media (min-width: 640px) {
  .ticket-btn { --stub: 132px; }
}
.ticket-btn:hover {
  transform: translateY(-4px) rotate(-0.4deg);
  filter: drop-shadow(0 14px 18px rgba(40, 0, 0, 0.34));
}
.ticket-btn:active { transform: translateY(1px); }
.ticket-btn:focus-visible { outline: 3px solid #f6d98a; outline-offset: 5px; border-radius: 22px; }

.ticket {
  display: flex;
  border-radius: 22px;
  -webkit-mask:
    radial-gradient(circle 15px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
    radial-gradient(circle 15px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
  mask:
    radial-gradient(circle 15px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
    radial-gradient(circle 15px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
}
.ticket-stub {
  position: relative;
  display: flex;
  width: var(--stub);
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.ticket-stub::before {
  content: "";
  position: absolute;
  left: 0;
  top: 22px;
  bottom: 22px;
  border-left: 2.5px dashed currentColor;
  opacity: 0.45;
}
.ticket-go {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ticket-btn:hover .ticket-go { transform: translateX(4px) scale(1.06); }

.ticket-shine { position: relative; overflow: hidden; }
.ticket-shine::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 30%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: translateX(-160%) skewX(-20deg);
  pointer-events: none;
}
.ticket-btn:hover .ticket-shine::after {
  transform: translateX(420%) skewX(-20deg);
  transition: transform 0.9s ease;
}

@media (prefers-reduced-motion: reduce) {
  .ticket-btn, .ticket-go, .ticket-shine::after { transition: none !important; }
  .ticket-btn:hover { transform: none; }
}
</style>
