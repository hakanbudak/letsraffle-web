<template>
  <div
      v-if="hasFetched"
      class="w-full bg-gradient-to-br from-red-50 to-green-50 rounded-2xl md:rounded-3xl border border-red-100 p-4 md:p-8 flex flex-col max-h-[520px] md:max-h-[380px] overflow-hidden">


    <div v-if="isLoading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p class="mt-2 text-xs text-slate-600">{{ t("participantsPanel.loading") }}</p>
      </div>
    </div>

    <div v-else-if="activeDraws.length === 0" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center space-y-4 max-w-xs">
        <div class="text-6xl">🎅</div>
        <p class="text-slate-600 text-sm">
          {{ t("participantsPanel.emptyState") }}
        </p>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col gap-2 md:gap-3 overflow-y-auto pr-1 md:pr-2">
      <button
          v-for="draw in activeDraws"
          :key="draw.id"
          type="button"
          :class="[
            'text-left rounded-xl md:rounded-2xl border-2 p-3 md:p-4 transition-all cursor-pointer',
            selectedDrawId === draw.id 
              ? 'bg-white border-red-400 shadow-lg ring-2 ring-red-200' 
              : 'bg-white/80 border-red-200 hover:bg-white hover:shadow-md'
          ]"
          @click="handleDrawClick(draw)">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span
                  :class="[
                    'text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide',
                    draw.status === 'active' || draw.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                    draw.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  ]">
                {{ t(`participantsPanel.status.${draw.status}`) }}
              </span>
            </div>
            <div class="mb-2">
              <p class="text-sm font-bold text-red-700">
                {{ draw.inviteCode }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ t(`participantsPanel.drawType.${draw.drawType}`) }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ t("participantsPanel.participantCount", { count: draw.participantCount }) }}
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <span class="text-red-500 text-lg">→</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useUserDraws } from "@/composables/draw/useUserDraws";
import type { DrawDetail, DrawListItem } from "./types";

const { t } = useI18n();
const { activeDraws, isLoading, hasFetched, fetchDrawDetail } = useUserDraws();
const selectedDrawId = ref<number | null>(null);

const emit = defineEmits<{
  (e: "draw-selected", drawDetail: DrawDetail): void;
}>();

const handleDrawClick = async (draw: DrawListItem) => {
  selectedDrawId.value = draw.id;
  const drawDetail = await fetchDrawDetail(draw.inviteCode);
  if (drawDetail) {
    emit("draw-selected", drawDetail);
  }
};
</script>

<style scoped>
</style>
