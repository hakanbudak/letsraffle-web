<template>
  <div
      class="xm-scene-bg relative flex w-full flex-col overflow-x-hidden text-snow min-h-dvh tall:h-dvh tall:overflow-hidden"
      :style="{ '--xm-glow-x': glowX, '--xm-glow-y': glowY }">
    <!-- decor: snowfall, light garland, pine silhouettes, snowy ground -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
          v-for="(f, i) in flakes"
          :key="i"
          class="xm-flake"
          :style="{ left: f.left, width: f.size, height: f.size, opacity: f.opacity, animationDuration: f.duration, animationDelay: f.delay }"></div>

      <template v-if="garland">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" class="absolute left-0 top-[66px] hidden h-10 w-full md:block">
          <path d="M0 10 Q120 40 240 10 T480 10 T720 10 T960 10 T1200 10 T1440 10" fill="none" stroke="#3b2a1e" stroke-width="2" />
        </svg>
        <div
            v-for="(b, i) in bulbs"
            :key="`b${i}`"
            class="xm-bulb hidden md:block"
            :style="{ left: b.left, top: b.top, background: b.color, boxShadow: `0 0 12px ${b.color}`, animationDelay: b.delay }"></div>
      </template>

      <svg
          v-if="pines"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          class="absolute inset-x-0 bottom-[70px] hidden h-[26vh] w-full lg:block">
        <path
            d="M40 260 L110 90 L180 260Z M150 260 L235 40 L320 260Z M300 260 L360 130 L420 260Z M1040 260 L1110 110 L1180 260Z M1150 260 L1240 30 L1330 260Z M1300 260 L1370 120 L1440 260Z"
            fill="#5a0a0f"
            opacity="0.55" />
      </svg>

      <svg
          v-if="ground"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          class="absolute inset-x-0 bottom-0 hidden h-[120px] w-full lg:block">
        <path d="M0 40 C 180 10, 360 60, 560 34 S 960 6, 1160 36 S 1380 50, 1440 30 L1440 120 L0 120Z" fill="#fffbf5" />
        <path d="M0 58 C 220 34, 420 74, 640 52 S 1040 30, 1240 56 S 1400 64, 1440 54" fill="none" stroke="#e8ddd0" stroke-width="3" />
      </svg>
    </div>

    <slot name="header"></slot>

    <div class="relative z-[1] flex min-h-0 flex-1 flex-col">
      <slot></slot>
    </div>

    <slot name="overlay"></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Full-viewport (100vh on desktop) Christmas scene used by every page:
 * cranberry glow background, CSS snowfall, a twinkling light garland,
 * pine silhouettes and a snowy ground the Santa character stands on.
 * On small screens the page scrolls naturally (min-height 100dvh).
 */
const props = withDefaults(defineProps<{
  garland?: boolean;
  pines?: boolean;
  ground?: boolean;
  snow?: number;
  glowX?: string;
  glowY?: string;
}>(), {
  garland: true,
  pines: true,
  ground: true,
  snow: 14,
  glowX: "30%",
  glowY: "30%",
});

const SNOW = [
  [3, 6, 0.8, 14, -2], [9, 4, 0.6, 18, -9], [15, 7, 0.7, 12, -5], [22, 3, 0.6, 20, -14],
  [28, 5, 0.75, 15, -1], [35, 4, 0.55, 17, -11], [41, 6, 0.7, 13, -7], [48, 3, 0.6, 19, -3],
  [55, 5, 0.7, 16, -12], [61, 7, 0.6, 14, -6], [68, 4, 0.7, 18, -15], [74, 5, 0.65, 12, -4],
  [81, 3, 0.6, 21, -10], [87, 6, 0.75, 15, -8], [93, 4, 0.6, 17, -13], [98, 5, 0.7, 13, -2.5],
] as const;

const flakes = SNOW.slice(0, props.snow).map(([left, size, opacity, duration, delay]) => ({
  left: `${left}%`,
  size: `${size}px`,
  opacity,
  duration: `${duration}s`,
  delay: `${delay}s`,
}));

const BULB_COLORS = ["#f6d98a", "#4fb87e", "#fffbf5", "#ff8a7a"];
const bulbs = Array.from({ length: 6 }).flatMap((_, arc) =>
    [60, 120, 180].map((x, j) => {
      const i = arc * 3 + j;
      const y = [21, 25, 21][j];
      return {
        left: `${(((arc * 240 + x) / 1440) * 100).toFixed(2)}%`,
        top: `${66 + y}px`,
        color: BULB_COLORS[i % 4],
        delay: `${(i % 4) * 0.6}s`,
      };
    })
);
</script>
