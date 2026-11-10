<template>
  <ChristmasScene glow-x="50%" glow-y="35%" :snow="16" :forest="false">
    <template #header>
      <AppHeader />
    </template>
    <template #overlay>
      <!-- phones: one evenly spaced row of friends; desktop: two small groups standing in the left and right corners -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-2 z-0 flex items-end justify-evenly lg:bottom-[52px] lg:justify-start lg:gap-4 lg:px-[3%]">
        <ChristmasFigure figure="snowman" :animate-from="1024" class="w-[54px] sm:w-[76px] lg:w-[118px]" />
        <div class="h-[78px] w-[62px] sm:h-[100px] sm:w-[80px] lg:-ml-5 lg:h-[150px] lg:w-[118px]">
          <SantaCharacter mood="celebrate" fluid :animate-from="1024" />
        </div>
        <ChristmasFigure figure="candy" :animate-from="1024" class="w-[40px] sm:w-[56px] lg:hidden" />
        <span class="hidden flex-1 lg:block"></span>
        <ChristmasFigure figure="hug" :animate-from="1024" class="w-[60px] sm:w-[82px] lg:w-[124px]" />
        <ChristmasFigure figure="rudolph" :animate-from="1024" class="w-[50px] sm:w-[70px] lg:w-[108px]" />
      </div>
    </template>

    <main class="relative flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-2 text-center lg:min-h-0 lg:pb-[110px]">
      <!-- loading -->
      <div v-if="stage === 'loading'" class="flex flex-col items-center gap-3" role="status">
        <div class="h-10 w-10 animate-spin rounded-full border-[3px] border-snow/30 border-t-gold-300"></div>
        <p class="text-sm font-bold text-snow/85">{{ t("reveal.loading") }}</p>
      </div>

      <!-- invalid link / not drawn yet -->
      <section v-else-if="stage === 'error'" class="xm-card w-full max-w-[440px] px-6 py-8">
        <ChristmasFigure :figure="errorKind === 'pending' ? 'snowman' : 'rudolph'" :width="110" class="mx-auto" eager />
        <h1 class="mt-3 font-display text-[28px] font-black leading-tight text-cranberry-800">
          {{ errorKind === "pending" ? t("reveal.pendingTitle") : t("reveal.invalidTitle") }}
        </h1>
        <p class="mt-2 text-[15px] leading-relaxed text-ink-soft">
          {{ errorKind === "pending" ? t("reveal.pendingText") : t("reveal.invalidText") }}
        </p>
        <router-link to="/" class="xm-btn xm-btn-red mt-6">{{ t("reveal.goHome") }}</router-link>
      </section>

      <Transition v-else name="stage" mode="out-in">
        <!-- 1. happy new year -->
        <section v-if="stage === 'hello'" key="hello" class="flex w-full max-w-[640px] flex-col items-center">
          <p class="xm-eyebrow text-gold-300">{{ t("reveal.eyebrow") }}</p>
          <h1 class="xm-glow mt-2 font-script text-[64px] leading-none text-gold-300 sm:text-[96px]">{{ t("reveal.happyNewYear") }}</h1>
          <p class="mt-2 font-display text-[30px] font-black text-snow sm:text-[40px]">{{ firstName }}!</p>
          <div class="mt-2 aspect-[4/5] h-[min(36vh,300px)]">
            <SantaCharacter mood="wave" fluid interactive eager :preload="['draw']" />
          </div>
          <p class="mt-3 max-w-[460px] text-base font-semibold leading-relaxed text-snow/90 sm:text-lg">{{ t("reveal.helloText") }}</p>
          <button type="button" class="xm-btn xm-btn-gold xm-shine mt-6 xm-btn-lg" @click="go('santa')">
            {{ t("reveal.helloCta") }}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
          <Dots :active="0" />
        </section>

        <!-- 2. Santa draws a name from his sack -->
        <section v-else-if="stage === 'santa'" key="santa" class="flex w-full max-w-[640px] flex-col items-center">
          <h2 class="font-display text-[30px] font-black leading-tight text-snow sm:text-[40px]">{{ t("reveal.santaTitle") }}</h2>
          <div class="mt-3 aspect-[4/5] h-[min(42vh,360px)]">
            <SantaCharacter mood="draw" fluid interactive eager />
          </div>
          <p class="mt-2 min-h-[56px] max-w-[460px] text-base font-semibold leading-relaxed text-snow/90 sm:text-lg" aria-live="polite">
            {{ santaReady ? t("reveal.santaReady") : t("reveal.santaText") }}<span v-if="!santaReady" class="xm-ellipsis" aria-hidden="true"></span>
          </p>
          <button type="button" class="xm-btn xm-btn-gold xm-shine mt-4 xm-btn-lg transition-opacity duration-500" :class="santaReady ? 'opacity-100' : 'pointer-events-none opacity-0'" :tabindex="santaReady ? 0 : -1" @click="go('gift')">
            {{ t("reveal.santaCta") }}
          </button>
          <Dots :active="1" />
        </section>

        <!-- 3. shaking gift: tap to open -->
        <section v-else-if="stage === 'gift'" key="gift" class="flex w-full max-w-[640px] flex-col items-center">
          <h2 class="font-display text-[30px] font-black leading-tight text-snow sm:text-[40px]">{{ t("reveal.giftTitle") }}</h2>
          <p class="mt-2 max-w-[440px] text-base font-semibold text-snow/90 sm:text-lg">{{ opening ? t("reveal.giftOpening") : t("reveal.giftText") }}</p>
          <button
              type="button"
              class="gift-btn relative mt-4 w-[min(78vw,340px)] cursor-pointer border-0 bg-transparent p-0"
              :class="{ 'gift-pulse': !opening }"
              :disabled="opening"
              :aria-label="t('reveal.giftCta')"
              @click="openGift">
            <span aria-hidden="true" class="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(246,217,138,0.6),rgba(246,217,138,0)_68%)]"></span>
            <img :src="giftSrc" alt="" class="relative block h-auto w-full" draggable="false" />
          </button>
          <p v-if="!opening" class="mt-1 text-sm font-extrabold uppercase tracking-[0.2em] text-gold-300">{{ t("reveal.giftCta") }} 👆</p>
          <Dots :active="2" />
        </section>

        <!-- 4. who you're buying for -->
        <section v-else-if="stage === 'reveal' && match" key="reveal" class="flex w-full max-w-[520px] flex-col items-center">
          <img :src="giftEnd" alt="" class="-mb-6 w-[150px]" draggable="false" />
          <div class="xm-card reveal-card w-full px-6 pb-7 pt-8 sm:px-10">
            <p class="xm-eyebrow text-cranberry-600">{{ t("reveal.resultEyebrow") }}</p>
            <h2 class="reveal-name mt-2 break-words font-display text-[40px] font-black leading-[1.05] text-cranberry-800 sm:text-[52px]">
              {{ match.receiver.firstName }} {{ match.receiver.lastName }}
            </h2>
            <div class="xm-candy xm-candy-move mx-auto mt-3 w-[110px]"></div>

            <dl v-if="match.receiver.address || match.receiver.phone" class="mt-5 flex flex-col gap-2.5 text-left">
              <div v-if="match.receiver.address" class="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_0_0_2px_#f0dfcb]">
                <dt class="sr-only">{{ t("reveal.address") }}</dt>
                <span class="mt-0.5 text-cranberry-700"><IconMapPin :size="20" stroke-class="stroke-current" /></span>
                <dd class="m-0 min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink">{{ match.receiver.address }}</dd>
                <button type="button" class="flex-none cursor-pointer rounded-full border-0 bg-[#fff3dc] px-3 py-1.5 text-xs font-extrabold text-cranberry-800 hover:bg-[#ffe9bf]" @click="copy(match.receiver.address)">
                  {{ copied === match.receiver.address ? t("reveal.copied") : t("reveal.copy") }}
                </button>
              </div>
              <div v-if="match.receiver.phone" class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_0_0_2px_#f0dfcb]">
                <dt class="sr-only">{{ t("reveal.phone") }}</dt>
                <span class="text-cranberry-700"><IconPhone :size="20" stroke-class="stroke-current" /></span>
                <dd class="m-0 flex-1 text-[15px] font-semibold text-ink">{{ match.receiver.phone }}</dd>
              </div>
            </dl>

            <p class="mt-5 rounded-2xl bg-pine-100 px-4 py-3 text-sm font-bold leading-relaxed text-pine-900">{{ t("reveal.secret") }}</p>
            <button type="button" class="mt-4 cursor-pointer border-0 bg-transparent text-sm font-extrabold text-cranberry-600 hover:text-cranberry-900" @click="replay">
              ↺ {{ t("reveal.replay") }}
            </button>
          </div>
        </section>
      </Transition>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import axios from "axios";
import confetti from "canvas-confetti";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";
import IconMapPin from "@/components/icons/IconMapPin.vue";
import IconPhone from "@/components/icons/IconPhone.vue";
import giftShake from "@/assets/figures/gift-shake.webp";
import giftOpen from "@/assets/figures/gift-open.webp";
import giftEnd from "@/assets/figures/gift-open-end.webp";

/**
 * Personal reveal page opened from the draw result email (/reveal/:token, token = participant token).
 * Builds up the surprise in steps: Happy New Year -> Santa draws from his sack -> tap the shaking gift -> who you're buying for.
 */
type Stage = "loading" | "error" | "hello" | "santa" | "gift" | "reveal";
interface MatchResult {
  drawId: number;
  inviteCode?: string | null;
  receiver: { firstName: string; lastName: string; address?: string | null; phone?: string | null };
}

const Dots = defineComponent({
  props: { active: { type: Number, required: true } },
  setup: (props) => () =>
    h("div", { class: "mt-8 flex gap-2", "aria-hidden": "true" },
      [0, 1, 2, 3].map((i) =>
        h("span", { class: ["h-2 rounded-full transition-all duration-300", i === props.active ? "w-6 bg-gold-300" : "w-2 bg-snow/40"] }))),
});

const { t } = useI18n();
const route = useRoute();
// separate client: no auth interceptors (a bad token must not log the visitor out)
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

const stage = ref<Stage>("loading");
const errorKind = ref<"invalid" | "pending">("invalid");
const firstName = ref("");
const match = ref<MatchResult | null>(null);
const santaReady = ref(false);
const opening = ref(false);
const giftSrc = ref(giftShake);
const copied = ref("");
const timers: ReturnType<typeof setTimeout>[] = [];
const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const token = computed(() => String(route.params.token || ""));

const go = (next: Stage) => {
  stage.value = next;
  if (next === "santa") {
    santaReady.value = false;
    later(() => (santaReady.value = true), reducedMotion() ? 300 : 3400);
  }
  if (next === "gift") {
    opening.value = false;
    giftSrc.value = giftShake;
  }
};

const burst = () => {
  if (reducedMotion()) return;
  const colors = ["#f6d98a", "#e6b94a", "#fffbf5", "#c4242a", "#4fb87e"];
  confetti({ particleCount: 140, spread: 90, startVelocity: 42, origin: { y: 0.55 }, colors, scalar: 1.1 });
  later(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 220);
  later(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 220);
};

const openGift = () => {
  if (opening.value) return;
  opening.value = true;
  // fresh URL so the one-shot animation always starts from its first frame
  giftSrc.value = `${giftOpen}#${Date.now()}`;
  later(burst, reducedMotion() ? 0 : 650);
  later(() => (stage.value = "reveal"), reducedMotion() ? 200 : 1900);
};

const replay = () => go("hello");

const copy = async (text?: string | null) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copied.value = text;
    later(() => (copied.value = ""), 1800);
  } catch {
    /* clipboard unavailable: ignore */
  }
};

onMounted(async () => {
  if (!token.value) {
    stage.value = "error";
    return;
  }
  const headers = { "X-Participant-Token": token.value };
  try {
    const [me, result] = await Promise.all([
      client.get("/api/v1/participants/me", { headers }),
      client.get<MatchResult>("/api/v1/participants/me/result", { headers }),
    ]);
    firstName.value = me.data?.firstName ?? "";
    match.value = result.data;
    stage.value = "hello";
    // warm up the heavier animations while the visitor reads the first step
    [giftShake, giftOpen, giftEnd].forEach((src) => { const img = new Image(); img.src = src; });
  } catch (err: any) {
    errorKind.value = err?.response?.status === 409 ? "pending" : "invalid";
    stage.value = "error";
  }
});

onUnmounted(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.stage-enter-active,
.stage-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.stage-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
.stage-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
.gift-pulse {
  animation: gift-pulse 1.8s ease-in-out infinite;
}
.gift-btn:focus-visible {
  outline: 3px solid #f6d98a;
  outline-offset: 6px;
  border-radius: 24px;
}
@keyframes gift-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.reveal-card {
  animation: reveal-pop 0.6s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.reveal-name {
  animation: reveal-name 0.8s 0.2s ease-out both;
}
@keyframes reveal-pop {
  0% { opacity: 0; transform: translateY(30px) scale(0.9); }
  100% { opacity: 1; transform: none; }
}
@keyframes reveal-name {
  0% { opacity: 0; transform: scale(1.12); filter: blur(6px); }
  100% { opacity: 1; transform: none; filter: none; }
}
.xm-ellipsis::after {
  content: "";
  animation: dots 1.4s steps(4, end) infinite;
}
@keyframes dots {
  0% { content: ""; }
  25% { content: "."; }
  50% { content: ".."; }
  75% { content: "..."; }
}
@media (prefers-reduced-motion: reduce) {
  .stage-enter-active, .stage-leave-active { transition: none; }
  .gift-pulse, .reveal-card, .reveal-name, .xm-ellipsis::after { animation: none; }
}
</style>
