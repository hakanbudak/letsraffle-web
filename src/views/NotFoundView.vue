<template>
  <ChristmasScene glow-x="50%" glow-y="40%" :garland="false">
    <template #header>
      <AppHeader :show-open-source="false" />
    </template>

    <main class="flex flex-1 flex-col items-center justify-center px-4 pb-12 text-center lg:min-h-0 lg:pb-[100px]">
      <ChristmasFigure figure="rudolph" :width="175" eager class="absolute bottom-[64px] right-[7%] hidden lg:block" />
      <div class="flex items-center justify-center gap-1 sm:gap-2" aria-hidden="true">
        <span class="xm-swing font-display text-[120px] font-black leading-[0.9] text-snow [text-shadow:0_8px_0_#6e0d12] sm:text-[clamp(160px,26vh,240px)]">4</span>
        <div class="aspect-[4/5] h-[160px] sm:h-[clamp(200px,32vh,290px)]">
          <SantaCharacter mood="sad" fluid interactive eager />
        </div>
        <span class="xm-swing font-display text-[120px] font-black leading-[0.9] text-snow [animation-delay:-1.6s] [text-shadow:0_8px_0_#6e0d12] sm:text-[clamp(160px,26vh,240px)]">4</span>
      </div>
      <h1 class="xm-rise mb-2 mt-3 font-display text-[32px] font-black leading-tight text-snow md:text-[44px]">{{ t("notFound.title") }}</h1>
      <p class="xm-rise xm-d1 mb-7 max-w-[520px] text-base font-semibold leading-relaxed text-snow/90 md:text-lg">{{ t("notFound.description") }}</p>
      <div class="xm-rise xm-d2 flex flex-wrap justify-center gap-3.5">
        <button type="button" class="xm-btn xm-btn-red !shadow-[inset_0_0_0_2px_#f6d98a,0_5px_0_#4a080c]" @click="goHome">{{ t("notFound.goHome") }}</button>
        <button type="button" class="xm-btn xm-btn-ghost" @click="goBack">← {{ t("notFound.goBack") }}</button>
      </div>
      <p class="xm-rise xm-d3 mt-6 text-sm font-bold text-snow/75">{{ t("notFound.funMessage") }}</p>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";

const router = useRouter();
const { t } = useI18n();

const goHome = () => {
  router.push("/").catch(() => undefined);
};

const goBack = () => {
  if (window.history.length > 1) router.go(-1);
  else router.push("/").catch(() => undefined);
};
</script>
