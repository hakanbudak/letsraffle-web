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
        class="santa-out absolute inset-0 block h-full w-full object-contain object-bottom"
    />
    <img
        :key="`cur-${prevKey}`"
        :src="currentSrc"
        :width="size"
        :height="size * 1.25"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
        alt=""
        class="santa-img absolute inset-0 block h-full w-full object-contain object-bottom"
        :class="{ 'santa-boop': booping, 'santa-swap': !!prevSrc }"
        @animationend="booping = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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
});

const { t } = useI18n();
const ariaLabel = computed(() => props.label || t(`characters.santa.${props.mood}`));

const rootRef = ref<HTMLElement | null>(null);
const currentSrc = ref(stillOf(props.mood));
const booping = ref(false);
let visible = props.eager;
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

function show(m: SantaMood) {
  if (reducedMotion() || !visible) {
    currentSrc.value = stillOf(m);
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
const prevKey = ref(0);
let prevTimer: ReturnType<typeof setTimeout> | undefined;
const SWAP_MS = 520;

watch(() => props.mood, (m) => {
  if (!reducedMotion() && currentSrc.value) {
    prevSrc.value = currentSrc.value;
    prevKey.value++;
    clearTimeout(prevTimer);
    prevTimer = setTimeout(() => { prevSrc.value = ""; }, SWAP_MS);
  }
  show(m);
});

onMounted(() => {
  if (reducedMotion()) return;
  if (visible) show(props.mood);
  if (typeof IntersectionObserver === "undefined") {
    visible = true;
    show(props.mood);
  } else {
    io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !visible) {
        visible = true;
        show(props.mood);
      }
    }, { rootMargin: "150px" });
    if (rootRef.value) io.observe(rootRef.value);
  }
  for (const m of props.preload) load(animOf(m));
});

onUnmounted(() => { io?.disconnect(); clearTimeout(prevTimer); });
</script>

<style scoped>
.santa-img {
  animation: santa-in 0.35s ease-out both;
}
.santa-swap {
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
