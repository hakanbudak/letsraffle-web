<template>
  <ChristmasScene :decor="sceneDecor">
    <template #header>
      <AppHeader />
    </template>

    <p v-if="accountDeleted" class="mx-auto mb-3 rounded-full bg-snow px-5 py-2 text-center text-sm font-extrabold text-pine-700 shadow-[inset_0_0_0_2px_#e6b94a]" role="status">
      {{ t("account.delete.done") }}
    </p>
    <main class="relative grid flex-1 gap-6 px-4 pb-10 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16 lg:pb-[120px] tall:pb-0 lg:pl-[72px] lg:pr-20">
      <section class="relative flex flex-col lg:min-h-0 lg:pt-[4vh]">
        <div class="flex items-end justify-between gap-2 lg:block">
          <div class="min-w-0 pb-4 lg:pb-0">
            <template v-if="currentPanel === 'intro'">
              <p class="xm-eyebrow text-[11px] text-gold-300 md:text-sm" lang="en">{{ t("landing.tagline") }}</p>
              <h1 class="xm-glow mt-3 font-script text-[58px] font-normal leading-none text-gold-300 md:text-[clamp(88px,11vh,132px)]">
                {{ t("landing.heroScript") }}
              </h1>
              <p class="mt-2.5 max-w-[430px] text-sm font-semibold leading-relaxed text-snow/90 md:text-[19px]">{{ t("landing.heroText") }}</p>
            </template>
            <template v-else>
              <p class="xm-eyebrow text-[11px] text-gold-300 md:text-sm">{{ t("landing.inviteCardTitle") }}</p>
              <h1 class="mt-1 font-display text-[34px] font-black leading-[1.04] tracking-tight text-snow md:text-[64px]">{{ t("auth.heroTitle") }}</h1>
              <ol class="mt-5 hidden list-none flex-col gap-2.5 p-0 text-base font-bold md:flex">
                <li v-for="(step, i) in steps" :key="i" class="flex items-center gap-2.5">
                  <span class="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gold-300 text-[13px] font-black text-cranberry-900">{{ i + 1 }}</span>
                  {{ step }}
                </li>
              </ol>
            </template>
          </div>
          <SantaCharacter class="shrink-0 lg:hidden" :mood="santaMood" :preload="santaPreload" :size="140" interactive eager />
        </div>

      </section>

      <div class="flex items-start lg:items-center lg:pb-[70px]" @focusin="onFormFocus" @focusout="onFormBlur">
        <IntroCard
            v-if="currentPanel === 'intro'"
            :rise="riseCard"
            @manual-click="goManual"
            @register-click="openRegister" />

        <RegisterCard
            v-else-if="currentPanel === 'register'"
            :rise="riseCard"
            @go-login="openLogin"
            @back-to-intro="backToIntro"
            @register-success="router.push('/dashboard')" />

        <LoginCard
            v-else
            :rise="riseCard"
            @go-register="openRegister"
            @back-to-intro="backToIntro"
            @login-success="router.push('/dashboard')" />
      </div>
      <!-- Santa stands on the snow ground, centred in the left column, whatever the card height -->
      <div
          class="pointer-events-none absolute bottom-[78px] hidden aspect-[9/10] -translate-x-[46%] lg:block"
          :class="currentPanel === 'intro' ? 'h-[min(50vh,450px)]' : 'h-[min(42vh,420px)]'"
          style="left: calc(72px + (100% - 776px) / 2)">
        <div class="pointer-events-auto h-full w-full">
          <SantaCharacter :mood="santaMood" :preload="santaPreload" fluid interactive eager />
        </div>
      </div>
    </main>
    <LegalLinks class="pb-5 lg:fixed lg:bottom-4 lg:left-0 lg:right-0 lg:pb-0" />
  </ChristmasScene>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
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

// Behind the snow hill: a small grove of decorated trees in three depth rows and Santa's friends on his left.
const sceneDecor = [
  // far row of the grove (smallest, faded) — painted first so everything else sits in front
  { figure: "tree" as const, cls: "left-[44.5%] bottom-[86px] w-[clamp(44px,3.6vw,58px)] opacity-60 [filter:saturate(0.55)_brightness(0.62)_blur(1px)]" },
  { figure: "tree" as const, cls: "left-[53%] bottom-[82px] w-[clamp(48px,4vw,64px)] opacity-60 [filter:saturate(0.55)_brightness(0.62)_blur(1px)]" },
  // middle row
  { figure: "tree" as const, cls: "left-[48.5%] bottom-[70px] w-[clamp(60px,5vw,80px)] opacity-80 [filter:saturate(0.7)_brightness(0.78)_blur(0.5px)]" },
  // Santa's friends: snowman + penguin hugging, behind the snow hill
  { figure: "hug" as const, cls: "left-[1.5%] bottom-[68px] w-[clamp(150px,12.5vw,200px)] [filter:saturate(0.92)_brightness(0.95)]" },
  // nearest tree of the grove
  { figure: "tree" as const, cls: "left-[42%] bottom-[58px] w-[clamp(78px,6.6vw,104px)] [filter:saturate(0.85)_brightness(0.9)_blur(0.2px)]" },
];
const route = useRoute();
const accountDeleted = computed(() => route.query.accountDeleted === "true");
const { t } = useI18n();

const currentPanel = ref<"intro" | "register" | "login">("intro");
// cards only rise in on the first page load; switching intro / login / register is an instant swap
const riseCard = ref(true);
watch(currentPanel, () => { riseCard.value = false; }, { flush: "sync" });

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
