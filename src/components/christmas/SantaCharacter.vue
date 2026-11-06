<template>
  <div
      ref="rootRef"
      :class="['santa-character relative select-none', interactive ? '' : 'pointer-events-none', wrapperClass]"
      :style="[fluid ? { width: '100%', height: '100%' } : { width: size + 'px', height: size * 1.25 + 'px' }, wrapperStyle]"
      role="img"
      :aria-label="ariaLabel"
  >
    <!-- Durağan kare: model yüklenene kadar, hareket azaltma tercihinde ve WebGL yoksa gösterilir -->
    <img
        :src="still"
        :width="size"
        :height="size * 1.25"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
        alt=""
        class="absolute inset-0 block w-full h-full object-contain transition-opacity duration-500 ease-out"
        :class="live ? 'opacity-0' : 'opacity-100'"
    />
    <div
        ref="hostRef"
        class="absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out"
        :class="[live ? 'opacity-100' : 'opacity-0', interactive ? 'cursor-pointer' : '']"
        @click="onClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { SantaMood, SantaStage } from "./santa3d/santaStage";

import waveStill from "@/assets/characters/santa-wave-still.webp";
import thinkingStill from "@/assets/characters/santa-thinking-still.webp";
import sadStill from "@/assets/characters/santa-sad-still.webp";
import celebrateStill from "@/assets/characters/santa-celebrate-still.webp";

export type { SantaMood };

/**
 * Gerçek zamanlı 3D Noel Baba (three.js). Model: src/assets/characters/santa.glb
 *
 * - mood: wave | thinking | sad | celebrate — değiştiğinde karakter yumuşakça yeni moda geçer.
 * - size: genişlik (px); yükseklik size * 1.25.
 * - interactive: başı ve gözleri imleci takip eder, tıklayınca zıplar.
 * - eager: ekranda görünür olmasını beklemeden hemen yükle (sayfanın üstündeki karakterler için).
 *
 * three.js ayrı bir parça olarak, yalnızca karakter ekrana girdiğinde yüklenir.
 */
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
}>(), {
  mood: "wave",
  size: 400,
  wrapperClass: "",
  wrapperStyle: () => ({}),
  interactive: false,
  eager: false,
  label: "",
  fluid: false,
});

const STILLS: Record<SantaMood, string> = {
  wave: waveStill,
  thinking: thinkingStill,
  sad: sadStill,
  celebrate: celebrateStill,
};

const { t } = useI18n();
const still = computed(() => STILLS[props.mood] ?? STILLS.wave);
const ariaLabel = computed(() => props.label || t(`characters.santa.${props.mood}`));

const rootRef = ref<HTMLElement | null>(null);
const hostRef = ref<HTMLElement | null>(null);
const live = ref(false);

let stage: SantaStage | null = null;
let api: typeof import("./santa3d/santaStage") | null = null;
let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let visible = false;
let destroyed = false;
let initStarted = false; // eager + IntersectionObserver can both call init(); create only one stage

const reducedMotion = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function init() {
  if (initStarted || destroyed) return;
  initStarted = true;
  try {
    api = await import("./santa3d/santaStage");
  } catch {
    return;
  }
  if (destroyed || !hostRef.value || !api.webglAvailable()) return;
  stage = new api.SantaStage({
    mood: props.mood,
    interactive: props.interactive,
    onReady: () => {
      live.value = true;
      updateRunning();
    },
  });
  hostRef.value.appendChild(stage.canvas);
  const resize = () => {
    const el = hostRef.value;
    if (el && stage) stage.resize(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight));
  };
  resize();
  ro = new ResizeObserver(resize);
  ro.observe(hostRef.value);
}

function updateRunning() {
  if (!stage || !api) return;
  if (visible && stage.isReady) api.startStage(stage);
  else api.stopStage(stage);
}

function onPointerMove(e: PointerEvent) {
  if (!stage || !rootRef.value) return;
  const r = rootRef.value.getBoundingClientRect();
  // normalized so the cursor at the far edge of the viewport is ~±1.5
  const nx = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width, window.innerWidth / 3);
  const ny = (e.clientY - (r.top + r.height * 0.3)) / Math.max(r.height, window.innerHeight / 3);
  stage.setPointer(nx, ny);
}

function onClick() {
  if (props.interactive) stage?.boop();
}

watch(() => props.mood, (m) => stage?.setMood(m));
watch(() => props.interactive, (v) => stage?.setInteractive(v));

onMounted(() => {
  if (reducedMotion() || typeof IntersectionObserver === "undefined") return;
  // eager: start loading right away, but only if the element is actually laid out (not display:none)
  if (props.eager && rootRef.value?.offsetParent) init();
  io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((en) => en.isIntersecting);
        if (visible) init();
        updateRunning();
      },
      { rootMargin: "150px" }
  );
  if (rootRef.value) io.observe(rootRef.value);
  if (props.interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
});

onUnmounted(() => {
  destroyed = true;
  io?.disconnect();
  ro?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  if (stage && api) {
    api.stopStage(stage);
    stage.dispose();
  }
  stage = null;
});
</script>
