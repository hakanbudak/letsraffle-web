<template>
  <ChristmasScene glow-x="50%" glow-y="30%" :garland="false">
    <template #header>
      <AppHeader :show-open-source="false" />
    </template>

    <main class="flex flex-1 items-start justify-center px-4 pb-12 lg:min-h-0 lg:overflow-y-auto">
      <article class="xm-card h-auto w-full max-w-[760px] self-start px-6 py-8 sm:px-10 sm:py-10" :aria-labelledby="`${doc}-title`">
        <h1 :id="`${doc}-title`" class="mb-2 font-display text-[34px] font-black leading-tight text-cranberry-800">{{ content.title }}</h1>
        <div class="xm-candy mb-3 w-[88px]"></div>
        <p class="mb-6 text-[13px] font-bold text-ink-muted">{{ content.updated }}</p>
        <p class="mb-6 text-[15px] leading-relaxed text-ink-soft">{{ content.intro }}</p>

        <section v-for="section in content.sections" :key="section.heading" class="mb-6">
          <h2 class="mb-2 font-display text-xl font-black text-cranberry-800">{{ section.heading }}</h2>
          <p v-for="(p, i) in section.paragraphs" :key="`p${i}`" class="mb-2 text-[15px] leading-relaxed text-ink-soft">{{ p }}</p>
          <ul v-if="section.items" class="ml-5 list-disc space-y-1.5 text-[15px] leading-relaxed text-ink-soft">
            <li v-for="(item, i) in section.items" :key="`i${i}`">{{ item }}</li>
          </ul>
          <p v-if="section.note" class="mt-2 text-[15px] leading-relaxed text-ink-soft">{{ section.note }}</p>
        </section>

        <nav class="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e8cfc0] pt-5 text-sm font-extrabold">
          <router-link to="/" class="text-cranberry-600 hover:text-cranberry-900">{{ t("legal.home") }}</router-link>
          <router-link :to="otherPath" class="text-cranberry-600 hover:text-cranberry-900">{{ otherTitle }}</router-link>
          <router-link v-if="showSupportLink" to="/support" class="text-cranberry-600 hover:text-cranberry-900">{{ supportTitle }}</router-link>
          <a :href="`mailto:${CONTACT_EMAIL}`" class="text-cranberry-600 hover:text-cranberry-900">{{ CONTACT_EMAIL }}</a>
        </nav>
      </article>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { CONTACT_EMAIL, legal, type LegalDoc } from "@/content/legal";

const props = defineProps<{ doc: LegalDoc }>();
const { t, locale } = useI18n();

const lang = computed(() => (locale.value === "en" ? "en" : "tr"));
const content = computed(() => legal[props.doc][lang.value]);
const other = computed<LegalDoc>(() => (props.doc === "privacy" ? "terms" : "privacy"));
const showSupportLink = computed(() => props.doc !== "support");
const supportTitle = computed(() => legal.support[lang.value].title);
const otherPath = computed(() => `/${other.value}`);
const otherTitle = computed(() => legal[other.value][lang.value].title);

const previousTitle = document.title;
watchEffect(() => {
  document.title = `${content.value.title} | Lets Raffle`;
});
onUnmounted(() => {
  document.title = previousTitle;
});
</script>
