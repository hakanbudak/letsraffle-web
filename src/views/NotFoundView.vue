<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
    
    <div class="absolute -left-20 top-10 w-56 h-56 rounded-full bg-yellow-200/20 blur-3xl"></div>
    <div class="absolute -right-24 top-24 w-64 h-64 rounded-full bg-red-300/25 blur-3xl"></div>
    <div class="absolute right-10 bottom-10 w-40 h-40 rounded-full bg-green-300/20 blur-2xl"></div>
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-200/10 blur-3xl"></div>

    <ChristmasTree
        variant="large"
        customClass="absolute left-10 bottom-0 translate-y-8 opacity-40" />
    <ChristmasTree
        variant="small"
        customClass="absolute right-10 bottom-0 translate-y-4 opacity-40" />

    <DecorativeLight
        class="absolute top-1/4 left-1/4 bg-yellow-300 shadow-yellow-300/50"
        :size="12"
        variant="twinkle" />
    <DecorativeLight
        class="absolute top-1/3 right-1/4 bg-red-300 shadow-red-300/50"
        :size="8"
        variant="delayed" />
    <DecorativeLight
        class="absolute bottom-1/3 left-1/3 bg-green-300 shadow-green-300/50"
        :size="8"
        variant="twinkle" />

    <div class="relative z-10 w-full max-w-4xl px-4 md:px-8 text-center">
      <div class="bg-white/95 backdrop-blur-md border border-red-200 rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.4)] px-6 py-8 md:px-12 md:py-16">
        <div class="space-y-6">
          <div class="flex items-center justify-center gap-2 md:gap-4">
            <span class="text-9xl md:text-[12rem] font-bold text-red-600 drop-shadow-lg">4</span>
            <div class="flex-shrink-0">
              <SantaSadAvatar :size="120" />
            </div>
            <span class="text-9xl md:text-[12rem] font-bold text-red-600 drop-shadow-lg">4</span>
          </div>

          <h1 class="text-3xl md:text-5xl font-bold text-red-700 mb-4">
            {{ t("notFound.title") }}
          </h1>

          <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {{ t("notFound.description") }}
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
                type="button"
                @click="goHome"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-base md:text-lg font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {{ t("notFound.goHome") }}
            </button>
            
            <button
                type="button"
                @click="goBack"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-red-600 text-red-600 text-base md:text-lg font-semibold hover:bg-red-50 hover:border-red-700 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ t("notFound.goBack") }}
            </button>
          </div>

          <p class="text-sm md:text-base text-slate-500 mt-8 pt-6 border-t border-red-100">
            {{ t("notFound.funMessage") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChristmasTree from '@/components/christmas/ChristmasTree.vue'
import DecorativeLight from '@/components/christmas/DecorativeLight.vue'
import SantaSadAvatar from '@/components/christmas/SantaSadAvatar.vue'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/').catch(() => undefined)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/').catch(() => undefined)
  }
}
</script>


