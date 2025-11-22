<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
    <div class="absolute -left-10 top-20 w-64 h-64 rounded-full bg-yellow-200/20 blur-3xl"></div>
    <div class="absolute -right-24 top-10 w-72 h-72 rounded-full bg-red-300/25 blur-3xl"></div>
    <div class="absolute right-8 bottom-10 w-48 h-48 rounded-full bg-green-300/20 blur-2xl"></div>


    <div class="absolute top-15 left-1/2 -translate-x-1/2 z-20 text-center w-full px-8">
      <h1 class="text-7xl font-bold text-amber-50 mb-2 drop-shadow-2xl tracking-wider"
          style="text-shadow: 4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)">
        {{ t("common.tagline") }}
      </h1>
      <h1 class="text-8xl font-bold text-yellow-400 drop-shadow-2xl tracking-wider"
          style="text-shadow: 4px 4px 8px rgba(0,0,0,0.4), 0 0 25px rgba(234,179,8,0.3)">
        {{ t("common.title") }}
      </h1>
    </div>

    <button
        type="button"
        @click="handleLogout"
        class="absolute top-4 md:top-16 right-3 md:right-4 z-30
           px-3 py-1.5 md:px-4 md:py-2
           bg-white/90 hover:bg-white text-red-600
           font-semibold rounded-xl shadow-lg hover:shadow-xl
           transition-all duration-200 flex items-center gap-2 group">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {{ t("dashboard.logout") }}
    </button>

    <!-- Left Christmas Tree -->
    <ChristmasTree
        variant="large"
        customClass="absolute left-0 bottom-0 translate-y-8 opacity-50 z-0" />

    <!-- Right Christmas Tree -->
    <ChristmasTree
        variant="large"
        customClass="absolute right-0 bottom-0 translate-y-8 opacity-50 z-0" />

    <div class="relative z-10 w-full max-w-6xl px-4 md:px-8 py-10 pt-24">
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
        <!-- Left: Active draws -->
        <section class="flex-1 w-full">
          <div class="bg-white/95 rounded-3xl border border-red-100 shadow-[0_20px_45px_rgba(127,29,29,0.35)] h-full min-h-[32.5rem] p-4 md:p-6 flex flex-col gap-4">
            <header class="text-center">
              <p class="text-xs md:text-sm uppercase tracking-[0.3em] text-red-500">
                {{ t("dashboard.tagline") }}
              </p>
              <h2 class="mt-2 text-2xl md:text-3xl font-bold text-red-700">
                {{ t("participantsPanel.title") }}
              </h2>
              <p class="text-sm text-slate-600">
                {{ t("dashboard.subtitle") }}
              </p>
            </header>
            <div class="flex-1 overflow-hidden">
              <ParticipantsPanel @draw-selected="handleDrawSelected" />
            </div>
          </div>
        </section>

        <!-- Right: Mode selection with holiday theme -->
        <section class="flex-1 w-full">
          <div class="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-amber-500 rounded-3xl border border-red-200 shadow-2xl shadow-red-900/40 p-5 md:p-8 h-full min-h-[32.5rem] flex flex-col gap-5">
            <div class="absolute inset-0 opacity-40 pointer-events-none">
              <DecorativeLight class="absolute top-6 left-8 bg-yellow-200 shadow-yellow-200/50" :size="10" variant="twinkle" />
              <DecorativeLight class="absolute top-14 right-10 bg-green-200 shadow-green-200/50" :size="8" variant="delayed" />
              <DecorativeLight class="absolute bottom-12 left-12 bg-pink-200 shadow-pink-200/50" :size="9" variant="twinkle" />
              <ChristmasTree variant="small" customClass="absolute -bottom-4 -left-6 opacity-60" />
              <ChristmasTree variant="small" customClass="absolute -top-10 right-0 opacity-40 scale-75" />
            </div>

            <div class="relative text-center text-white space-y-2">
              <p class="text-xs md:text-sm uppercase tracking-[0.35em] text-white/80">
                {{ t("dashboard.tagline") }}
              </p>
              <h1 class="text-3xl md:text-4xl font-black drop-shadow-lg">
                {{ t("dashboard.title") }}
              </h1>
              <p class="text-sm md:text-base text-white/90">
                {{ t("dashboard.subtitle") }}
              </p>
            </div>

            <div class="relative flex flex-col gap-4">
              <article class="bg-white/90 rounded-2xl border border-red-100 p-5 flex flex-col md:flex-row items-center gap-4 shadow-lg">
                <div class="flex-1 text-center md:text-left">
                  <h2 class="text-2xl font-bold text-red-700 mb-2">
                    {{ t("dashboard.manualCard.title") }}
                  </h2>
                  <p class="text-sm md:text-base text-slate-600">
                    {{ t("dashboard.manualCard.description") }}
                  </p>
                </div>
                <button
                    type="button"
                    class="w-full md:w-auto px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition-all"
                    @click="goManual">
                  {{ t("dashboard.manualCard.cta") }}
                </button>
              </article>

              <article class="bg-white/90 rounded-2xl border border-green-100 p-5 flex flex-col md:flex-row items-center gap-4 shadow-lg">
                <div class="flex-1 text-center md:text-left">
                  <h2 class="text-2xl font-bold text-green-700 mb-2">
                    {{ t("dashboard.inviteCard.title") }}
                  </h2>
                  <p class="text-sm md:text-base text-slate-600">
                    {{ t("dashboard.inviteCard.description") }}
                  </p>
                </div>
                <button
                    type="button"
                    class="w-full md:w-auto px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-all"
                    @click="goInvite">
                  {{ t("dashboard.inviteCard.cta") }}
                </button>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ParticipantsPanel from "@/components/draw/ParticipantsPanel.vue";
import type { DrawDetail } from "@/components/draw/types";
import ChristmasTree from "@/components/christmas/ChristmasTree.vue";
import DecorativeLight from "@/components/christmas/DecorativeLight.vue";
import {logoutUser} from "@/services/authHelpers";

const router = useRouter();
const { t } = useI18n();

const goManual = () => {
  router.push("/draw/manual").catch(() => undefined);
};

const goInvite = () => {
  router.push("/draw/dynamic").catch(() => undefined);
};

const handleLogout = () => {
  logoutUser(true);
};

const handleDrawSelected = (drawDetail: DrawDetail) => {
  if (drawDetail.inviteCode) {
    router.push(`/draws/${drawDetail.inviteCode}`).catch(() => undefined);
  }
};
</script>

<style scoped>
</style>

