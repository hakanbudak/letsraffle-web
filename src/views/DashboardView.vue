<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
    <div class="absolute -left-10 top-20 w-64 h-64 rounded-full bg-yellow-200/20 blur-3xl"></div>
    <div class="absolute -right-24 top-10 w-72 h-72 rounded-full bg-red-300/25 blur-3xl"></div>
    <div class="absolute right-8 bottom-10 w-48 h-48 rounded-full bg-green-300/20 blur-2xl"></div>


    <div class="hidden md:block absolute top-15 left-1/2 -translate-x-1/2 z-20 text-center w-full px-8">
      <h1
          class="text-7xl font-bold text-amber-50 mb-2 drop-shadow-2xl tracking-wider"
          style="text-shadow: 4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)">
        {{ t("common.tagline") }}
      </h1>
      <h1
          class="text-8xl font-bold text-yellow-400 drop-shadow-2xl tracking-wider"
          style="text-shadow: 4px 4px 8px rgba(0,0,0,0.4), 0 0 25px rgba(234,179,8,0.3)">
        {{ t("common.title") }}
      </h1>
    </div>

    <button
        type="button"
        @click="handleLogout"
        class="absolute top-4 md:top-16 left-4 md:left-auto right-auto md:right-4 z-30
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
              <div class="absolute -top-3 -right-3 z-20">
                <div class="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg rotate-6 flex items-center justify-center">
                  <span class="drop-shadow-md"> {{ t("dashboard.inviteCard.tag") }}</span>

                  <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <article class="relative bg-gradient-to-br from-amber-500 via-red-600 to-red-700 rounded-2xl border-2 border-amber-300 p-5 flex flex-col md:flex-row items-center gap-4 shadow-2xl overflow-hidden">
                <div class="absolute inset-0 opacity-20">
                  <div class="star star-1"></div>
                  <div class="star star-2"></div>
                  <div class="star star-3"></div>
                  <div class="star star-4"></div>
                  <div class="star star-5"></div>
                  <div class="star star-6"></div>
                  <div class="star star-7"></div>
                  <div class="star star-8"></div>
                </div>

                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent shimmer"></div>

                <div class="flex-1 text-center md:text-left relative z-10">
                  <h2 class="text-2xl font-bold text-white mb-2 drop-shadow-md">
                    {{ t("dashboard.inviteCard.title") }}
                  </h2>
                  <p class="text-sm md:text-base text-white/90 mb-2">
                    {{ t("dashboard.inviteCard.description") }}
                  </p>
                  <div class="flex items-center justify-center md:justify-start text-amber-300 text-sm mt-2">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>{{ t("dashboard.inviteCard.description2") }}</span>
                  </div>
                </div>
                <button
                    type="button"
                    class="relative z-10 w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    @click="goInvite">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  {{ t("dashboard.inviteCard.cta") }}
                </button>
              </article>

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
import ParticipantsPanel from "@/components/panel/ParticipantsPanel.vue";
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
.star {
  position: absolute;
  background-color: #FBBF24; /* amber-400 */
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.star-1 { width: 20px; height: 20px; top: 10%; left: 5%; animation: twinkle 3s infinite; }
.star-2 { width: 15px; height: 15px; top: 25%; right: 10%; animation: twinkle 4s infinite 0.5s; }
.star-3 { width: 25px; height: 25px; bottom: 15%; left: 15%; animation: twinkle 5s infinite 1s; }
.star-4 { width: 12px; height: 12px; bottom: 30%; right: 20%; animation: twinkle 3.5s infinite 1.5s; }
.star-5 { width: 18px; height: 18px; top: 40%; left: 25%; animation: twinkle 4.5s infinite 0.7s; }
.star-6 { width: 22px; height: 22px; top: 60%; right: 30%; animation: twinkle 3.2s infinite 1.2s; }
.star-7 { width: 14px; height: 14px; bottom: 10%; right: 10%; animation: twinkle 4.8s infinite 0.3s; }
.star-8 { width: 16px; height: 16px; top: 15%; right: 25%; animation: twinkle 3.7s infinite 0.9s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.shimmer {
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>

