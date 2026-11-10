<template>
  <!-- Christmas loading indicator: a little string of lights that twinkle one after another -->
  <div class="xm-loader inline-flex flex-col items-center gap-2" role="status" :aria-label="label || t('common.loading')">
    <svg :width="width" :height="width * 0.36" viewBox="0 0 150 54" aria-hidden="true" class="overflow-visible">
      <path d="M4 10 Q40 34 75 14 T146 10" fill="none" :stroke="tone === 'light' ? '#3b2a1e' : '#6b4a33'" stroke-width="2.4" stroke-linecap="round" />
      <g v-for="(b, i) in bulbs" :key="i" class="xm-loader-bulb" :style="{ animationDelay: `${i * 0.18}s`, transformOrigin: `${b.x}px ${b.y}px` }">
        <rect :x="b.x - 3.4" :y="b.y - 1" width="6.8" height="6" rx="1.4" fill="#4a3a2c" />
        <ellipse :cx="b.x" :cy="b.y + 12" rx="6.4" ry="8.6" :fill="b.c" :style="{ filter: `drop-shadow(0 0 6px ${b.c})` }" />
        <ellipse :cx="b.x - 2" :cy="b.y + 9" rx="1.8" ry="2.8" fill="#fff" opacity="0.55" />
      </g>
    </svg>
    <p v-if="label !== ''" class="m-0 text-sm font-extrabold" :class="tone === 'light' ? 'text-snow/90' : 'text-ink-muted'">
      {{ label || t("common.loading") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(defineProps<{
  /** text under the lights; omit for the default "Loading…", pass "" for none */
  label?: string
  /** "light" on the red scene, "dark" on snow-white cards */
  tone?: "light" | "dark"
  width?: number
}>(), { label: undefined, tone: "dark", width: 150 });

const { t } = useI18n();

/** bulbs hanging from the wire (positions follow the curve above) */
const BULBS = [
  { x: 20, y: 18, c: "#f6d98a" },
  { x: 47, y: 22, c: "#4fb87e" },
  { x: 75, y: 14, c: "#ff6b6b" },
  { x: 103, y: 10, c: "#fffbf5" },
  { x: 130, y: 11, c: "#f6d98a" },
];
/** on white cards the snow-white bulb would vanish: swap it for a red one */
const bulbs = computed(() => props.tone === "dark" ? BULBS.map((b) => (b.c === "#fffbf5" ? { ...b, c: "#e6343a" } : b)) : BULBS);
</script>

<style scoped>
.xm-loader-bulb {
  animation: xm-loader-twinkle 1.1s ease-in-out infinite;
}
@keyframes xm-loader-twinkle {
  0%, 100% { opacity: 0.28; transform: rotate(-6deg); }
  45% { opacity: 1; transform: rotate(6deg); }
}
@media (prefers-reduced-motion: reduce) {
  .xm-loader-bulb { animation: none; opacity: 1; }
}
</style>
