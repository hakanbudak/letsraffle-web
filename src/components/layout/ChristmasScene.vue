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
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" class="absolute left-0 top-[104px] hidden h-10 w-full md:block">
          <path d="M0 10 Q120 40 240 10 Q360 40 480 10 Q600 40 720 10 Q840 40 960 10 Q1080 40 1200 10 Q1320 40 1440 10" fill="none" stroke="#3b2a1e" stroke-width="2" />
        </svg>
        <GarlandWreath
            v-for="(x, i) in WREATHS"
            :key="`w${i}`"
            :uid="`w${i}`"
            :size="46"
            class="absolute top-[97px] hidden -translate-x-1/2 md:block"
            :style="{ left: x }" />
        <div
            v-for="(b, i) in bulbs"
            :key="`b${i}`"
            class="xm-bulb hidden md:block"
            :style="{ left: b.left, top: b.top, background: b.color, boxShadow: `0 0 12px ${b.color}`, animationDelay: b.delay }"></div>
      </template>

      <!-- soft, realistic mountain range in the background: three hazy layers (farther = lighter and fainter)
           with snow on the upper slopes; kept low-contrast so it never competes with the content -->
      <svg
          v-if="pines"
          viewBox="0 0 1440 380"
          preserveAspectRatio="xMidYMax slice"
          class="absolute inset-x-0 bottom-[60px] hidden h-[44vh] w-full md:block"
          aria-hidden="true">
        <defs>
          <linearGradient v-for="(m, i) in MOUNTAINS" :id="`mtn${i}`" :key="`g${i}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :stop-color="m.top" :stop-opacity="m.opacity" />
            <stop offset="1" :stop-color="m.bottom" :stop-opacity="0" />
          </linearGradient>
          <filter id="mtnSoft"><feGaussianBlur stdDeviation="0.8" /></filter>
        </defs>
        <g v-for="(m, i) in MOUNTAINS" :key="`m${i}`" :filter="i === 0 ? 'url(#mtnSoft)' : undefined">
          <path :d="m.body" :fill="`url(#mtn${i})`" />
          <path :d="m.snow" fill="#fffbf5" :opacity="m.snowOpacity" stroke="#fffbf5" stroke-width="3" stroke-linejoin="round" />
        </g>
      </svg>

      <template v-if="pines && forest">
        <ChristmasFigure
            v-for="(t, i) in FOREST"
            :key="`forest${i}`"
            figure="tree"
            still
            class="absolute hidden opacity-70 [filter:saturate(0.6)_brightness(0.7)] md:block"
            :style="{ left: t.left, bottom: `${t.b}px`, width: `${t.w}px` }" />
      </template>

      <!-- distant figures sit behind the snow hill so their feet / pots are hidden -->
      <ChristmasFigure
          v-for="(d, i) in decor"
          :key="`decor${i}`"
          :figure="d.figure"
          eager
          :class="['absolute hidden lg:block', d.cls]" />
      <svg
          v-if="ground"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          class="absolute inset-x-0 bottom-0 hidden h-[120px] w-full lg:block">
        <path d="M0 40 C 180 10, 360 60, 560 34 S 960 6, 1160 36 S 1380 50, 1440 30 L1440 120 L0 120Z" fill="#fffbf5" />
        <path d="M0 58 C 220 34, 420 74, 640 52 S 1040 30, 1240 56 S 1400 64, 1440 54" fill="none" stroke="#e8ddd0" stroke-width="3" />
      </svg>
      <ChristmasFigure
          v-if="tree"
          figure="tree"
          :class="['absolute bottom-[58px] hidden w-[clamp(120px,11vw,170px)] lg:block', tree === 'left' ? 'left-[3%]' : 'right-[3%]']" />
    </div>

    <slot name="header"></slot>

    <div class="relative z-[1] flex min-h-0 flex-1 flex-col">
      <slot></slot>
    </div>

    <slot name="overlay"></slot>
  </div>
</template>

<script setup lang="ts">
import ChristmasFigure, { type FigureName } from "@/components/christmas/ChristmasFigure.vue";
import GarlandWreath from "@/components/christmas/GarlandWreath.vue";
/** wreaths pinned at the inner points where two arcs of the garland meet (x = 240, 480, … of 1440) */
const WREATHS = [1, 2, 3, 4, 5].map((a) => `${((a * 240) / 1440) * 100}%`);
/**
 * Full-viewport (100vh on desktop) Christmas scene used by every page:
 * cranberry glow background, CSS snowfall, a twinkling light garland,
 * pine silhouettes and a snowy ground the Santa character stands on.
 * On small screens the page scrolls naturally (min-height 100dvh).
 */
const props = withDefaults(defineProps<{
  garland?: boolean;
  pines?: boolean;
  /** row of small decorated trees at the foot of the mountains */
  forest?: boolean;
  ground?: boolean;
  snow?: number;
  glowX?: string;
  glowY?: string;
  /** decorated tree standing on the snow ground (desktop only) */
  tree?: "left" | "right" | false;
  /** figures standing behind the snow hill (desktop only): which figure + its position/size classes */
  decor?: { figure: FigureName; cls: string }[];
}>(), {
  garland: true,
  pines: true,
  forest: true,
  ground: true,
  snow: 14,
  glowX: "30%",
  glowY: "30%",
  tree: false,
  decor: () => [],
});


// ---- mountain range geometry (viewBox 1440 x 380, baseline y=380)
/** deterministic PRNG so the range looks the same on every render */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Catmull-Rom spline through the points as cubic Beziers (continues an open path) */
function smooth(p: ReadonlyArray<readonly [number, number]>): string {
  let d = "";
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `${i === 0 ? `L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ` : ""}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d;
}
/** natural ridge line by midpoint displacement */
function ridgeLine(seed: number, base: number, amp: number, rough = 0.6, n = 128): number[] {
  const r = rng(seed);
  const ys = new Array(n + 1).fill(0);
  ys[0] = base - r() * amp;
  ys[n] = base - r() * amp;
  for (let step = n, a = amp; step > 1; step /= 2, a *= rough) {
    for (let i = step / 2; i < n; i += step) ys[i] = (ys[i - step / 2] + ys[i + step / 2]) / 2 + (r() - 0.5) * 2 * a;
  }
  return ys;
}
type PeakDef = { x: number; h: number; wl: number; wr: number };
/**
 * One mountain layer: the ridge is the upper envelope of slightly concave peak profiles
 * (left/right slopes differ) plus fine rocky noise. Each peak gets a snow cap on its
 * upper third with a jagged lower edge, like real snow lines.
 */
function layer(seed: number, base: number, peaks: PeakDef[]) {
  const r = rng(seed);
  const step = 6;
  const n = Math.round(1440 / step);
  const noise = ridgeLine(seed + 3, 0, 4, 0.6, 256);
  const ridgeAt = (x: number) => {
    let lift = 0;
    for (const p of peaks) {
      const w = x < p.x ? p.wl : p.wr;
      const u = Math.abs(x - p.x) / w;
      if (u < 1) lift = Math.max(lift, p.h * Math.pow(1 - u, 1.18));
    }
    return base - lift;
  };
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = i * step;
    pts.push([x, ridgeAt(x) + noise[Math.round((i / n) * 256)] * (ridgeAt(x) < base - 4 ? 1 : 0.3)]);
  }
  for (const p of peaks) pts.push([p.x, ridgeAt(p.x) + 1.5]);   // exact summit point keeps peaks crisp
  pts.sort((a, b) => a[0] - b[0]);
  const line = pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const body = `M0 380 ${line} L1440 380Z`;
  // snow caps
  const snow = peaks
      .map((p) => {
        const top = ridgeAt(p.x);
        const depth = p.h * (0.26 + r() * 0.1);
        const teeth = 5;
        const x0 = p.x - p.wl * 0.42, x1 = p.x + p.wr * 0.42;
        const capY = (x: number) => {
          const k = (x - x0) / (x1 - x0);
          const tooth = Math.abs(((k * teeth) % 1) - 0.5) * 2;           // 1 at tooth tips, 0 between
          const centre = 1 - Math.abs(k - 0.5) * 2;                      // deeper in the middle
          return top + depth * (0.45 + 0.55 * centre) + tooth * depth * 0.22;
        };
        const seg: [number, number][] = [];
        for (let x = x0; x <= x1; x += 4) {
          const ry = ridgeAt(x), cy = capY(x);
          if (ry < cy) seg.push([x, ry]);
        }
        if (seg.length < 3) return "";
        const topEdge = [[p.x, top + 1.5] as [number, number], ...seg].sort((a, b) => a[0] - b[0]);
        const bottom = seg.map(([x]) => [x, capY(x)] as [number, number]).reverse();
        return "M" + [...topEdge, ...bottom].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + "Z";
      })
      .join(" ");
  return { body, snow };
}
const MOUNTAINS = [
  {
    ...layer(7, 320, [
      { x: 90, h: 175, wl: 230, wr: 190 }, { x: 330, h: 225, wl: 210, wr: 250 }, { x: 610, h: 160, wl: 200, wr: 180 },
      { x: 860, h: 240, wl: 240, wr: 220 }, { x: 1120, h: 185, wl: 200, wr: 230 }, { x: 1360, h: 215, wl: 210, wr: 200 },
    ]),
    top: "#dc6e73", bottom: "#a3171c", opacity: 0.34, snowOpacity: 0.22,
  },
  {
    ...layer(21, 340, [
      { x: 0, h: 120, wl: 160, wr: 200 }, { x: 220, h: 150, wl: 180, wr: 170 }, { x: 470, h: 120, wl: 170, wr: 190 },
      { x: 730, h: 165, wl: 200, wr: 180 }, { x: 990, h: 130, wl: 170, wr: 200 }, { x: 1240, h: 160, wl: 190, wr: 180 }, { x: 1440, h: 120, wl: 180, wr: 160 },
    ]),
    top: "#c4434a", bottom: "#a3171c", opacity: 0.45, snowOpacity: 0.28,
  },
  {
    ...layer(42, 360, [
      { x: 120, h: 80, wl: 150, wr: 140 }, { x: 380, h: 95, wl: 160, wr: 150 }, { x: 640, h: 70, wl: 140, wr: 160 },
      { x: 900, h: 90, wl: 150, wr: 150 }, { x: 1160, h: 75, wl: 150, wr: 140 }, { x: 1400, h: 90, wl: 150, wr: 150 },
    ]),
    top: "#a5242a", bottom: "#a3171c", opacity: 0.5, snowOpacity: 0.3,
  },
];

/** a sparse row of our decorated trees (still frames) along the foot of the mountains, right of Santa */
const FOREST = [
  { left: "57%", w: 42, b: 96 }, { left: "66%", w: 50, b: 90 }, { left: "75%", w: 38, b: 100 },
  { left: "84%", w: 46, b: 92 }, { left: "93%", w: 40, b: 98 },
];

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
        top: `${104 + y}px`,
        color: BULB_COLORS[i % 4],
        delay: `${(i % 4) * 0.6}s`,
      };
    })
);
</script>
