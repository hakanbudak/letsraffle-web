<template>
  <div
      ref="rootRef"
      :class="['christmas-figure select-none', interactive ? 'cursor-pointer' : 'pointer-events-none']"
      :style="width ? { width: width + 'px' } : undefined"
      role="img"
      :aria-label="t(`characters.figures.${figure}`)"
      @click="onClick"
  >
    <img
        :src="currentSrc"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
        alt=""
        class="block h-auto w-full"
        :class="{ 'figure-boop': booping }"
        @animationend="booping = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Extra Blender-rendered Christmas figures in the Santa's toon style
 * (art/build_figures.py -> art/renders/figs -> src/assets/figures).
 * Shows the still frame until the figure scrolls into view, and always with reduced motion.
 */
export type FigureName = "snowman" | "rudolph" | "tree" | "candy" | "hug";

const assets = import.meta.glob("@/assets/figures/*.webp", { eager: true, import: "default" }) as Record<string, string>;
const pick = (file: string) => Object.entries(assets).find(([k]) => k.endsWith(`/${file}`))?.[1] ?? "";

const props = withDefaults(defineProps<{
  figure: FigureName
  /** width in px; omit to fill the parent's width */
  width?: number
  eager?: boolean
  interactive?: boolean
  /** always show the still frame (for small background figures) */
  still?: boolean
}>(), { width: undefined, eager: false, interactive: false, still: false });

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const currentSrc = ref(pick(`${props.figure}-still.webp`));
const booping = ref(false);
let io: IntersectionObserver | null = null;

const reducedMotion = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function play() {
  const anim = pick(`${props.figure}.webp`);
  if (!anim || props.still || reducedMotion()) return;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => { currentSrc.value = anim; };
  img.src = anim;
}

function onClick() {
  if (props.interactive) booping.value = true;
}

onMounted(() => {
  if (reducedMotion()) return;
  if (props.eager || typeof IntersectionObserver === "undefined") { play(); return; }
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { play(); io?.disconnect(); }
  }, { rootMargin: "150px" });
  if (rootRef.value) io.observe(rootRef.value);
});

onUnmounted(() => io?.disconnect());
</script>

<style scoped>
.figure-boop {
  animation: figure-boop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
  transform-origin: 50% 100%;
}
@keyframes figure-boop {
  0% { transform: none; }
  30% { transform: translateY(-6%) scale(1.03, 0.97); }
  60% { transform: translateY(0) scale(0.98, 1.02); }
  100% { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .figure-boop { animation: none; }
}
</style>
