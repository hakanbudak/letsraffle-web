<template>
  <!-- below the first screen: what the site does, how it works and common questions -->
  <section class="home-guide px-4 pb-16 pt-14 text-snow md:px-12 md:pb-24 md:pt-20" aria-labelledby="home-guide-title">
    <div class="mx-auto max-w-[1040px]">
      <h2 id="home-guide-title" class="text-center font-display text-[30px] font-black leading-tight md:text-[44px]">{{ c.heading }}</h2>
      <p class="mx-auto mt-4 max-w-[720px] text-center text-base font-semibold leading-relaxed text-snow/90 md:text-lg">{{ c.intro }}</p>

      <h3 class="mt-12 text-center font-display text-2xl font-black text-gold-300 md:text-[28px]">{{ c.stepsHeading }}</h3>
      <ol class="mt-6 grid list-none gap-4 p-0 md:grid-cols-3 md:gap-6">
        <li v-for="(step, i) in c.steps" :key="step.title" class="xm-card h-auto px-6 py-7">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cranberry-800 font-display text-lg font-black text-gold-300" aria-hidden="true">{{ i + 1 }}</span>
          <h4 class="mt-3 font-display text-xl font-black text-cranberry-800">{{ step.title }}</h4>
          <p class="mt-2 text-[15px] leading-relaxed text-ink-soft">{{ step.text }}</p>
        </li>
      </ol>

      <h3 class="mt-14 text-center font-display text-2xl font-black text-gold-300 md:text-[28px]">{{ c.modesHeading }}</h3>
      <div class="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
        <article v-for="mode in c.modes" :key="mode.title" class="rounded-[24px] bg-cranberry-950/60 px-6 py-6 shadow-[inset_0_0_0_1.5px_rgba(230,185,74,0.55)]">
          <h4 class="font-display text-xl font-black text-gold-300">{{ mode.title }}</h4>
          <p class="mt-2 text-[15px] leading-relaxed text-snow/90">{{ mode.text }}</p>
        </article>
      </div>

      <h3 class="mt-14 text-center font-display text-2xl font-black text-gold-300 md:text-[28px]">{{ c.faqHeading }}</h3>
      <div class="xm-card mx-auto mt-6 h-auto max-w-[820px] px-6 py-4 sm:px-8">
        <details v-for="item in c.faq" :key="item.q" class="group border-b border-[#e8cfc0] py-4 last:border-b-0">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-black text-cranberry-800">
            <span>{{ item.q }}</span>
            <span aria-hidden="true" class="text-gold-600 transition-transform duration-200 group-open:rotate-45">+</span>
          </summary>
          <p class="mt-2 text-[15px] leading-relaxed text-ink-soft">{{ item.a }}</p>
        </details>
      </div>

      <nav class="mt-14 text-center" :aria-label="ui.guidesHeading">
        <h3 class="font-display text-2xl font-black text-gold-300 md:text-[28px]">{{ ui.guidesHeading }}</h3>
        <ul class="mt-5 flex list-none flex-wrap justify-center gap-3 p-0">
          <li v-for="guide in guideLinks" :key="guide.path">
            <router-link :to="guide.path" class="inline-block rounded-full bg-snow px-5 py-2.5 text-[15px] font-extrabold text-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a] transition-colors hover:bg-gold-100">{{ guide.linkText }}</router-link>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { homeContent } from "@/content/home";
import { guidesFor } from "@/content/guides";
import { guideUi } from "@/content/guideUi";
import type { Locale } from "@/i18n";

const { locale } = useI18n();
const lang = computed<Locale>(() => (locale.value === "en" ? "en" : "tr"));
const c = computed(() => homeContent[lang.value]);
const ui = computed(() => guideUi[lang.value]);
const guideLinks = computed(() => guidesFor(lang.value));
</script>

<style scoped>
.home-guide {
  background: linear-gradient(180deg, #6e0d12 0%, #5c0b0f 100%);
}
.home-guide summary::-webkit-details-marker {
  display: none;
}
</style>
