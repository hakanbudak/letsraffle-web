<template>
  <!-- small door wreath pinned where two arcs of the light garland meet: bow on top (where the wire hangs), year inside -->
  <svg :width="size" :height="size" viewBox="0 0 60 60" aria-hidden="true" class="garland-wreath overflow-visible">
    <defs>
      <radialGradient :id="`wr-${uid}`" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#3f9a63" />
        <stop offset="1" stop-color="#1f5c3e" />
      </radialGradient>
    </defs>
    <!-- ring of needles -->
    <circle cx="30" cy="34" r="19" fill="none" :stroke="`url(#wr-${uid})`" stroke-width="10" />
    <g fill="#2f7a55">
      <ellipse v-for="(l, i) in leaves" :key="i" :cx="l.x" :cy="l.y" rx="5" ry="2.5" :transform="`rotate(${l.r} ${l.x} ${l.y})`" />
    </g>
    <g fill="#5fb37f" opacity="0.75">
      <ellipse v-for="(l, i) in leaves.filter((_, j) => j % 2)" :key="`h${i}`" :cx="l.x" :cy="l.y - 1" rx="2.8" ry="1.1" :transform="`rotate(${l.r} ${l.x} ${l.y})`" />
    </g>
    <!-- berries -->
    <g fill="#e6343a" stroke="#7a0f14" stroke-width="0.8">
      <circle cx="13" cy="40" r="2.6" /><circle cx="16" cy="45" r="2.2" />
      <circle cx="47" cy="40" r="2.6" /><circle cx="44" cy="45" r="2.2" />
      <circle cx="30" cy="54" r="2.4" />
    </g>
    <!-- year in the middle -->
    <text x="30" y="37.8" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="10" fill="#f6d98a" stroke="#7a0f14" stroke-width="2.4" paint-order="stroke">{{ year }}</text>
    <!-- bow on top -->
    <g stroke="#7a0f14" stroke-width="1.2" stroke-linejoin="round">
      <path d="M30 13 L24 24 L27.5 23.5 L28.5 27 L31 15Z" fill="#c4242a" />
      <path d="M30 13 L36 24 L32.5 23.5 L31.5 27 L29 15Z" fill="#c4242a" />
      <path d="M30 13 C22 5 15 7 17 13 C19 19 26 16 30 13Z" fill="#d9363c" />
      <path d="M30 13 C38 5 45 7 43 13 C41 19 34 16 30 13Z" fill="#d9363c" />
      <circle cx="30" cy="13" r="3.4" fill="#e6343a" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number; year?: string | number; uid?: string }>(), { size: 44, year: 2027, uid: "w" });

const leaves = Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * Math.PI * 2;
  const r = i % 2 ? 22.5 : 16;
  return { x: 30 + Math.cos(a) * r, y: 34 + Math.sin(a) * r, r: (a * 180) / Math.PI + 90 + (i % 2 ? 25 : -25) };
});
</script>

<style scoped>
.garland-wreath {
  transform-origin: 50% 22%;
  animation: wreath-sway 5s ease-in-out infinite;
  filter: drop-shadow(0 3px 3px rgba(40, 0, 0, 0.3));
}
@keyframes wreath-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .garland-wreath { animation: none; }
}
</style>
