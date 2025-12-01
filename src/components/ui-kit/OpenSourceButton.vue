<template>
  <div class="fixed bottom-5 right-5 flex flex-col items-end gap-2.5 z-50 font-inter group">
    <div class="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center gap-2 cursor-pointer transition-all duration-300 border border-black/5 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
      <span class="text-base">❤️</span>
      <span class="font-semibold text-slate-700 text-sm">Open Source</span>
    </div>

    <div class="absolute bottom-full right-0 bg-white p-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-1 opacity-0 invisible translate-y-2.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mb-2.5 min-w-[140px] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
      <a
          href="https://github.com/hakanbudak/letsraffle-web"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between px-3 py-2 no-underline text-slate-600 rounded-lg transition-colors duration-200 text-[0.85rem] font-medium hover:bg-slate-50 hover:text-slate-800"
      >
        <span>Frontend</span>
        <IconGithub :width="16" :height="16" stroke-class="stroke-current" />
      </a>

      <a
          href="https://github.com/selamet/letsraffle-api"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between px-3 py-2 no-underline text-slate-600 rounded-lg transition-colors duration-200 text-[0.85rem] font-medium hover:bg-slate-50 hover:text-slate-800"
      >
        <span>Backend</span>
        <IconGithub :width="16" :height="16" stroke-class="stroke-current" />
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import IconGithub from "@/components/icons/IconGithub.vue";
</script>