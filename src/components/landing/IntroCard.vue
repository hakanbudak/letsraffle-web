<template>
  <section class="xm-card w-full px-5 py-8 sm:px-10 sm:pb-8 sm:pt-10 compact:!py-7" aria-labelledby="intro-title" :class="{ 'xm-rise': rise }">
    <p class="xm-eyebrow text-center text-cranberry-600" lang="en">{{ t("landing.tagline") }}</p>
    <h2 id="intro-title" class="mt-1.5 mb-3 text-center font-display text-[40px] font-black leading-none tracking-tight text-cranberry-800 sm:text-[50px] compact:!text-[42px]">
      {{ t("landing.title") }}
    </h2>
    <div class="xm-candy xm-candy-move mx-auto mb-4 w-[120px]"></div>
    <p class="mx-auto mb-6 compact:mb-4 max-w-[420px] text-center text-base leading-relaxed text-ink-soft">
      {{ t("landing.subtitlePrefix") }}
      <strong class="text-pine-700">{{ t("landing.subtitleInviteHighlight") }}</strong>,
      {{ t("landing.subtitleMiddle") }}
      <strong class="text-cranberry-800">{{ t("landing.subtitleManualHighlight") }}</strong>.
    </p>

    <div class="flex flex-col gap-4">
      <!-- Invite mode: a wrapped present -->
      <article :class="{ 'xm-rise xm-d2': rise }" class="relative overflow-hidden rounded-[22px] bg-cranberry-800 px-6 pb-[22px] pt-6 text-snow shadow-[inset_0_0_0_2px_#e6b94a,0_12px_30px_rgba(110,13,18,0.28)]">
        <div aria-hidden="true" class="absolute bottom-0 top-0 right-[46px] sm:right-[92px] w-3.5 bg-gold-400/90"></div>
        <div aria-hidden="true" class="absolute left-0 right-0 top-[38px] h-3.5 bg-gold-400/90"></div>
        <span class="xm-seal xm-wobble absolute right-5 sm:right-[66px] top-3.5 h-[66px] w-[66px] bg-snow text-xs text-cranberry-800 shadow-[inset_0_0_0_3px_#e6b94a,0_6px_14px_rgba(60,0,0,0.3)]">
          {{ t("landing.inviteCardBadgeFree") }}
        </span>
        <h3 class="relative mb-6 compact:mb-5 inline-flex -rotate-2 items-center gap-2.5 rounded-[12px] bg-snow py-2.5 pl-3.5 pr-5 font-display text-[24px] font-black leading-none text-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a,0_8px_18px_rgba(60,0,0,0.32)]">
          <span aria-hidden="true" class="h-3 w-3 shrink-0 rounded-full bg-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a]"></span>
          {{ t("landing.inviteCardTitle") }}
        </h3>
        <p class="relative mb-[18px] max-w-[330px] text-[15px] font-semibold leading-normal text-snow/90">
          {{ t("landing.inviteCardDescriptionLine1") }}
          <i18n-t keypath="landing.inviteCardDescriptionLine2" tag="span">
            <template #automatic><strong class="text-gold-300">{{ t("landing.highlightAutomatic") }}</strong></template>
            <template #oneClick><strong class="text-gold-300">{{ t("landing.highlightOneClick") }}</strong></template>
          </i18n-t>
        </p>
        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <span class="text-[13px] font-extrabold text-gold-300">{{ t("landing.inviteShortTag") }}</span>
          <button type="button" class="xm-btn xm-btn-gold xm-shine" @click="$emit('register-click')">
            {{ t("landing.inviteCardButton") }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
        </div>
      </article>

      <!-- Manual mode -->
      <article :class="{ 'xm-rise xm-d3': rise }" class="rounded-[22px] bg-white px-6 py-[22px] compact:py-4 shadow-[inset_0_0_0_2px_#f0dfcb]">
        <div class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <div class="min-w-0 flex-1">
            <h3 class="mb-1 font-display text-2xl font-black text-cranberry-800">
              {{ t("landing.manualCardTitle") }}
              <span class="ml-1.5 rounded-full bg-pine-100 px-2.5 py-0.5 align-middle font-body text-xs font-extrabold text-pine-700">{{ t("landing.manualCardBadge") }}</span>
            </h3>
            <p class="text-[15px] leading-normal text-ink-soft">
              {{ t("landing.manualCardDescriptionLine1") }} {{ t("landing.manualCardDescriptionLine2") }}
            </p>
          </div>
          <button type="button" class="xm-btn xm-btn-red shrink-0" @click="$emit('manual-click')">
            {{ t("landing.manualCardButton") }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
        </div>
      </article>
    </div>

    <p class="mt-5 text-balance text-center text-[13px] leading-normal text-ink-muted compact:mt-3">{{ t("landing.footnote") }}</p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

/** play the rise-in animations (only on the first page load, not when coming back from login/register) */
withDefaults(defineProps<{ rise?: boolean }>(), { rise: true });
defineEmits<{
  (e: "manual-click"): void
  (e: "register-click"): void
}>();

const { t } = useI18n();
</script>
