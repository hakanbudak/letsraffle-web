<template>
  <div
      class="relative w-full max-w-2xl bg-white/95 backdrop-blur-md border border-red-200
           rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.4)] px-4 py-6 md:px-6 lg:px-12 md:py-10 z-10"
  >
    <div class="flex flex-col items-center gap-1.5 md:gap-2 mb-4 md:mb-6">
      <p class="text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-red-600">
        {{ t("landing.tagline") }}
      </p>
      <h1 class="text-center text-3xl md:text-5xl lg:text-6xl font-bold text-red-700 tracking-tight drop-shadow-sm">
        {{ t("landing.title") }}
      </h1>
      <p class="text-center text-sm md:text-base text-slate-600 mt-1.5 md:mt-2 max-w-xl px-2">
        {{ t("landing.subtitlePrefix") }}
        <span class="font-semibold text-red-700">{{ t("landing.subtitleManualHighlight") }}</span>,
        {{ t("landing.subtitleMiddle") }}
        <span class="font-semibold text-green-700">{{ t("landing.subtitleInviteHighlight") }}</span>.
      </p>
    </div>

    <div class="grid gap-4 md:gap-6 mt-6 md:mt-10">
      <div
          class="group border-2 border-red-300 rounded-xl md:rounded-2xl px-4 py-5 md:px-6 md:py-8 text-center
               bg-gradient-to-br from-red-50 to-white shadow-sm
               hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      >
        <p class="text-sm md:text-sm text-slate-700 mb-4 md:mb-6 leading-relaxed font-medium">
          {{ t("landing.manualCardDescriptionLine1") }}<br />
          {{ t("landing.manualCardDescriptionLine2") }}
        </p>
        <button
            type="button"
            class="mt-auto inline-flex justify-center items-center rounded-lg md:rounded-xl bg-red-600
                 text-white text-lg md:text-xl font-semibold py-2.5 md:py-3 px-5 md:px-6 gap-2
                 group-hover:bg-red-700 hover:shadow-lg transition-all w-full md:w-auto"
            @click="$emit('manual-click')"
        >
          {{ t("landing.manualCardButton") }}
          <span aria-hidden="true" class="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      <div
          class="group border-2 border-green-400 rounded-xl md:rounded-2xl px-4 py-5 md:px-6 md:py-8 text-center
               bg-gradient-to-br from-green-50 to-white shadow-sm
               hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      >
        <p class="text-sm md:text-sm text-slate-700 mb-4 md:mb-6 leading-relaxed font-medium">
          {{ t("landing.inviteCardDescriptionLine1") }}<br />
          {{ t("landing.inviteCardDescriptionLine2") }}
        </p>
        <button
            type="button"
            class="mt-auto inline-flex justify-center items-center rounded-lg md:rounded-xl border-2 border-green-600
                 text-green-700 text-lg md:text-xl font-semibold py-2.5 md:py-3 px-5 md:px-6 bg-white
                 group-hover:bg-green-50 hover:shadow-lg transition-all gap-2 w-full md:w-auto"
            @click="$emit('register-click')"
        >
          {{ t("landing.inviteCardButton") }}
          <span aria-hidden="true" class="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </div>

    <p class="text-center text-xs md:text-sm text-slate-400 mt-6 md:mt-8">
      {{ t("landing.footnote") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineEmits<{
  (e: 'manual-click'): void
  (e: 'register-click'): void
}>()

const { t } = useI18n();
</script>
