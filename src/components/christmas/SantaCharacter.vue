<template>
  <div
      ref="rootRef"
      :class="['santa-character relative select-none', interactive ? 'cursor-pointer' : 'pointer-events-none', wrapperClass]"
      :style="[fluid ? { width: '100%', height: '100%' } : { width: size + 'px', height: size * 1.25 + 'px' }, wrapperStyle]"
      role="img"
      :aria-label="ariaLabel"
      @click="onClick"
  >
    <!-- previous mood fades out underneath while the new one fades in: a soft crossfade instead of a hard cut -->
    <img
        v-if="prevSrc"
        :key="`prev-${prevKey}`"
        :src="prevSrc"
        alt=""
        draggable="false"
        aria-hidden="true"
        class="santa-out absolute bottom-0 block h-auto max-w-none"
        :style="fitStyle(prevMood)"
    />
    <img
        :key="`cur-${prevKey}`"
        :src="currentSrc"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
        alt=""
        class="santa-img absolute bottom-0 block h-auto max-w-none"
        :style="fitStyle(shownMood)"
        :class="{ 'santa-boop': booping, 'santa-swap': !!prevSrc, invisible: videoReady }"
        @animationend="booping = false"
    />
    <!-- GPU-decoded transparent video on top once it is really playing (the still frame stays as poster/fallback) -->
    <video
        v-if="videoSrc"
        :key="videoSrc"
        muted
        playsinline
        autoplay
        loop
        disablepictureinpicture
        preload="auto"
        :src="videoSrc"
        aria-hidden="true"
        class="absolute bottom-0 block h-auto max-w-none"
        :style="fitStyle(shownMood)"
        :class="[videoReady ? 'visible' : 'invisible', { 'santa-boop': booping, 'santa-swap': !!prevSrc }]"
        @loadeddata="kickVideo($event, onVideoFail)"
        @playing="videoReady = true"
        @error="onVideoFail"
        @animationend="booping = false"
    ></video>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { alphaVideo, kickVideo } from "./alphaVideo";

/**
 * Blender'da render edilen Noel Baba animasyonları (seffaf, döngülü WebP).
 * Kaynak: art/build_santa.py (mood'lar) -> art/renders/ios -> src/assets/characters
 *
 * - mood: wave | thinking | sad | celebrate | draw | list | cover | watch | invite
 * - Ekrana girene kadar (eager değilse) ve "hareketi azalt" açıksa ilk kare (still) gösterilir.
 * - mood değişince önce yeni modun ilk karesi, animasyon yüklenince animasyon gösterilir.
 * - preload: sonradan geçilecek modların animasyonlarını önceden indirir (örn. şifre alanı için "cover").
 */
export type SantaMood = "wave" | "thinking" | "sad" | "celebrate" | "draw" | "list" | "cover" | "watch" | "invite";

const anims = import.meta.glob("@/assets/characters/santa-*.webp", { eager: true, import: "default" }) as Record<string, string>;
const pick = (name: string) => Object.entries(anims).find(([k]) => k.endsWith(`/${name}`))?.[1] ?? "";
const animOf = (m: SantaMood) => pick(`santa-${m}.webp`);
const stillOf = (m: SantaMood) => pick(`santa-${m}-still.webp`);

/**
 * Native frame sizes of the renders. Every mood is drawn at the same pixels-per-unit, so instead of
 * "contain"-fitting each frame (which made tightly cropped poses look bigger) all moods share one
 * scale: the frame width relative to REF_W, anchored bottom-centre. Santa is the same size in every pose.
 */
const DIMS: Record<SantaMood, [number, number]> = {
  wave: [420, 567], thinking: [382, 542], sad: [385, 497], celebrate: [451, 625], draw: [460, 521],
  list: [449, 511], cover: [306, 476], watch: [421, 497], invite: [463, 497],
};
const REF_W = 450;
function fitStyle(m: SantaMood) {
  const w = (DIMS[m][0] / REF_W) * 100;
  return { width: `${w}%`, left: `${(100 - w) / 2}%` };
}

const props = withDefaults(defineProps<{
  mood?: SantaMood
  size?: number
  wrapperClass?: string
  wrapperStyle?: Record<string, string>
  interactive?: boolean
  eager?: boolean
  label?: string
  /** fill the parent box instead of using size (parent should keep a 4:5 aspect ratio) */
  fluid?: boolean
  preload?: SantaMood[]
  /** only animate on viewports at least this wide; still frame below */
  animateFrom?: number
}>(), {
  mood: "wave",
  size: 400,
  wrapperClass: "",
  wrapperStyle: () => ({}),
  interactive: false,
  eager: false,
  label: "",
  fluid: false,
  preload: () => [],
  animateFrom: 0,
});

const { t } = useI18n();
const ariaLabel = computed(() => props.label || t(`characters.santa.${props.mood}`));

const rootRef = ref<HTMLElement | null>(null);
const currentSrc = ref(stillOf(props.mood));
const booping = ref(false);
let visible = false;
let io: IntersectionObserver | null = null;
const loaded = new Set<string>();

const reducedMotion = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function load(src: string, done?: () => void) {
  if (!src) return;
  if (loaded.has(src)) { done?.(); return; }
  const img = new Image();
  img.decoding = "async";
  img.onload = () => { loaded.add(src); done?.(); };
  img.src = src;
}

const videoSrc = ref("");
const videoReady = ref(false);
let videoFailed = false;

/** blocked = the browser refused autoplay (iOS Low Power Mode, data saver): stay on the light still frame */
let stillOnly = false;
function onVideoFail(blocked?: unknown) {
  videoFailed = true;
  videoSrc.value = "";
  videoReady.value = false;
  if (blocked === true) { stillOnly = true; return; }
  show(props.mood);
}

function show(m: SantaMood) {
  if (stillOnly || reducedMotion() || !visible || (props.animateFrom && window.innerWidth < props.animateFrom)) {
    currentSrc.value = stillOf(m);
    return;
  }
  const vid = videoFailed ? "" : alphaVideo(`santa-${m}`);
  if (vid) {
    currentSrc.value = stillOf(m);
    if (videoSrc.value !== vid) { videoReady.value = false; videoSrc.value = vid; }
    return;
  }
  const anim = animOf(m);
  if (loaded.has(anim)) {
    currentSrc.value = anim;
    return;
  }
  currentSrc.value = stillOf(m);
  load(anim, () => { if (props.mood === m) currentSrc.value = anim; });
}

function onClick() {
  if (props.interactive) booping.value = true;
}

const prevSrc = ref("");
const prevMood = ref<SantaMood>(props.mood);
const shownMood = ref<SantaMood>(props.mood);
const prevKey = ref(0);
let prevTimer: ReturnType<typeof setTimeout> | undefined;
const SWAP_MS = 520;

watch(() => props.mood, (m) => {
  if (!reducedMotion() && currentSrc.value) {
    prevSrc.value = currentSrc.value;
    prevMood.value = shownMood.value;
    prevKey.value++;
    clearTimeout(prevTimer);
    prevTimer = setTimeout(() => { prevSrc.value = ""; }, SWAP_MS);
  }
  shownMood.value = m;
  show(m);
});

onMounted(() => {
  if (reducedMotion()) return;
  // start animating (and preloading the next moods) only once this Santa is really on screen:
  // pages render a desktop and a phone Santa, and the hidden one must not download anything
  const start = () => {
    if (visible) return;
    visible = true;
    show(props.mood);
    schedulePreload();
  };
  if (typeof IntersectionObserver === "undefined") {
    start();
  } else {
    io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { start(); io?.disconnect(); }
    }, { rootMargin: "150px" });
    if (rootRef.value) io.observe(rootRef.value);
  }
});

watch(() => props.preload, () => { if (visible) schedulePreload(); });

/** fetch the moods we will switch to later, after the current animation and only when the browser is idle */
function schedulePreload() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /2g/.test(conn?.effectiveType ?? "")) return;
  const run = () => {
    for (const m of props.preload) {
      const vid = videoFailed ? "" : alphaVideo(`santa-${m}`);
      if (vid) fetch(vid).catch(() => undefined);
      else load(animOf(m));
    }
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  setTimeout(() => (idle ? idle(run, { timeout: 2000 }) : run()), 1200);
}

onUnmounted(() => { io?.disconnect(); clearTimeout(prevTimer); });
</script>

<style scoped>
.santa-img {
  animation: santa-in 0.35s ease-out both;
}
/* the old pose fades out quickly first, the new one pops in right after: never two full Santas at once */
.santa-swap {
  animation: santa-swap-in 0.34s 0.16s cubic-bezier(0.25, 0.8, 0.25, 1) both;
  transform-origin: 50% 100%;
}
.santa-out {
  animation: santa-swap-out 0.2s ease-in both;
  transform-origin: 50% 100%;
  pointer-events: none;
}
@keyframes santa-swap-in {
  0% { opacity: 0; transform: translateY(2%) scale(0.96); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: none; }
}
@keyframes santa-swap-out {
  0% { opacity: 1; transform: none; }
  100% { opacity: 0; transform: translateY(1%) scale(1.02); }
}
.santa-boop {
  animation: santa-boop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
  transform-origin: 50% 100%;
}
@keyframes santa-in {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
@keyframes santa-boop {
  0% { transform: none; }
  30% { transform: translateY(-6%) scale(1.03, 0.97); }
  60% { transform: translateY(0) scale(0.98, 1.02); }
  100% { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .santa-img, .santa-swap {
  animation: santa-swap-in 0.52s cubic-bezier(0.25, 0.8, 0.25, 1) both;
  transform-origin: 50% 100%;
}
.santa-out {
  animation: santa-swap-out 0.52s ease-in both;
  transform-origin: 50% 100%;
  pointer-events: none;
}
@keyframes santa-swap-in {
  0% { opacity: 0; transform: translateY(2%) scale(0.97); }
  55% { opacity: 1; }
  100% { opacity: 1; transform: none; }
}
@keyframes santa-swap-out {
  0% { opacity: 1; transform: none; }
  100% { opacity: 0; transform: translateY(1%) scale(1.02); }
}
.santa-boop { animation: none; }
}
</style>
