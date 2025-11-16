<template>
  <div
      class="relative w-full bg-[#f9d9de]/95 backdrop-blur-md border border-red-200
           rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.5)] px-6 py-8 md:px-10 md:py-10
           min-h-[860px] flex flex-col md:flex-row gap-8 md:gap-10">
    <div
        class="w-full md:w-1/3 bg-[#fbdde2] rounded-3xl border border-red-200/60
             p-4 md:p-5 flex flex-col gap-3">
      <div class="h-4 w-24 rounded-full bg-red-300/70 mb-2"></div>

      <div class="flex-1 flex flex-col gap-3">
        <div class="h-10 rounded-2xl bg-green-200/90 border border-emerald-200"></div>
        <div class="h-10 rounded-2xl bg-green-200/90 border border-emerald-200"></div>
        <div class="h-10 rounded-2xl bg-green-200/90 border border-emerald-200"></div>
        <div class="h-10 rounded-2xl bg-green-200/90 border border-emerald-200"></div>
      </div>
    </div>

    <div class="w-full md:flex-1 bg-white rounded-3xl border border-red-100 p-5 md:p-8">
      <div class="mb-5 text-center md:text-left">
        <p class="text-xs uppercase tracking-[0.35em] text-red-500">
          Santa's Draw
        </p>
        <h2 class="mt-2 text-2xl md:text-3xl font-bold text-red-700">
          Çekilişini Yönet
        </h2>
        <p class="mt-1 text-sm text-slate-600">
          Katılımcılarını ekle, kuralları belirle ve çekilişini başlat. 🎁
        </p>
      </div>

      <div
          class="grid gap-4 md:gap-5 md:grid-cols-1">
        <div
            class="rounded-2xl border border-red-200 bg-gradient-to-br from-white to-red-50
                 p-4 md:p-5 text-center">
          <p class="text-sm text-slate-700">
            Buraya “çekilişi başlat” akışını, butonları ve özet bilgileri ekleyeceğiz.
          </p>
        </div>

        <div
            class="rounded-2xl border border-emerald-300 bg-gradient-to-br from-white to-emerald-50
                 p-4 md:p-5 text-center">
          <p class="text-sm text-slate-700">
            İkinci kutu da kurallar / ayarlar / geçmiş çekilişler için kullanılabilir.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
