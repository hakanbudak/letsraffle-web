<template>
  <ChristmasScene>
    <template #header>
      <AppHeader />
    </template>

    <main class="grid flex-1 gap-6 px-4 pb-10 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16 lg:pb-[120px] tall:pb-0 lg:pl-[72px] lg:pr-20">
      <section class="relative flex flex-col lg:min-h-0 lg:pt-[4vh]">
        <div class="flex items-end justify-between gap-2 lg:block">
          <div class="min-w-0 pb-4 lg:pb-0">
            <template v-if="currentPanel === 'intro'">
              <p class="xm-eyebrow text-[11px] text-gold-300 md:text-sm">{{ t("landing.tagline") }}</p>
              <h1 class="xm-glow mt-3 font-script text-[58px] font-normal leading-none text-gold-300 md:text-[clamp(88px,11vh,132px)]">
                {{ t("landing.heroScript") }}
              </h1>
              <p class="mt-2.5 max-w-[430px] text-sm font-semibold leading-relaxed text-snow/90 md:text-[19px]">{{ t("landing.heroText") }}</p>
            </template>
            <template v-else>
              <p class="xm-eyebrow text-[11px] text-gold-300 md:text-sm">{{ t("landing.inviteCardTitle") }}</p>
              <h1 class="mt-1 font-display text-[34px] font-black leading-[1.04] tracking-tight text-snow md:text-[64px]">{{ t("auth.heroTitle") }}</h1>
              <ol class="mt-5 hidden list-none flex-col gap-2.5 p-0 text-base font-bold md:flex">
                <li v-for="(step, i) in steps" :key="i" class="xm-rise flex items-center gap-2.5" :class="`xm-d${i + 1}`">
                  <span class="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gold-300 text-[13px] font-black text-cranberry-900">{{ i + 1 }}</span>
                  {{ step }}
                </li>
              </ol>
            </template>
          </div>
          <SantaCharacter class="shrink-0 lg:hidden" :mood="santaMood" :preload="santaPreload" :size="140" interactive eager />
        </div>

        <div class="absolute -bottom-[20px] tall:bottom-[78px] left-1/2 hidden aspect-[9/10] h-[min(54vh,480px)] -translate-x-[46%] lg:block">
          <SantaCharacter :mood="santaMood" :preload="santaPreload" fluid interactive eager />
        </div>
      </section>

      <div class="flex items-start lg:items-center lg:pb-[70px]" @focusin="onFormFocus" @focusout="onFormBlur">
        <IntroCard
            v-if="currentPanel === 'intro'"
            @manual-click="goManual"
            @register-click="openRegister" />

        <RegisterCard
            v-else-if="currentPanel === 'register'"
            @go-login="openLogin"
            @back-to-intro="backToIntro"
            @register-success="router.push('/dashboard')" />

        <LoginCard
            v-else
            @go-register="openRegister"
            @back-to-intro="backToIntro"
            @login-success="router.push('/dashboard')" />
      </div>
    </main>
    <LegalLinks class="pb-5 lg:absolute lg:bottom-3 lg:left-0 lg:right-0 lg:pb-0" />
  </ChristmasScene>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";
import IntroCard from "@/components/landing/IntroCard.vue";
import RegisterCard from "@/components/landing/RegisterCard.vue";
import LoginCard from "@/components/landing/LoginCard.vue";
import LegalLinks from "@/components/layout/LegalLinks.vue";
import { isAuthenticated } from "@/services/authHelpers";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const currentPanel = ref<"intro" | "register" | "login">("intro");

// Noel Baba: tanıtımda torbadan çeker, giriş/kayıtta listesini tutar, şifre yazılırken gözlerini kapatır
const passwordFocused = ref(false);
const isPasswordField = (el: EventTarget | null) =>
    el instanceof HTMLInputElement && (el.type === "password" || /password/i.test(el.id) || /password/i.test(el.name));
const onFormFocus = (e: FocusEvent) => (passwordFocused.value = isPasswordField(e.target));
const onFormBlur = (e: FocusEvent) => {
  if (!isPasswordField(e.relatedTarget)) passwordFocused.value = false;
};
const santaMood = computed(() =>
    currentPanel.value === "intro" ? "draw" : passwordFocused.value ? "cover" : "list");
const santaPreload = computed<("cover" | "list")[]>(() => (currentPanel.value === "intro" ? ["list"] : ["cover"]));

const steps = computed(() => [
  t("invitePanel.howItWorks.step1Title"),
  t("invitePanel.howItWorks.step2Title"),
  t("invitePanel.howItWorks.step3Title"),
]);

onMounted(() => {
  if (isAuthenticated()) {
    router.push("/dashboard").catch(() => undefined);
    return;
  }
  const panelParam = route.query.panel as string | undefined;
  if (panelParam === "register") currentPanel.value = "register";
  else if (panelParam === "login") currentPanel.value = "login";
});

const goManual = () => {
  router.push({ path: "/draw/manual", query: { directStart: "true" } });
};
const openRegister = () => (currentPanel.value = "register");
const openLogin = () => (currentPanel.value = "login");
const backToIntro = () => (currentPanel.value = "intro");
</script>
