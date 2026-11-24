<template>
  <ChristmasScene glow-x="50%" glow-y="30%" :garland="false">
    <template #header>
      <AppHeader :show-open-source="false" />
    </template>

    <main class="flex flex-1 items-start justify-center px-4 pb-12 lg:min-h-0 lg:overflow-y-auto">
      <article v-if="guide" class="xm-card h-auto w-full max-w-[760px] self-start px-6 py-8 sm:px-10 sm:py-10" aria-labelledby="guide-title">
        <nav class="mb-4 text-[13px] font-bold text-ink-muted" :aria-label="ui.breadcrumb">
          <router-link :to="localePath('/')" class="text-cranberry-600 hover:text-cranberry-900">{{ ui.home }}</router-link>
          <span aria-hidden="true" class="mx-2 text-gold-600">›</span>
          <span aria-current="page">{{ guide.linkText }}</span>
        </nav>

        <h1 id="guide-title" class="mb-2 font-display text-[32px] font-black leading-tight text-cranberry-800 sm:text-[38px]">{{ guide.h1 }}</h1>
        <div class="xm-candy mb-5 w-[88px]"></div>
        <p class="mb-7 text-[16px] leading-relaxed text-ink-soft">{{ guide.intro }}</p>

        <section v-for="section in guide.sections" :key="section.heading" class="mb-7">
          <h2 class="mb-2 font-display text-[22px] font-black text-cranberry-800">{{ section.heading }}</h2>
          <p v-for="(p, i) in section.paragraphs ?? []" :key="`p${i}`" class="mb-2 text-[15px] leading-relaxed text-ink-soft">{{ p }}</p>
          <ul v-if="section.items" class="ml-5 list-disc space-y-1.5 text-[15px] leading-relaxed text-ink-soft">
            <li v-for="(item, i) in section.items" :key="`i${i}`">{{ item }}</li>
          </ul>
        </section>

        <!-- call to action: start a draw -->
        <aside class="my-8 rounded-[22px] bg-cranberry-800 px-6 py-6 text-snow shadow-[inset_0_0_0_2px_#e6b94a]">
          <p class="font-display text-xl font-black text-gold-300">{{ ui.ctaTitle }}</p>
          <p class="mt-1 text-[15px] leading-relaxed text-snow/90">{{ ui.ctaText }}</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <router-link :to="{ path: '/draw/manual', query: { directStart: 'true' } }" class="xm-btn xm-btn-gold">{{ ui.ctaManual }}</router-link>
            <router-link :to="localePath('/')" class="xm-btn xm-btn-ghost">{{ ui.ctaInvite }}</router-link>
          </div>
        </aside>

        <section v-if="guide.faq.length" class="mb-7">
          <h2 class="mb-3 font-display text-[22px] font-black text-cranberry-800">{{ ui.faq }}</h2>
          <div v-for="item in guide.faq" :key="item.q" class="mb-4">
            <h3 class="font-display text-lg font-black text-cranberry-800">{{ item.q }}</h3>
            <p class="mt-1 text-[15px] leading-relaxed text-ink-soft">{{ item.a }}</p>
          </div>
        </section>

        <nav class="mt-8 border-t border-[#e8cfc0] pt-5" :aria-label="ui.related">
          <p class="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-muted">{{ ui.related }}</p>
          <ul class="flex flex-col gap-1.5 text-[15px] font-extrabold">
            <li v-for="other in related" :key="other.path">
              <router-link :to="other.path" class="text-cranberry-600 hover:text-cranberry-900">{{ other.linkText }} →</router-link>
            </li>
          </ul>
        </nav>
      </article>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { findGuide, guidesFor } from "@/content/guides";
import { guideUi } from "@/content/guideUi";
import { localePath as toLocalePath } from "@/i18n/localized";

const props = defineProps<{ path: string }>();

const guide = computed(() => findGuide(props.path));
const locale = computed(() => guide.value?.locale ?? "tr");
const ui = computed(() => guideUi[locale.value]);
const related = computed(() => guidesFor(locale.value).filter((other) => other.path !== props.path));
// links follow the guide's language, not the stored one
const localePath = (path: string) => toLocalePath(path, locale.value);
</script>
